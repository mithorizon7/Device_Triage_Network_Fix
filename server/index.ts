import { createApp, handleServerError } from "./app";

export function log(message: string, source = "express") {
  console.log(`${new Date().toISOString()} [${source}] ${message}`);
}

async function start() {
  const production = process.env.NODE_ENV === "production";
  const { app, httpServer } = await createApp({ production, log });
  if (!production) {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
    app.use(handleServerError);
  }
  const port = Number(process.env.PORT ?? 5000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  httpServer.requestTimeout = 30_000;
  httpServer.headersTimeout = 35_000;
  httpServer.listen(
    { port, host: process.env.HOST ?? (production ? "0.0.0.0" : "127.0.0.1") },
    () => {
      log(
        JSON.stringify({
          revision: process.env.APP_BUILD_SHA ?? null,
          dirty: process.env.APP_BUILD_DIRTY === "true",
          node: process.versions.node,
          openssl: process.versions.openssl,
        }),
        "release"
      );
      log(`serving on port ${port}`);
    }
  );
  httpServer.on("error", () => {
    console.error("Server could not start");
    process.exitCode = 1;
  });
}

void start().catch(() => {
  console.error("Fatal server startup error");
  process.exitCode = 1;
});
