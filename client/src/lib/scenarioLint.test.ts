import { describe, it, expect } from "vitest";
import type { ControlsRegistry } from "@shared/schema";
import { createEmptyScenario } from "./customScenarios";
import { lintScenario } from "./scenarioLint";

const registry: ControlsRegistry = {
  version: "1.0",
  controlCategories: {
    network: { labelKey: "controls.category.network", order: 1 },
  },
  controls: [
    {
      id: "wifiSecurity",
      type: "select",
      options: ["OPEN", "WPA2", "WPA3"],
      default: "WPA2",
      category: "network",
      applicableScenarios: ["home"],
      icon: "Wifi",
      labelKey: "controls.wifiSecurity",
      descriptionKey: "controls.wifiSecurityDesc",
      educationKey: "education.wifiSecurity",
    },
    {
      id: "mfaEnabled",
      type: "toggle",
      default: false,
      category: "network",
      applicableScenarios: ["home"],
      icon: "Key",
      labelKey: "controls.mfaEnabled",
      descriptionKey: "controls.mfaEnabledDesc",
      educationKey: "education.mfaEnabled",
    },
  ],
};

describe("lintScenario", () => {
  it("flags missing main network and unknown network ids", () => {
    const scenario = createEmptyScenario();
    scenario.networks = [
      { id: "guest", label: "Guest", ssid: null, security: null, subnet: null, enabled: false },
      { id: "weird", label: "Weird", ssid: null, security: null, subnet: null, enabled: false },
    ];

    const warnings = lintScenario(scenario);

    expect(warnings.some((w) => w.code === "missingMainNetwork")).toBe(true);
    expect(warnings.some((w) => w.code === "unknownNetworkIds")).toBe(true);
  });

  it("flags devices referencing undefined networks", () => {
    const scenario = createEmptyScenario();
    scenario.devices = [
      {
        id: "device-1",
        type: "laptop",
        label: "Laptop",
        networkId: "private",
        riskFlags: [],
      },
    ];

    const warnings = lintScenario(scenario);

    expect(warnings.some((w) => w.code === "deviceNetworkMissing")).toBe(true);
  });

  it("flags missing or invalid control defaults and invalid win condition controls", () => {
    const scenario = createEmptyScenario();
    scenario.environment.type = "home";
    scenario.initialControls = {
      ...scenario.initialControls,
      wifiSecurity: "INVALID" as unknown as "WPA2",
    };
    delete scenario.initialControls.mfaEnabled;
    scenario.suggestedWinConditions = {
      maxTotalRisk: 35,
      requires: [{ control: "vpnEnabled", value: true }],
    };

    const warnings = lintScenario(scenario, registry);

    expect(warnings.some((w) => w.code === "controlMissing")).toBe(true);
    expect(warnings.some((w) => w.code === "controlInvalidValue")).toBe(true);
    expect(warnings.some((w) => w.code === "winConditionNotApplicable")).toBe(true);
  });
});
