import type { Express } from "express";
import { createServer, type Server } from "http";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const scenariosDir = join(process.cwd(), "server", "scenarios");

function loadScoringRules() {
  const rulesPath = join(scenariosDir, "scoringRules.json");
  const content = readFileSync(rulesPath, "utf-8");
  return JSON.parse(content);
}

function loadControlsRegistry() {
  const registryPath = join(scenariosDir, "controlsRegistry.json");
  const content = readFileSync(registryPath, "utf-8");
  return JSON.parse(content);
}

function loadScenarios() {
  const files = readdirSync(scenariosDir).filter(
    (f) => f.endsWith(".json") && f !== "scoringRules.json"
  );
  return files.map((file) => {
    const content = readFileSync(join(scenariosDir, file), "utf-8");
    return JSON.parse(content);
  });
}

function loadScenarioById(id: string) {
  const files = readdirSync(scenariosDir).filter(
    (f) => f.endsWith(".json") && f !== "scoringRules.json"
  );
  for (const file of files) {
    const content = readFileSync(join(scenariosDir, file), "utf-8");
    const scenario = JSON.parse(content);
    if (scenario.id === id) {
      return scenario;
    }
  }
  return undefined;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/scenarios", (_req, res) => {
    try {
      const scenarios = loadScenarios();
      const summaries = scenarios.map((s: { id: string; title: string; environment: { type: string } }) => ({
        id: s.id,
        title: s.title,
        environment: { type: s.environment.type }
      }));
      res.json(summaries);
    } catch (error) {
      console.error("Error loading scenarios:", error);
      res.status(500).json({ error: "Failed to load scenarios" });
    }
  });

  app.get("/api/scenarios/:id", (req, res) => {
    try {
      const scenario = loadScenarioById(req.params.id);
      if (!scenario) {
        res.status(404).json({ error: "Scenario not found" });
        return;
      }
      res.json(scenario);
    } catch (error) {
      console.error("Error loading scenario:", error);
      res.status(500).json({ error: "Failed to load scenario" });
    }
  });

  app.get("/api/scoring-rules", (_req, res) => {
    try {
      const rules = loadScoringRules();
      res.json(rules);
    } catch (error) {
      console.error("Error loading scoring rules:", error);
      res.status(500).json({ error: "Failed to load scoring rules" });
    }
  });

  app.get("/api/controls-registry", (_req, res) => {
    try {
      const registry = loadControlsRegistry();
      res.json(registry);
    } catch (error) {
      console.error("Error loading controls registry:", error);
      res.status(500).json({ error: "Failed to load controls registry" });
    }
  });

  return httpServer;
}
