import type { Scenario } from "@shared/schema";

const CUSTOM_SCENARIOS_KEY = "device_triage_custom_scenarios";
const CUSTOM_SCENARIOS_UPDATED_EVENT = "deviceTriageCustomScenariosUpdated";

function notifyCustomScenariosUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CUSTOM_SCENARIOS_UPDATED_EVENT));
}

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
  try {
    const { scenario: sanitized } = sanitizeScenarioNetworkIds(scenario);
    const existing = getCustomScenarios();
    const index = existing.findIndex(s => s.id === scenario.id);
    if (index >= 0) {
      existing[index] = sanitized;
    } else {
      existing.push(sanitized);
    }
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(existing));
    notifyCustomScenariosUpdated();
  } catch {
    // Ignore localStorage errors (e.g., quota exceeded, private browsing)
  }
}

export function deleteCustomScenario(scenarioId: string): void {
  try {
    const existing = getCustomScenarios();
    const filtered = existing.filter(s => s.id !== scenarioId);
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(filtered));
    notifyCustomScenariosUpdated();
  } catch {
    // Ignore localStorage errors
  }
}

export function getCustomScenariosUpdatedEventName(): string {
  return CUSTOM_SCENARIOS_UPDATED_EVENT;
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

export interface CreateEmptyScenarioOptions {
  title?: string;
  notes?: string;
  networkLabels?: {
    main?: string;
    guest?: string;
    iot?: string;
  };
  learningObjectives?: string[];
}

const DEFAULT_NETWORKS = [
  { id: "main", label: "Main Network", ssid: "MyNetwork_Main", security: "WPA2", subnet: "192.168.1.0/24", enabled: true },
  { id: "guest", label: "Guest Network", ssid: "MyNetwork_Guest", security: "WPA2", subnet: "192.168.2.0/24", enabled: false },
  { id: "iot", label: "IoT Network", ssid: "MyNetwork_IoT", security: "WPA2", subnet: "192.168.3.0/24", enabled: false }
];

const DEFAULT_LEARNING_OBJECTIVES = [
  "Organize devices into appropriate trust zones",
  "Apply security controls to reduce risk",
  "Understand the impact of each control on overall security"
];

export function createEmptyScenario(options?: CreateEmptyScenarioOptions): Scenario {
  const networks = DEFAULT_NETWORKS.map(n => ({
    ...n,
    label: options?.networkLabels?.[n.id as keyof typeof options.networkLabels] ?? n.label
  }));

  return {
    id: generateScenarioId(),
    title: options?.title ?? "New Custom Scenario",
    environment: {
      type: "home",
      notes: options?.notes ?? "Custom scenario created by instructor"
    },
    networks,
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
    learningObjectives: options?.learningObjectives ?? DEFAULT_LEARNING_OBJECTIVES,
    suggestedWinConditions: {
      maxTotalRisk: 35,
      requires: []
    }
  };
}

export interface ScenarioSanitizationResult {
  scenario: Scenario;
  invalidDeviceIds: string[];
}

const ALLOWED_ZONE_IDS = new Set(["main", "guest", "iot"]);

export function sanitizeScenarioNetworkIds(scenario: Scenario): ScenarioSanitizationResult {
  const invalidDeviceIds: string[] = [];
  let updated = false;

  const devices = scenario.devices.map(device => {
    if (!ALLOWED_ZONE_IDS.has(device.networkId)) {
      invalidDeviceIds.push(device.id);
      updated = true;
      return { ...device, networkId: "main" };
    }
    return device;
  });

  return {
    scenario: updated ? { ...scenario, devices } : scenario,
    invalidDeviceIds
  };
}
