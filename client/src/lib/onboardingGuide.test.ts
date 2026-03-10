import { describe, expect, it } from "vitest";

import type { Controls, Scenario } from "@shared/schema";
import { getOnboardingGuideState } from "./onboardingGuide";

function createScenario(overrides: Partial<Scenario> = {}): Scenario {
  const baseControls: Controls = {
    guestNetworkEnabled: false,
    firewallEnabled: false,
    wifiSecurity: "OPEN",
  };

  return {
    id: "scenario-1",
    title: "Test Scenario",
    environment: { type: "home" },
    networks: [
      { id: "main", label: "Main", ssid: "Main", security: "WPA2", subnet: null, enabled: true },
      {
        id: "guest",
        label: "Guest",
        ssid: "Guest",
        security: "WPA2",
        subnet: null,
        enabled: true,
      },
      { id: "iot", label: "IoT", ssid: "IoT", security: "WPA2", subnet: null, enabled: true },
    ],
    initialControls: baseControls,
    devices: [
      {
        id: "iot-tv",
        type: "tv",
        label: "Smart TV",
        networkId: "main",
        riskFlags: ["iot_device"],
      },
      {
        id: "mystery-phone",
        type: "phone",
        label: "Unknown Phone",
        networkId: "main",
        riskFlags: ["unknown_device"],
      },
      {
        id: "laptop-1",
        type: "laptop",
        label: "Laptop",
        networkId: "main",
        riskFlags: [],
      },
    ],
    ...overrides,
  };
}

describe("getOnboardingGuideState", () => {
  it("starts with segmentation when a risky device is still on the main network", () => {
    const scenario = createScenario();

    const state = getOnboardingGuideState({
      scenario,
      initialScenarioZones: {
        "iot-tv": "main",
        "mystery-phone": "main",
        "laptop-1": "main",
      },
      deviceZones: {
        "iot-tv": "main",
        "mystery-phone": "main",
        "laptop-1": "main",
      },
      flaggedDevices: new Set<string>(),
      controls: { ...scenario.initialControls },
      scenarioStartRisk: 40,
      scoreTotal: 40,
      meetsWinCondition: false,
    });

    expect(state.nextStepId).toBe("segment");
    expect(state.segmentCandidateId).toBe("iot-tv");
    expect(state.segmentRecommendedZoneId).toBe("iot");
    expect(state.steps[0]).toEqual({
      id: "segment",
      completed: false,
      status: "current",
    });
  });

  it("skips non-applicable steps instead of asking for actions the scenario does not support", () => {
    const scenario = createScenario({
      devices: [
        {
          id: "trusted-laptop",
          type: "laptop",
          label: "Trusted Laptop",
          networkId: "main",
          riskFlags: [],
        },
      ],
      initialControls: {
        guestNetworkEnabled: true,
        firewallEnabled: true,
        wifiSecurity: "WPA3",
      },
    });

    const state = getOnboardingGuideState({
      scenario,
      initialScenarioZones: {
        "trusted-laptop": "main",
      },
      deviceZones: {
        "trusted-laptop": "main",
      },
      flaggedDevices: new Set<string>(),
      controls: { ...scenario.initialControls },
      scenarioStartRisk: 28,
      scoreTotal: 28,
      meetsWinCondition: false,
    });

    expect(state.hasSegmentedRiskDevice).toBe(true);
    expect(state.hasFlaggedUnknownDevice).toBe(true);
    expect(state.hasImprovedControl).toBe(true);
    expect(state.nextStepId).toBe("score");
    expect(state.completedCount).toBe(3);
  });

  it("prioritizes beginner-friendly unresolved controls when suggesting the next control step", () => {
    const scenario = createScenario({
      initialControls: {
        wifiSecurity: "OPEN",
        mfaEnabled: false,
        firewallEnabled: false,
      },
    });

    const state = getOnboardingGuideState({
      scenario,
      initialScenarioZones: {
        "iot-tv": "iot",
        "mystery-phone": "main",
        "laptop-1": "main",
      },
      deviceZones: {
        "iot-tv": "iot",
        "mystery-phone": "main",
        "laptop-1": "main",
      },
      flaggedDevices: new Set(["mystery-phone"]),
      controls: {
        wifiSecurity: "OPEN",
        mfaEnabled: false,
        firewallEnabled: false,
      },
      scenarioStartRisk: 40,
      scoreTotal: 38,
      meetsWinCondition: false,
    });

    expect(state.nextStepId).toBe("control");
    expect(state.controlCandidateId).toBe("firewallEnabled");
  });

  it("marks the core loop complete once risk is reduced", () => {
    const scenario = createScenario();

    const state = getOnboardingGuideState({
      scenario,
      initialScenarioZones: {
        "iot-tv": "main",
        "mystery-phone": "main",
        "laptop-1": "main",
      },
      deviceZones: {
        "iot-tv": "iot",
        "mystery-phone": "main",
        "laptop-1": "main",
      },
      flaggedDevices: new Set(["mystery-phone"]),
      controls: {
        guestNetworkEnabled: true,
        firewallEnabled: false,
        wifiSecurity: "OPEN",
      },
      scenarioStartRisk: 40,
      scoreTotal: 34,
      meetsWinCondition: false,
    });

    expect(state.hasLoweredRisk).toBe(true);
    expect(state.completedCount).toBe(4);
    expect(state.nextStepId).toBe("complete");
    expect(state.steps.every((step) => step.status === "done")).toBe(true);
  });
});
