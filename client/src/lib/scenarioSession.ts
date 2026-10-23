import type { Controls, Scenario, ZoneId } from "@shared/schema";
import { zones } from "./zones";

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        .map(([key, entry]) => [key, canonicalize(entry)])
    );
  }
  return value;
}

// Focus/storage refreshes can return new objects for the same scenario content.
export function getScenarioSessionKey(scenario: Scenario): string {
  return JSON.stringify(canonicalize(scenario));
}

export function createInitialScenarioState(scenario: Scenario): {
  deviceZones: Record<string, ZoneId>;
  controls: Controls;
  invalidDeviceCount: number;
} {
  const allowedZoneIds = new Set<string>(zones.map((zone) => zone.id));
  let invalidDeviceCount = 0;
  const deviceZones = Object.fromEntries(
    scenario.devices.map((device) => {
      const valid = allowedZoneIds.has(device.networkId);
      if (!valid) invalidDeviceCount += 1;
      return [device.id, valid ? (device.networkId as ZoneId) : "main"];
    })
  );
  return { deviceZones, controls: { ...scenario.initialControls }, invalidDeviceCount };
}
