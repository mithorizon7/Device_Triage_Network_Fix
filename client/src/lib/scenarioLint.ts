import type { ControlsRegistry, Scenario } from "@shared/schema";
import { deviceTypeSchema, riskFlagSchema } from "@shared/schema";
import { getScenarioControlDefinitions, getScenarioControlIds } from "@/lib/controlsRegistry";

const ALLOWED_ZONE_IDS = ["main", "guest", "iot"] as const;
const allowedZoneSet = new Set(ALLOWED_ZONE_IDS);
const allowedDeviceTypes = new Set(deviceTypeSchema.options);
const allowedRiskFlags = new Set(riskFlagSchema.options);

export type ScenarioLintCode =
  | "missingMainNetwork"
  | "unknownNetworkIds"
  | "duplicateNetworkIds"
  | "deviceInvalidNetwork"
  | "deviceNetworkMissing"
  | "deviceTypeInvalid"
  | "deviceFlagInvalid"
  | "controlMissing"
  | "controlInvalidValue"
  | "controlNotApplicable"
  | "winConditionNotApplicable";

export interface ScenarioLintWarning {
  code: ScenarioLintCode;
  params?: Record<string, string | number>;
}

function uniqueList(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function lintScenario(
  scenario: Scenario,
  controlsRegistry?: ControlsRegistry
): ScenarioLintWarning[] {
  const warnings: ScenarioLintWarning[] = [];

  const networkIds = scenario.networks.map((network) => network.id);
  const duplicateNetworkIds = uniqueList(
    networkIds.filter((id, index) => networkIds.indexOf(id) !== index)
  );
  const unknownNetworkIds = uniqueList(
    networkIds.filter((id) => !allowedZoneSet.has(id as (typeof ALLOWED_ZONE_IDS)[number]))
  );

  if (!networkIds.includes("main")) {
    warnings.push({ code: "missingMainNetwork" });
  }

  if (unknownNetworkIds.length > 0) {
    warnings.push({ code: "unknownNetworkIds", params: { ids: unknownNetworkIds.join(", ") } });
  }

  if (duplicateNetworkIds.length > 0) {
    warnings.push({ code: "duplicateNetworkIds", params: { ids: duplicateNetworkIds.join(", ") } });
  }

  const networkIdSet = new Set(networkIds);
  const invalidDeviceNetworkIds: string[] = [];
  const missingDeviceNetworkIds: string[] = [];
  const invalidDeviceTypes: string[] = [];
  const invalidDeviceFlags: string[] = [];

  scenario.devices.forEach((device) => {
    if (!allowedZoneSet.has(device.networkId as (typeof ALLOWED_ZONE_IDS)[number])) {
      invalidDeviceNetworkIds.push(device.id);
    }
    if (!networkIdSet.has(device.networkId)) {
      missingDeviceNetworkIds.push(device.id);
    }
    if (!allowedDeviceTypes.has(device.type)) {
      invalidDeviceTypes.push(device.type);
    }
    device.riskFlags.forEach((flag) => {
      if (!allowedRiskFlags.has(flag)) {
        invalidDeviceFlags.push(flag);
      }
    });
  });

  if (invalidDeviceNetworkIds.length > 0) {
    warnings.push({
      code: "deviceInvalidNetwork",
      params: { count: invalidDeviceNetworkIds.length },
    });
  }

  if (missingDeviceNetworkIds.length > 0) {
    warnings.push({
      code: "deviceNetworkMissing",
      params: { count: missingDeviceNetworkIds.length },
    });
  }

  if (invalidDeviceTypes.length > 0) {
    warnings.push({
      code: "deviceTypeInvalid",
      params: { types: uniqueList(invalidDeviceTypes).join(", ") },
    });
  }

  if (invalidDeviceFlags.length > 0) {
    warnings.push({
      code: "deviceFlagInvalid",
      params: { flags: uniqueList(invalidDeviceFlags).join(", ") },
    });
  }

  if (controlsRegistry) {
    const controlDefinitions = getScenarioControlDefinitions(
      controlsRegistry,
      scenario.environment.type
    );
    const applicableIds = getScenarioControlIds(controlsRegistry, scenario.environment.type);

    if (controlDefinitions.length > 0) {
      const missingControls = controlDefinitions.filter(
        (control) =>
          scenario.initialControls[control.id as keyof Scenario["initialControls"]] === undefined
      );

      const invalidControlValues = controlDefinitions.filter((control) => {
        const value = scenario.initialControls[control.id as keyof Scenario["initialControls"]];
        if (value === undefined) return false;
        if (control.type === "toggle") return typeof value !== "boolean";
        if (control.type === "select") {
          return !control.options || !control.options.includes(String(value));
        }
        return false;
      });

      const notApplicableControls = Object.entries(scenario.initialControls)
        .filter(([, value]) => value !== undefined)
        .filter(([key]) => !applicableIds.has(key));

      if (missingControls.length > 0) {
        warnings.push({
          code: "controlMissing",
          params: { count: missingControls.length },
        });
      }

      if (invalidControlValues.length > 0) {
        warnings.push({
          code: "controlInvalidValue",
          params: { count: invalidControlValues.length },
        });
      }

      if (notApplicableControls.length > 0) {
        warnings.push({
          code: "controlNotApplicable",
          params: { count: notApplicableControls.length },
        });
      }

      const requires = scenario.suggestedWinConditions?.requires ?? [];
      const notApplicableWinControls = requires.filter((req) => !applicableIds.has(req.control));
      if (notApplicableWinControls.length > 0) {
        warnings.push({
          code: "winConditionNotApplicable",
          params: { count: notApplicableWinControls.length },
        });
      }
    }
  }

  return warnings;
}
