import { afterEach, describe, it, expect, vi } from "vitest";
import {
  createEmptyScenario,
  getCustomScenarios,
  saveCustomScenario,
  deleteCustomScenario,
  sanitizeScenarioNetworkIds,
} from "./customScenarios";

afterEach(() => vi.unstubAllGlobals());

describe("stored scenario validation", () => {
  it.each(["null", "{}", "[null]", "[{}]", "not-json"])(
    "rejects malformed stored data: %s",
    (stored) => {
      vi.stubGlobal("localStorage", { getItem: () => stored });
      expect(getCustomScenarios()).toEqual([]);
    }
  );
  it("preserves valid scenarios alongside invalid entries", () => {
    const scenario = createEmptyScenario();
    vi.stubGlobal("localStorage", { getItem: () => JSON.stringify([null, scenario, {}]) });
    expect(getCustomScenarios()).toEqual([scenario]);
  });
  it("rejects oversized stored payloads before parsing", () => {
    vi.stubGlobal("localStorage", { getItem: () => " ".repeat(1_000_001) });
    expect(getCustomScenarios()).toEqual([]);
  });
  it("reports quota failures without claiming a scenario was saved", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    });
    expect(saveCustomScenario(createEmptyScenario())).toBe(false);
  });
  it("rejects a save that exceeds the aggregate read limit without writing", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => null, setItem });
    const scenario = createEmptyScenario();
    scenario.title = "x".repeat(1_000_001);
    expect(saveCustomScenario(scenario)).toBe(false);
    expect(setItem).not.toHaveBeenCalled();
  });
  it("does not overwrite legacy oversized storage on save or delete", () => {
    const setItem = vi.fn();
    vi.stubGlobal("localStorage", { getItem: () => " ".repeat(1_000_001), setItem });
    expect(saveCustomScenario(createEmptyScenario())).toBe(false);
    expect(deleteCustomScenario("fixture")).toBe(false);
    expect(setItem).not.toHaveBeenCalled();
  });
  it("saves and reloads a valid scenario", () => {
    let stored: string | null = null;
    vi.stubGlobal("localStorage", {
      getItem: () => stored,
      setItem: (_key: string, value: string) => {
        stored = value;
      },
    });
    const scenario = createEmptyScenario();
    expect(saveCustomScenario(scenario)).toBe(true);
    expect(getCustomScenarios()).toEqual([scenario]);
  });
});

const createDevice = (
  overrides: Partial<ReturnType<typeof createEmptyScenario>["devices"][number]> = {}
) => ({
  id: "device-1",
  type: "laptop",
  label: "Test Device",
  networkId: "main",
  riskFlags: [],
  ...overrides,
});

describe("sanitizeScenarioNetworkIds", () => {
  it("moves devices with invalid networkId to main and reports them", () => {
    const scenario = createEmptyScenario();
    scenario.devices = [createDevice({ id: "device-invalid", networkId: "unknown-zone" })];

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
