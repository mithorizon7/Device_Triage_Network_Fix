import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);
const isProduction = process.env.NODE_ENV === "production";

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.disable("x-powered-by");
app.set("query parser", "simple");

app.use(
  express.json({
    limit: "100kb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 100 }));

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: unknown;
  const shouldCaptureBody = !isProduction;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    if (shouldCaptureBody) {
      capturedJsonResponse = bodyJson;
    }
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (shouldCaptureBody && capturedJsonResponse !== undefined) {
        try {
          const serialized = JSON.stringify(capturedJsonResponse);
          const maxLength = 750;
          logLine +=
            serialized.length > maxLength
              ? ` :: ${serialized.slice(0, maxLength)}…(truncated)`
              : ` :: ${serialized}`;
        } catch {
          logLine += " :: [unserializable response body]";
        }
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status =
      typeof err === "object" && err !== null && "status" in err
        ? Number((err as { status?: unknown }).status) || 500
        : typeof err === "object" && err !== null && "statusCode" in err
          ? Number((err as { statusCode?: unknown }).statusCode) || 500
          : 500;
    const message =
      status >= 500
        ? "Internal Server Error"
        : typeof err === "object" && err !== null && "message" in err
          ? String((err as { message?: unknown }).message || "Request failed")
          : "Request failed";

    if (status >= 500) {
      console.error("Unhandled server error:", err);
    }

    if (res.headersSent) {
      return;
    }

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.requestTimeout = 30_000;
  httpServer.headersTimeout = 35_000;

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})().catch((error) => {
  console.error("Fatal server startup error:", error);
  process.exit(1);
});
