import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { SCENARIO_LIMITS, scenarioSchema, controlsRegistrySchema } from "@shared/schema";
import { createEmptyScenario } from "./customScenarios";

const device = { id: "one", type: "tv", label: "TV", networkId: "main", riskFlags: [] };

describe("bounded scenario validation", () => {
  it.each(["family_iot_sprawl_v1", "small_office_v1", "hotel_public_v1"])(
    "preserves the shipped %s scenario",
    (id) => {
      const fixture = JSON.parse(readFileSync(`server/scenarios/${id}.json`, "utf8"));
      expect(scenarioSchema.parse(fixture)).toEqual(fixture);
    }
  );

  it("retains control-category records after the Zod 4 migration", () => {
    const fixture = JSON.parse(readFileSync("server/scenarios/controlsRegistry.json", "utf8"));
    expect(controlsRegistrySchema.parse(fixture)).toEqual(fixture);
  });

  it.each([
    ["devices", SCENARIO_LIMITS.devices],
    ["networks", SCENARIO_LIMITS.networks],
    ["learningObjectives", SCENARIO_LIMITS.objectives],
  ] as const)("rejects excessive %s before inspecting any elements", (field, limit) => {
    const values = Array.from({ length: limit + 1 }, () => null);
    Object.defineProperty(values, "0", {
      get: () => {
        throw new Error("Element validation must not run");
      },
    });
    const result = scenarioSchema.safeParse({ ...createEmptyScenario(), [field]: values });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toHaveLength(1);
      expect(result.error.issues[0].path).toEqual([field]);
    }
  });

  it("rejects excessive win requirements and risk flags with a single issue", () => {
    for (const scenario of [
      { ...createEmptyScenario(), suggestedWinConditions: { requires: Array(15).fill(null) } },
      { ...createEmptyScenario(), devices: [{ ...device, riskFlags: Array(5).fill(null) }] },
    ]) {
      const result = scenarioSchema.safeParse(scenario);
      expect(result.success).toBe(false);
      if (!result.success) expect(result.error.issues).toHaveLength(1);
    }
  });

  it("accepts boundary-sized valid collections and text", () => {
    const scenario = {
      ...createEmptyScenario(),
      title: "t".repeat(SCENARIO_LIMITS.title),
      environment: { type: "home", notes: "n".repeat(SCENARIO_LIMITS.notes) },
      devices: Array.from({ length: SCENARIO_LIMITS.devices }, (_, i) => ({
        ...device,
        id: `d${i}`,
      })),
      learningObjectives: Array(SCENARIO_LIMITS.objectives).fill(
        "o".repeat(SCENARIO_LIMITS.objective)
      ),
    };
    expect(scenarioSchema.safeParse(scenario).success).toBe(true);
  });

  it.each([
    { title: " " },
    { title: "t".repeat(SCENARIO_LIMITS.title + 1) },
    { environment: { type: "home", notes: "n".repeat(SCENARIO_LIMITS.notes + 1) } },
    { devices: [{ ...device, label: "" }] },
    { devices: [device, device] },
    { networks: [] },
    { suggestedWinConditions: { maxTotalRisk: -1 } },
    { suggestedWinConditions: { maxTotalRisk: 101 } },
    { suggestedWinConditions: { requires: [{ control: "nonexistent", value: true }] } },
  ])("rejects invalid names, identifiers, zones and win conditions: %j", (overrides) => {
    expect(scenarioSchema.safeParse({ ...createEmptyScenario(), ...overrides }).success).toBe(
      false
    );
  });

  it("rejects duplicate or unsupported network zones", () => {
    const scenario = createEmptyScenario();
    expect(
      scenarioSchema.safeParse({
        ...scenario,
        networks: [scenario.networks[0], scenario.networks[0]],
      }).success
    ).toBe(false);
    expect(
      scenarioSchema.safeParse({
        ...scenario,
        networks: [{ ...scenario.networks[0], id: "other" }],
      }).success
    ).toBe(false);
  });

  it("rejects nested collection data without recursively traversing it", () => {
    let nested: unknown = null;
    for (let i = 0; i < 100; i++) nested = [nested];
    const result = scenarioSchema.safeParse({
      ...createEmptyScenario(),
      learningObjectives: [nested],
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues).toHaveLength(1);
  });
});
