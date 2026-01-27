import type { ControlsRegistry, ControlDefinition } from "@shared/schema";

export function getScenarioControlDefinitions(
  registry: ControlsRegistry | undefined,
  scenarioType: string | undefined
): ControlDefinition[] {
  if (!registry || !scenarioType) return [];
  return registry.controls.filter(control =>
    control.applicableScenarios.includes(scenarioType)
  );
}

export function getScenarioControlIds(
  registry: ControlsRegistry | undefined,
  scenarioType: string | undefined
): Set<string> {
  return new Set(getScenarioControlDefinitions(registry, scenarioType).map(control => control.id));
}

export function getControlDefinition(
  registry: ControlsRegistry | undefined,
  controlId: string
): ControlDefinition | undefined {
  return registry?.controls.find(control => control.id === controlId);
}

export function filterRequiredControlsByScenario(
  requires: Array<{ control: string; value: boolean | string }>,
  registry: ControlsRegistry | undefined,
  scenarioType: string | undefined
): Array<{ control: string; value: boolean | string }> {
  if (!registry || !scenarioType) return requires;
  const allowed = getScenarioControlIds(registry, scenarioType);
  if (allowed.size === 0) return requires;
  return requires.filter(req => allowed.has(req.control));
}
