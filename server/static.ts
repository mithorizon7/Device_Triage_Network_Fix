import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express, directory?: string) {
  const distPath = directory ?? path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath, { dotfiles: "deny" }));

  // fall through to index.html if the file doesn't exist
  app.get("*", (req, res, next) => {
    if (
      req.path.startsWith("/assets/") ||
      req.path.split("/").some((part) => part.startsWith("."))
    ) {
      res.status(404).end();
      return;
    }
    res.set("Cache-Control", "no-cache");
    res.sendFile(path.resolve(distPath, "index.html"), (error) => {
      if (error) next(error);
    });
  });
}
