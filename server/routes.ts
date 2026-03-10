import type { Express } from "express";
import type { Server } from "http";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import {
  controlsRegistrySchema,
  scenarioSchema,
  type ControlsRegistry,
  type Scenario,
} from "../shared/schema";

const scenariosDir = join(process.cwd(), "server", "scenarios");
const SCENARIO_ID_PATTERN = /^[a-zA-Z0-9._-]{1,120}$/;
const isProduction = process.env.NODE_ENV === "production";

interface ScenarioDataCache {
  scenarios: Scenario[];
  scenarioById: Map<string, Scenario>;
  controlsRegistry: ControlsRegistry;
  scoringRules: unknown;
}

let cachedData: ScenarioDataCache | null = null;

function readJsonFile(filePath: string): unknown {
  const content = readFileSync(filePath, "utf-8");
  return JSON.parse(content);
}

function loadScoringRules(): unknown {
  return readJsonFile(join(scenariosDir, "scoringRules.json"));
}

function loadControlsRegistry(): ControlsRegistry {
  return controlsRegistrySchema.parse(readJsonFile(join(scenariosDir, "controlsRegistry.json")));
}

function loadScenarios(): Scenario[] {
  const files = readdirSync(scenariosDir)
    .filter(
      (f) => f.endsWith(".json") && f !== "scoringRules.json" && f !== "controlsRegistry.json"
    )
    .sort();

  return files.map((file) => scenarioSchema.parse(readJsonFile(join(scenariosDir, file))));
}

function buildScenarioDataCache(): ScenarioDataCache {
  const scenarios = loadScenarios();
  const scenarioById = new Map<string, Scenario>();

  for (const scenario of scenarios) {
    if (scenarioById.has(scenario.id)) {
      throw new Error(`Duplicate scenario id detected: ${scenario.id}`);
    }
    scenarioById.set(scenario.id, scenario);
  }

  return {
    scenarios,
    scenarioById,
    controlsRegistry: loadControlsRegistry(),
    scoringRules: loadScoringRules(),
  };
}

function getScenarioDataCache(): ScenarioDataCache {
  // Reload on each request in development for faster iteration, cache in production.
  if (!isProduction) {
    return buildScenarioDataCache();
  }
  if (!cachedData) {
    cachedData = buildScenarioDataCache();
  }
  return cachedData;
}

function parseScenarioId(rawId: string | undefined): string | null {
  const value = (rawId ?? "").trim();
  return SCENARIO_ID_PATTERN.test(value) ? value : null;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/scenarios", (_req, res) => {
    try {
      const { scenarios } = getScenarioDataCache();
      const summaries = scenarios.map((scenario) => ({
        id: scenario.id,
        title: scenario.title,
        environment: { type: scenario.environment.type },
      }));
      res.json(summaries);
    } catch (error) {
      console.error("Error loading scenarios:", error);
      res.status(500).json({ error: "Failed to load scenarios" });
    }
  });

  app.get("/api/scenarios/:id", (req, res) => {
    try {
      const scenarioId = parseScenarioId(req.params.id);
      if (!scenarioId) {
        res.status(400).json({ error: "Invalid scenario id" });
        return;
      }

      const { scenarioById } = getScenarioDataCache();
      const scenario = scenarioById.get(scenarioId);
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
      const { scoringRules } = getScenarioDataCache();
      res.json(scoringRules);
    } catch (error) {
      console.error("Error loading scoring rules:", error);
      res.status(500).json({ error: "Failed to load scoring rules" });
    }
  });

  app.get("/api/controls-registry", (_req, res) => {
    try {
      const { controlsRegistry } = getScenarioDataCache();
      res.json(controlsRegistry);
    } catch (error) {
      console.error("Error loading controls registry:", error);
      res.status(500).json({ error: "Failed to load controls registry" });
    }
  });

  return httpServer;
}
