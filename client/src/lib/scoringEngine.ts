import type { Device, Controls, ZoneId, Subscores, ScoreResult, RiskFlag } from "@shared/schema";

export interface ScoringRules {
  version: string;
  scoreModel: {
    subscores: string[];
    weights: Record<string, number>;
    caps: {
      exposure: { min: number; max: number };
      credentialAccount: { min: number; max: number };
      hygiene: { min: number; max: number };
      total: { min: number; max: number };
    };
  };
  defaults: {
    baseline: Subscores;
    allowedZones: string[];
  };
  zoneRules: ZoneRule[];
  controlRules: ControlRule[];
  synergyRules: SynergyRule[];
  explainPanel: {
    maxItems: number;
    sortOrder: string;
    include: string[];
  };
}

interface ZoneRule {
  id: string;
  when: {
    deviceHasFlag?: RiskFlag;
    deviceTypeIs?: string;
    zoneIs?: ZoneId;
    zoneNot?: ZoneId;
    zoneIn?: ZoneId[];
    flaggedForInvestigation?: boolean;
    notFlaggedForInvestigation?: boolean;
  };
  add: Partial<Subscores>;
  explain: string;
}

interface ControlRule {
  id: string;
  when: {
    controlIs: keyof Controls;
    valueIs: boolean | string;
  };
  add: Partial<Subscores>;
  explain: string;
}

interface SynergyRule {
  id: string;
  when: {
    all?: Array<{
      controlIs?: keyof Controls;
      valueIs?: boolean | string;
      pctOfDevicesWithFlagInZoneAtLeast?: { flag: RiskFlag; zone: ZoneId; pct: number };
      countDevicesWithFlagInZoneAtLeast?: { flag: RiskFlag; zone: ZoneId; count: number };
      countDevicesWithFlagAtLeast?: { flag: RiskFlag; count: number };
      countUnflaggedDevicesWithFlag?: { flag: RiskFlag; count: number };
    }>;
  };
  add: Partial<Subscores>;
  explain: string;
}

