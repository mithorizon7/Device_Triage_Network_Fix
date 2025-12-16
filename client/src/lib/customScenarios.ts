import type { Scenario } from "@shared/schema";

const CUSTOM_SCENARIOS_KEY = "device_triage_custom_scenarios";

export function getCustomScenarios(): Scenario[] {
  try {
    const stored = localStorage.getItem(CUSTOM_SCENARIOS_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveCustomScenario(scenario: Scenario): void {
  const existing = getCustomScenarios();
  const index = existing.findIndex(s => s.id === scenario.id);
  if (index >= 0) {
    existing[index] = scenario;
  } else {
    existing.push(scenario);
  }
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(existing));
}

export function deleteCustomScenario(scenarioId: string): void {
  const existing = getCustomScenarios();
  const filtered = existing.filter(s => s.id !== scenarioId);
  localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(filtered));
}

export function exportScenarioAsJson(scenario: Scenario): void {
  const blob = new Blob([JSON.stringify(scenario, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${scenario.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateScenarioId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createEmptyScenario(): Scenario {
  return {
    id: generateScenarioId(),
    title: "New Custom Scenario",
    environment: {
      type: "home",
      notes: "Custom scenario created by instructor"
    },
    networks: [
      { id: "main", label: "Main Network", ssid: "MyNetwork_Main", security: "WPA2", subnet: "192.168.1.0/24", enabled: true },
      { id: "guest", label: "Guest Network", ssid: "MyNetwork_Guest", security: "WPA2", subnet: "192.168.2.0/24", enabled: false },
      { id: "iot", label: "IoT Network", ssid: "MyNetwork_IoT", security: "WPA2", subnet: "192.168.3.0/24", enabled: false },
      { id: "investigate", label: "Investigate / Quarantine", ssid: null, security: null, subnet: null, enabled: true }
    ],
    initialControls: {
      wifiSecurity: "WPA2",
      strongWifiPassword: false,
      guestNetworkEnabled: false,
      iotNetworkEnabled: false,
      mfaEnabled: false,
      autoUpdatesEnabled: false,
      defaultPasswordsAddressed: false
    },
    devices: [],
    learningObjectives: [
      "Organize devices into appropriate trust zones",
      "Apply security controls to reduce risk",
      "Understand the impact of each control on overall security"
    ],
    suggestedWinConditions: {
      maxTotalRisk: 35,
      requires: []
    }
  };
}
