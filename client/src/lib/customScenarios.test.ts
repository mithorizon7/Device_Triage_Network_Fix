import { describe, it, expect } from "vitest";
import { createEmptyScenario, sanitizeScenarioNetworkIds } from "./customScenarios";

const createDevice = (overrides: Partial<ReturnType<typeof createEmptyScenario>['devices'][number]> = {}) => ({
  id: "device-1",
  type: "laptop",
  label: "Test Device",
  networkId: "main",
  riskFlags: [],
  ...overrides
});

describe("sanitizeScenarioNetworkIds", () => {
  it("moves devices with invalid networkId to main and reports them", () => {
    const scenario = createEmptyScenario();
    scenario.devices = [
      createDevice({ id: "device-invalid", networkId: "unknown-zone" })
    ];

    const result = sanitizeScenarioNetworkIds(scenario);

    expect(result.invalidDeviceIds).toEqual(["device-invalid"]);
    expect(result.scenario.devices[0].networkId).toBe("main");
  });

  it("returns original scenario when all devices have valid networkId", () => {
    const scenario = createEmptyScenario();
    scenario.devices = [createDevice({ id: "device-valid", networkId: "guest" })];

    const result = sanitizeScenarioNetworkIds(scenario);

    expect(result.invalidDeviceIds).toEqual([]);
    expect(result.scenario).toBe(scenario);
  });
});