interface Explanation {
  ruleId: string;
  delta: Record<string, number>;
  explain: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function evaluateZoneCondition(
  condition: ZoneRule["when"],
  device: Device,
  deviceZone: ZoneId,
  isFlagged: boolean
): boolean {
  if (condition.deviceHasFlag && !device.riskFlags.includes(condition.deviceHasFlag)) {
    return false;
  }
  if (condition.deviceTypeIs && device.type !== condition.deviceTypeIs) {
    return false;
  }
  if (condition.zoneIs && deviceZone !== condition.zoneIs) {
    return false;
  }
  if (condition.zoneNot && deviceZone === condition.zoneNot) {
    return false;
  }
  if (condition.zoneIn && !condition.zoneIn.includes(deviceZone)) {
    return false;
  }
  if (condition.flaggedForInvestigation === true && !isFlagged) {
    return false;
  }
  if (condition.notFlaggedForInvestigation === true && isFlagged) {
    return false;
  }
  return true;
}

function evaluateControlCondition(
  condition: ControlRule["when"],
  controls: Controls
): boolean {
  const controlValue = controls[condition.controlIs];
  return controlValue === condition.valueIs;
}

function evaluateSynergyCondition(
  rule: SynergyRule,
  controls: Controls,
  devices: Device[],
  deviceZones: Record<string, ZoneId>,
  flaggedDevices: Set<string>
): boolean {
  if (!rule.when.all) return false;

  return rule.when.all.every(condition => {
    if (condition.controlIs !== undefined && condition.valueIs !== undefined) {
      return controls[condition.controlIs] === condition.valueIs;
    }

    if (condition.pctOfDevicesWithFlagInZoneAtLeast) {
      const { flag, zone, pct } = condition.pctOfDevicesWithFlagInZoneAtLeast;
      const devicesWithFlag = devices.filter(d => d.riskFlags.includes(flag));
      if (devicesWithFlag.length === 0) return false;
      const devicesInZone = devicesWithFlag.filter(d => deviceZones[d.id] === zone);
      return (devicesInZone.length / devicesWithFlag.length) >= pct;
    }

    if (condition.countDevicesWithFlagInZoneAtLeast) {
      const { flag, zone, count } = condition.countDevicesWithFlagInZoneAtLeast;
      const devicesWithFlagInZone = devices.filter(
        d => d.riskFlags.includes(flag) && deviceZones[d.id] === zone
      );
      return devicesWithFlagInZone.length >= count;
    }

    if (condition.countDevicesWithFlagAtLeast) {
      const { flag, count } = condition.countDevicesWithFlagAtLeast;
      const devicesWithFlag = devices.filter(d => d.riskFlags.includes(flag));
      return devicesWithFlag.length >= count;
    }

    if (condition.countUnflaggedDevicesWithFlag) {
      const { flag, count } = condition.countUnflaggedDevicesWithFlag;
      const unflaggedDevicesWithFlag = devices.filter(
        d => d.riskFlags.includes(flag) && !flaggedDevices.has(d.id)
      );
      return unflaggedDevicesWithFlag.length >= count;
    }

    return true;
  });
}

export function calculateScore(
  rules: ScoringRules,
  devices: Device[],
  deviceZones: Record<string, ZoneId>,
  controls: Controls,
  flaggedDevices: Set<string> = new Set()
): ScoreResult {
  const explanations: Explanation[] = [];
  
  const subscores: Subscores = { ...rules.defaults.baseline };

  explanations.push({
    ruleId: "baseline",
    delta: { ...rules.defaults.baseline },
    explain: "Starting baseline risk scores"
  });

  for (const rule of rules.controlRules) {
    if (evaluateControlCondition(rule.when, controls)) {
      for (const [key, value] of Object.entries(rule.add)) {
        if (key in subscores) {
          (subscores as Record<string, number>)[key] += value as number;
        }
      }
      explanations.push({
        ruleId: rule.id,
        delta: rule.add as Record<string, number>,
        explain: rule.explain
      });
    }
  }

  for (const device of devices) {
    const deviceZone = deviceZones[device.id];
    if (!deviceZone) continue;

    for (const rule of rules.zoneRules) {
      if (evaluateZoneCondition(rule.when, device, deviceZone, flaggedDevices.has(device.id))) {
        for (const [key, value] of Object.entries(rule.add)) {
          if (key in subscores) {
            (subscores as Record<string, number>)[key] += value as number;
          }
        }
        explanations.push({
          ruleId: `${rule.id}_${device.id}`,
          delta: rule.add as Record<string, number>,
          explain: `${device.label}: ${rule.explain}`
        });
      }
    }
  }

  for (const rule of rules.synergyRules) {
    if (evaluateSynergyCondition(rule, controls, devices, deviceZones, flaggedDevices)) {
      for (const [key, value] of Object.entries(rule.add)) {
        if (key in subscores) {
          (subscores as Record<string, number>)[key] += value as number;
        }
      }
      explanations.push({
        ruleId: rule.id,
        delta: rule.add as Record<string, number>,
        explain: rule.explain
      });
    }
  }

  subscores.exposure = clamp(
    subscores.exposure,
    rules.scoreModel.caps.exposure.min,
    rules.scoreModel.caps.exposure.max
  );
  subscores.credentialAccount = clamp(
    subscores.credentialAccount,
    rules.scoreModel.caps.credentialAccount.min,
    rules.scoreModel.caps.credentialAccount.max
  );
  subscores.hygiene = clamp(
    subscores.hygiene,
    rules.scoreModel.caps.hygiene.min,
    rules.scoreModel.caps.hygiene.max
  );

  const weights = rules.scoreModel.weights;
  let total = 
    subscores.exposure * (weights.exposure || 0.5) +
    subscores.credentialAccount * (weights.credentialAccount || 0.3) +
    subscores.hygiene * (weights.hygiene || 0.2);

  total = clamp(
    total,
    rules.scoreModel.caps.total.min,
    rules.scoreModel.caps.total.max
  );

  const filteredExplanations = explanations.filter(exp => {
    const totalDelta = Object.values(exp.delta).reduce((sum, val) => sum + val, 0);
    return totalDelta !== 0 || exp.ruleId === "baseline";
  });

  return {
    subscores,
    total,
    explanations: filteredExplanations
  };
}
