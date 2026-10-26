import { z } from "zod";

export const SCENARIO_LIMITS = {
  devices: 128,
  networks: 3,
  objectives: 32,
  requirements: 14,
  identifier: 128,
  label: 256,
  title: 512,
  notes: 8_000,
  objective: 1_000,
  storedScenarios: 100,
  serializedSize: 1_000_000,
} as const;

// Reject excessive collections before validating elements or allocating their issues.
function boundedArray<T extends z.ZodType>(item: T, maximum: number) {
  return z
    .unknown()
    .refine((value) => !Array.isArray(value) || value.length <= maximum, {
      error: `Collection must contain at most ${maximum} items`,
      abort: true,
    })
    .pipe(z.array(item).max(maximum));
}

const identifierSchema = z.string().trim().min(1).max(SCENARIO_LIMITS.identifier);
const labelSchema = z.string().trim().min(1).max(SCENARIO_LIMITS.label);

export const deviceTypeSchema = z.enum([
  "router",
  "laptop",
  "phone",
  "tablet",
  "tv",
  "speaker",
  "thermostat",
  "camera",
  "printer",
  "iot",
  "unknown",
]);

export const riskFlagSchema = z.enum([
  "unknown_device",
  "iot_device",
  "visitor_device",
  "trusted_work_device",
]);

export const zoneIdSchema = z.enum(["main", "guest", "iot"]);

export const deviceSchema = z.object({
  id: identifierSchema,
  type: deviceTypeSchema,
  label: labelSchema,
  networkId: identifierSchema,
  ip: z.string().max(SCENARIO_LIMITS.label).optional(),
  localId: z.string().max(SCENARIO_LIMITS.label).optional(),
  riskFlags: boundedArray(riskFlagSchema, 4),
});

export const networkSchema = z.object({
  id: zoneIdSchema,
  label: labelSchema,
  ssid: z.string().max(SCENARIO_LIMITS.label).nullable(),
  security: z.string().max(SCENARIO_LIMITS.label).nullable(),
  subnet: z.string().max(SCENARIO_LIMITS.label).nullable(),
  enabled: z.boolean(),
});

export const baseControlsSchema = z.object({
  wifiSecurity: z.enum(["OPEN", "WPA2", "WPA3"]).optional(),
  strongWifiPassword: z.boolean().optional(),
  guestNetworkEnabled: z.boolean().optional(),
  iotNetworkEnabled: z.boolean().optional(),
  mfaEnabled: z.boolean().optional(),
  autoUpdatesEnabled: z.boolean().optional(),
  defaultPasswordsAddressed: z.boolean().optional(),
  vpnEnabled: z.boolean().optional(),
  personalHotspot: z.boolean().optional(),
  firewallEnabled: z.boolean().optional(),
  fileSharingDisabled: z.boolean().optional(),
  bluetoothDisabled: z.boolean().optional(),
  httpsOnly: z.boolean().optional(),
  verifyNetworkAuthenticity: z.boolean().optional(),
});

export const controlsSchema = baseControlsSchema;

export const controlDefinitionSchema = z.object({
  id: z.string(),
  type: z.enum(["toggle", "select"]),
  options: z.array(z.string()).optional(),
  default: z.union([z.boolean(), z.string()]),
  category: z.string(),
  applicableScenarios: z.array(z.string()),
  icon: z.string(),
  labelKey: z.string(),
  descriptionKey: z.string(),
  educationKey: z.string(),
  hasInteractiveTraining: z.boolean().optional(),
});

export const controlsRegistrySchema = z.object({
  version: z.string(),
  controlCategories: z.record(
    z.string(),
    z.object({
      labelKey: z.string(),
      order: z.number(),
    })
  ),
  controls: z.array(controlDefinitionSchema),
});

export const scenarioSchema = z.object({
  id: identifierSchema,
  title: z.string().trim().min(1).max(SCENARIO_LIMITS.title),
  environment: z.object({
    type: identifierSchema,
    isp: z.string().max(SCENARIO_LIMITS.label).optional(),
    publicIp: z.string().max(SCENARIO_LIMITS.label).optional(),
    notes: z.string().max(SCENARIO_LIMITS.notes).optional(),
  }),
  networks: boundedArray(networkSchema, SCENARIO_LIMITS.networks).refine(
    (networks) =>
      networks.some((network) => network.id === "main") &&
      new Set(networks.map((network) => network.id)).size === networks.length,
    { error: "Networks must have unique zones and include main" }
  ),
  initialControls: controlsSchema,
  devices: boundedArray(deviceSchema, SCENARIO_LIMITS.devices).refine(
    (devices) => new Set(devices.map((device) => device.id)).size === devices.length,
    { error: "Device identifiers must be unique" }
  ),
  learningObjectives: boundedArray(
    z.string().max(SCENARIO_LIMITS.objective),
    SCENARIO_LIMITS.objectives
  ).optional(),
  suggestedWinConditions: z
    .object({
      maxTotalRisk: z.number().min(0).max(100).optional(),
      requires: boundedArray(
        z.object({
          control: baseControlsSchema.keyof(),
          value: z.union([z.boolean(), z.string().max(SCENARIO_LIMITS.label)]),
        }),
        SCENARIO_LIMITS.requirements
      ).optional(),
    })
    .optional(),
});

export const subscoreSchema = z.object({
  exposure: z.number(),
  credentialAccount: z.number(),
  hygiene: z.number(),
});

export const scoreResultSchema = z.object({
  subscores: subscoreSchema,
  total: z.number(),
  explanations: z.array(
    z.object({
      ruleId: z.string(),
      delta: z.record(z.string(), z.number()),
      explain: z.string(),
      explainKey: z.string().optional(),
      explainParams: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
    })
  ),
});

export type DeviceType = z.infer<typeof deviceTypeSchema>;
export type RiskFlag = z.infer<typeof riskFlagSchema>;
export type ZoneId = z.infer<typeof zoneIdSchema>;
export type Device = z.infer<typeof deviceSchema>;
export type Network = z.infer<typeof networkSchema>;
export type Controls = z.infer<typeof controlsSchema>;
export type ControlDefinition = z.infer<typeof controlDefinitionSchema>;
export type ControlsRegistry = z.infer<typeof controlsRegistrySchema>;
export type Scenario = z.infer<typeof scenarioSchema>;
export type Subscores = z.infer<typeof subscoreSchema>;
export type ScoreResult = z.infer<typeof scoreResultSchema>;
