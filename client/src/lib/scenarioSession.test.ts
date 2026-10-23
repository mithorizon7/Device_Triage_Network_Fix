import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { scenarioSchema } from "@shared/schema";
import { createInitialScenarioState, getScenarioSessionKey } from "./scenarioSession";

const fixture = scenarioSchema.parse(
  JSON.parse(
    readFileSync(
      new URL("../../../server/scenarios/family_iot_sprawl_v1.json", import.meta.url),
      "utf8"
    )
  )
);

describe("scenario session initialization", () => {
  it("keeps the same key for equivalent focus/storage refreshes", () => {
    expect(getScenarioSessionKey(structuredClone(fixture))).toBe(getScenarioSessionKey(fixture));
  });

  it("ignores object property order when detecting a new session", () => {
    const reordered = Object.fromEntries(Object.entries(fixture).reverse()) as typeof fixture;
    reordered.initialControls = Object.fromEntries(
      Object.entries(fixture.initialControls).reverse()
    );
    expect(getScenarioSessionKey(reordered)).toBe(getScenarioSessionKey(fixture));
  });

  it("does not include presentation language or view mode in session identity", () => {
    const key = getScenarioSessionKey(fixture);
    for (const language of ["en", "lv", "ru"]) {
      for (const viewMode of ["grid", "list"]) {
        const refreshed = { language, viewMode, scenario: structuredClone(fixture) };
        expect(getScenarioSessionKey(refreshed.scenario)).toBe(key);
      }
    }
  });

  it("starts a new session when the selected scenario changes", () => {
    expect(getScenarioSessionKey({ ...fixture, id: "another-scenario" })).not.toBe(
      getScenarioSessionKey(fixture)
    );
  });

  it("starts a new session when actual device or control data changes", () => {
    const edited = structuredClone(fixture);
    edited.devices[0].networkId = "guest";
    expect(getScenarioSessionKey(edited)).not.toBe(getScenarioSessionKey(fixture));
    const controlsEdited = structuredClone(fixture);
    controlsEdited.initialControls.iotNetworkEnabled = true;
    expect(getScenarioSessionKey(controlsEdited)).not.toBe(getScenarioSessionKey(fixture));
  });

  it("initializes all device zones without mutating scenario data", () => {
    const original = structuredClone(fixture);
    const state = createInitialScenarioState(fixture);
    expect(Object.keys(state.deviceZones)).toHaveLength(fixture.devices.length);
    expect(state.deviceZones.smart_tv).toBe("main");
    expect(state.invalidDeviceCount).toBe(0);
    state.deviceZones.smart_tv = "iot";
    state.controls.iotNetworkEnabled = true;
    expect(fixture).toEqual(original);
  });

  it("preserves supported zones and safely maps unsupported zones to Main", () => {
    const edited = structuredClone(fixture);
    edited.devices[0].networkId = "guest";
    edited.devices[1].networkId = "iot";
    edited.devices[2].networkId = "unsupported";
    const state = createInitialScenarioState(edited);
    expect(state.deviceZones[edited.devices[0].id]).toBe("guest");
    expect(state.deviceZones[edited.devices[1].id]).toBe("iot");
    expect(state.deviceZones[edited.devices[2].id]).toBe("main");
    expect(state.invalidDeviceCount).toBe(1);
  });

  it("treats special device IDs as own data keys", () => {
    const edited = structuredClone(fixture);
    edited.devices[0].id = "__proto__";
    const state = createInitialScenarioState(edited);
    expect(Object.hasOwn(state.deviceZones, "__proto__")).toBe(true);
    expect(state.deviceZones.__proto__).toBe("main");
  });
});
