import { z } from "zod";

export const deviceTypeSchema = z.enum([
  "router", "laptop", "phone", "tablet", "tv", "speaker", 
  "thermostat", "camera", "printer", "iot", "unknown"
]);

export const riskFlagSchema = z.enum([
  "unknown_device", "iot_device", "visitor_device", "trusted_work_device"
]);

export const zoneIdSchema = z.enum(["main", "guest", "iot", "investigate"]);

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

export const controlsSchema = z.object({
  wifiSecurity: z.enum(["OPEN", "WPA2", "WPA3"]),
  strongWifiPassword: z.boolean(),
  guestNetworkEnabled: z.boolean(),
  iotNetworkEnabled: z.boolean(),
  mfaEnabled: z.boolean(),
  autoUpdatesEnabled: z.boolean(),
  defaultPasswordsAddressed: z.boolean()
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
export type Scenario = z.infer<typeof scenarioSchema>;
export type Subscores = z.infer<typeof subscoreSchema>;
export type ScoreResult = z.infer<typeof scoreResultSchema>;
