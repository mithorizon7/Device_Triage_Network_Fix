import { z } from "zod";

export const deviceTypeSchema = z.enum([
  "router", "laptop", "phone", "tablet", "tv", "speaker", 
  "thermostat", "camera", "printer", "iot", "unknown"
]);

export const riskFlagSchema = z.enum([
  "unknown_device", "iot_device", "visitor_device", "trusted_work_device"
]);

export const zoneIdSchema = z.enum(["main", "guest", "iot"]);

export const deviceSchema = z.object({
  id: z.string(),
  type: deviceTypeSchema,
  label: z.string(),
  networkId: z.string(),
  ip: z.string().optional(),
  localId: z.string().optional(),
  riskFlags: z.array(riskFlagSchema)
});

export const networkSchema = z.object({
  id: z.string(),
  label: z.string(),
  ssid: z.string().nullable(),
  security: z.string().nullable(),
  subnet: z.string().nullable(),
  enabled: z.boolean()
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
  verifyNetworkAuthenticity: z.boolean().optional()
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
  hasInteractiveTraining: z.boolean().optional()
});

export const controlsRegistrySchema = z.object({
  version: z.string(),
  controlCategories: z.record(z.object({
    labelKey: z.string(),
    order: z.number()
  })),
  controls: z.array(controlDefinitionSchema)
});

export const scenarioSchema = z.object({
  id: z.string(),
  title: z.string(),
  environment: z.object({
    type: z.string(),
    isp: z.string().optional(),
    publicIp: z.string().optional(),
    notes: z.string().optional()
  }),
  networks: z.array(networkSchema),
  initialControls: controlsSchema,
  devices: z.array(deviceSchema),
  learningObjectives: z.array(z.string()).optional(),
  suggestedWinConditions: z.object({
    maxTotalRisk: z.number().optional(),
    requires: z.array(z.object({
      control: z.string(),
      value: z.union([z.boolean(), z.string()])
    })).optional()
  }).optional()
});

export const subscoreSchema = z.object({
  exposure: z.number(),
  credentialAccount: z.number(),
  hygiene: z.number()
});

export const scoreResultSchema = z.object({
  subscores: subscoreSchema,
  total: z.number(),
  explanations: z.array(z.object({
    ruleId: z.string(),
    delta: z.record(z.string(), z.number()),
    explain: z.string()
  }))
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
