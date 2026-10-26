import { SCENARIO_LIMITS, scenarioSchema, type Scenario } from "@shared/schema";

const CUSTOM_SCENARIOS_KEY = "device_triage_custom_scenarios";
const CUSTOM_SCENARIOS_UPDATED_EVENT = "deviceTriageCustomScenariosUpdated";
const MAX_STORED_SCENARIOS_SIZE = SCENARIO_LIMITS.serializedSize;

function readStoredScenarios(): unknown[] {
  const stored = localStorage.getItem(CUSTOM_SCENARIOS_KEY);
  if (!stored) return [];
  if (stored.length > MAX_STORED_SCENARIOS_SIZE) throw new Error("Storage size limit");
  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || parsed.length > SCENARIO_LIMITS.storedScenarios) {
    throw new Error("Storage collection limit");
  }
  return parsed;
}

function notifyCustomScenariosUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(CUSTOM_SCENARIOS_UPDATED_EVENT));
}

export function getCustomScenarios(): Scenario[] {
  try {
    const parsed = readStoredScenarios();
    return parsed.flatMap((value) => {
      const result = scenarioSchema.safeParse(value);
      return result.success ? [sanitizeScenarioNetworkIds(result.data).scenario] : [];
    });
  } catch {
    return [];
  }
}

export function saveCustomScenario(scenario: Scenario): boolean {
  try {
    const { scenario: sanitized } = sanitizeScenarioNetworkIds(scenarioSchema.parse(scenario));
    // Keep legacy entries intact even when tightened validation excludes them from the UI.
    const existing = readStoredScenarios();
    const index = existing.findIndex(
      (s) => typeof s === "object" && s !== null && "id" in s && s.id === sanitized.id
    );
    if (index >= 0) {
      existing[index] = sanitized;
    } else {
      existing.push(sanitized);
    }
    if (existing.length > SCENARIO_LIMITS.storedScenarios) return false;
    const serialized = JSON.stringify(existing);
    if (serialized.length > MAX_STORED_SCENARIOS_SIZE) return false;
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, serialized);
    notifyCustomScenariosUpdated();
    return true;
  } catch {
    return false;
  }
}

export function deleteCustomScenario(scenarioId: string): boolean {
  try {
    const existing = readStoredScenarios();
    const filtered = existing.filter(
      (s) => !(typeof s === "object" && s !== null && "id" in s && s.id === scenarioId)
    );
    localStorage.setItem(CUSTOM_SCENARIOS_KEY, JSON.stringify(filtered));
    notifyCustomScenariosUpdated();
    return true;
  } catch {
    return false;
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
  networkLabels?: Partial<Record<"main" | "guest" | "iot", string>>;
  networkSsids?: Partial<Record<"main" | "guest" | "iot", string>>;
  learningObjectives?: string[];
}

const DEFAULT_NETWORKS: Scenario["networks"] = [
  {
    id: "main",
    label: "Main Network",
    ssid: "MyNetwork_Main",
    security: "WPA2",
    subnet: "192.168.1.0/24",
    enabled: true,
  },
  {
    id: "guest",
    label: "Guest Network",
    ssid: "MyNetwork_Guest",
    security: "WPA2",
    subnet: "192.168.2.0/24",
    enabled: false,
  },
  {
    id: "iot",
    label: "IoT Network",
    ssid: "MyNetwork_IoT",
    security: "WPA2",
    subnet: "192.168.3.0/24",
    enabled: false,
  },
];

const DEFAULT_LEARNING_OBJECTIVES = [
  "Organize devices into appropriate trust zones",
  "Apply security controls to reduce risk",
  "Understand the impact of each control on overall security",
];

export function createEmptyScenario(options?: CreateEmptyScenarioOptions): Scenario {
  const networks = DEFAULT_NETWORKS.map((n) => ({
    ...n,
    label: options?.networkLabels?.[n.id as "main" | "guest" | "iot"] ?? n.label,
    ssid: options?.networkSsids?.[n.id as "main" | "guest" | "iot"] ?? n.ssid,
  }));

  return {
    id: generateScenarioId(),
    title: options?.title ?? "New Custom Scenario",
    environment: {
      type: "home",
      notes: options?.notes ?? "Custom scenario created by instructor",
    },
    networks,
    initialControls: {
      wifiSecurity: "WPA2",
      strongWifiPassword: false,
      guestNetworkEnabled: false,
      iotNetworkEnabled: false,
      mfaEnabled: false,
      autoUpdatesEnabled: false,
      defaultPasswordsAddressed: false,
    },
    devices: [],
    learningObjectives: options?.learningObjectives ?? DEFAULT_LEARNING_OBJECTIVES,
    suggestedWinConditions: {
      maxTotalRisk: 35,
      requires: [],
    },
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

  const devices = scenario.devices.map((device) => {
    if (!ALLOWED_ZONE_IDS.has(device.networkId)) {
      invalidDeviceIds.push(device.id);
      updated = true;
      return { ...device, networkId: "main" };
    }
    return device;
  });

  return {
    scenario: updated ? { ...scenario, devices } : scenario,
    invalidDeviceIds,
  };
}
