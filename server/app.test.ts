import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";
import { createApp, handleServerError } from "./app";

describe("production HTTP security", () => {
  let directory: string;
  let server: Server;
  let origin: string;
  beforeAll(async () => {
    directory = await mkdtemp(join(tmpdir(), "triage-http-"));
    await writeFile(join(directory, "index.html"), "<!doctype html><title>Fixture</title>");
    await writeFile(join(directory, ".env"), "fixture-only");
    ({ httpServer: server } = await createApp({ production: true, staticDirectory: directory }));
    server.listen(0, "127.0.0.1");
    await once(server, "listening");
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });
  afterAll(async () => {
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()));
    if (directory) await rm(directory, { recursive: true, force: true });
  });
  it("exposes a non-cacheable release health check without environment details", async () => {
    const response = await fetch(origin + "/api/health");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ status: "ok", revision: null, dirty: false });
  });
  it.each(["/", "/author", "/api/scenarios", "/api/unknown"])(
    "sets security headers on %s",
    async (path) => {
      const response = await fetch(origin + path);
      expect(response.headers.get("x-powered-by")).toBeNull();
      expect(response.headers.get("x-content-type-options")).toBe("nosniff");
      expect(response.headers.get("strict-transport-security")).toBe("max-age=15552000");
      const policy = response.headers.get("content-security-policy");
      expect(policy).toContain("script-src 'self'");
      expect(policy).toContain("frame-ancestors 'none'");
      expect(policy).not.toContain("unsafe-eval");
    }
  );
  it("serves real scenarios and rejects filesystem-style IDs", async () => {
    const response = await fetch(origin + "/api/scenarios");
    const scenarios = await response.json();
    expect(scenarios.length).toBe(3);
    expect((await fetch(origin + "/api/scenarios/" + scenarios[0].id)).status).toBe(200);
    expect((await fetch(origin + "/api/scenarios/%2e%2e%2fpackage.json")).status).toBe(400);
  });
  it("returns JSON 404 for unknown APIs rather than the SPA", async () => {
    const response = await fetch(origin + "/api/unknown");
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toContain("application/json");
  });
  it.each(["POST", "PUT", "DELETE", "PATCH", "OPTIONS"])(
    "rejects unsupported %s without parsing bodies",
    async (method) => {
      const response = await fetch(origin + "/api/scenarios", {
        method,
        body: "{invalid",
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status).toBe(405);
      expect(response.headers.get("allow")).toBe("GET, HEAD");
      expect(response.headers.get("x-frame-options")).toBe("DENY");
    }
  );
  it.each(["/.env", "/.git/config", "/assets/missing.js"])(
    "does not fall back to HTML for %s",
    async (path) => {
      expect((await fetch(origin + path)).status).toBe(404);
    }
  );
  it("serves deep links without permanently caching the entry point", async () => {
    const response = await fetch(origin + "/author");
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-cache");
  });
});

it("normalizes invalid error status codes and suppresses internal messages", async () => {
  const app = express();
  app.get("/", () => {
    throw { status: 999, message: "internal fixture value" };
  });
  app.use(handleServerError);
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const response = await fetch(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain("internal fixture value");
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
