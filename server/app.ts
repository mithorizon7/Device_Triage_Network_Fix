import express, { type ErrorRequestHandler } from "express";
import { createServer } from "node:http";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";

export const handleServerError: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);
  const candidate = Number(error?.status ?? error?.statusCode);
  const status =
    Number.isInteger(candidate) && candidate >= 400 && candidate <= 599 ? candidate : 500;
  if (status >= 500) console.error("Request failed", { status });
  res.status(status).json({ message: status >= 500 ? "Internal Server Error" : "Request failed" });
};

export async function createApp({
  production = process.env.NODE_ENV === "production",
  staticDirectory,
  log = (_message: string) => {},
}: { production?: boolean; staticDirectory?: string; log?: (message: string) => void } = {}) {
  const app = express();
  const httpServer = createServer(app);
  app.disable("x-powered-by");
  app.set("query parser", "simple");

  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    });
    if (production) {
      res.set("Strict-Transport-Security", "max-age=15552000");
      res.set(
        "Content-Security-Policy",
        [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob:",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'none'",
          "frame-ancestors 'none'",
          "form-action 'self'",
        ].join("; ")
      );
    }
    next();
  });

  // This application has read-only endpoints; do not parse unneeded request bodies.
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.set("Allow", "GET, HEAD").status(405).json({ message: "Method not allowed" });
      return;
    }
    const start = Date.now();
    if (req.path.startsWith("/api/")) {
      const path = Array.from(req.path)
        .filter((character) => character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127)
        .join("")
        .slice(0, 200);
      res.on("finish", () =>
        log(`${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`)
      );
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.set("Cache-Control", "no-store").json({
      status: "ok",
      revision: process.env.APP_BUILD_SHA ?? null,
      dirty: process.env.APP_BUILD_DIRTY === "true",
    });
  });
  await registerRoutes(httpServer, app);
  app.use("/api", (_req, res) => res.status(404).json({ message: "API endpoint not found" }));
  if (production) serveStatic(app, staticDirectory);
  app.use(handleServerError);
  return { app, httpServer };
}
