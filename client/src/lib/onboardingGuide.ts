import type { Controls, Device, Scenario, ZoneId } from "@shared/schema";

export type OnboardingGuideStepId = "segment" | "flag" | "control" | "score";
export type OnboardingGuideNextStepId = OnboardingGuideStepId | "complete";
export type OnboardingGuideStepStatus = "done" | "current" | "up_next";

interface OnboardingGuideInput {
  scenario?: Scenario;
  initialScenarioZones: Record<string, ZoneId>;
  deviceZones: Record<string, ZoneId>;
  flaggedDevices: Set<string>;
  controls: Controls | null;
  scenarioStartRisk: number | null;
  scoreTotal: number;
  meetsWinCondition: boolean;
}

interface OnboardingGuideStepState {
  id: OnboardingGuideStepId;
  completed: boolean;
  status: OnboardingGuideStepStatus;
}

export interface OnboardingGuideState {
  hasSegmentedRiskDevice: boolean;
  hasFlaggedUnknownDevice: boolean;
  hasImprovedControl: boolean;
  hasLoweredRisk: boolean;
  completedCount: number;
  totalSteps: number;
  nextStepId: OnboardingGuideNextStepId;
  steps: OnboardingGuideStepState[];
  segmentCandidateId: string | null;
  segmentRecommendedZoneId: ZoneId | null;
  unknownCandidateId: string | null;
  controlCandidateId: string | null;
}

const STEP_ORDER: OnboardingGuideStepId[] = ["segment", "flag", "control", "score"];
const CONTROL_PRIORITY: string[] = [
  "guestNetworkEnabled",
  "iotNetworkEnabled",
  "firewallEnabled",
  "mfaEnabled",
  "autoUpdatesEnabled",
  "defaultPasswordsAddressed",
  "strongWifiPassword",
  "wifiSecurity",
  "vpnEnabled",
  "fileSharingDisabled",
  "bluetoothDisabled",
  "httpsOnly",
  "verifyNetworkAuthenticity",
  "personalHotspot",
];

const CONTROL_PRIORITY_INDEX = new Map(CONTROL_PRIORITY.map((id, index) => [id, index]));

function getControlPriority(controlId: string): number {
  return CONTROL_PRIORITY_INDEX.get(controlId) ?? CONTROL_PRIORITY.length;
}

function isControlImprovable(controlId: string, initialValue: Controls[keyof Controls]): boolean {
  if (typeof initialValue === "boolean") {
    return initialValue === false;
  }

  if (controlId === "wifiSecurity" && typeof initialValue === "string") {
    return initialValue === "OPEN" || initialValue === "WPA2";
  }

  return false;
}

function isControlImproved(
  controlId: string,
  initialValue: Controls[keyof Controls],
  currentValue: Controls[keyof Controls] | undefined
): boolean {
  if (typeof initialValue === "boolean" && typeof currentValue === "boolean") {
    return !initialValue && currentValue;
  }

  if (
    controlId === "wifiSecurity" &&
    typeof initialValue === "string" &&
    typeof currentValue === "string"
  ) {
    if (initialValue === "OPEN") return currentValue !== "OPEN";
    if (initialValue === "WPA2") return currentValue === "WPA3";
  }

  return false;
}

export function getRecommendedZoneId(device: Device): ZoneId {
  if (device.riskFlags.includes("iot_device")) return "iot";
  if (device.riskFlags.includes("visitor_device")) return "guest";
  return "guest";
}

export function getOnboardingGuideState({
  scenario,
  initialScenarioZones,
  deviceZones,
  flaggedDevices,
  controls,
  scenarioStartRisk,
  scoreTotal,
  meetsWinCondition,
}: OnboardingGuideInput): OnboardingGuideState {
  if (!scenario) {
    return {
      hasSegmentedRiskDevice: false,
      hasFlaggedUnknownDevice: false,
      hasImprovedControl: false,
      hasLoweredRisk: false,
      completedCount: 0,
      totalSteps: STEP_ORDER.length,
      nextStepId: "segment",
      steps: STEP_ORDER.map((id, index) => ({
        id,
        completed: false,
        status: index === 0 ? "current" : "up_next",
      })),
      segmentCandidateId: null,
      segmentRecommendedZoneId: null,
      unknownCandidateId: null,
      controlCandidateId: null,
    };
  }

  const riskyMainDevices = scenario.devices.filter(
    (device) =>
      (device.riskFlags.includes("iot_device") || device.riskFlags.includes("visitor_device")) &&
      initialScenarioZones[device.id] === "main"
  );
  const unresolvedSegmentDevice =
    riskyMainDevices.find((device) => deviceZones[device.id] === "main") ?? null;
  const hasSegmentedRiskDevice =
    riskyMainDevices.length === 0 ||
    riskyMainDevices.some((device) => deviceZones[device.id] !== "main");

  const unknownDevices = scenario.devices.filter((device) =>
    device.riskFlags.includes("unknown_device")
  );
  const unresolvedUnknownDevice =
    unknownDevices.find((device) => !flaggedDevices.has(device.id)) ?? null;
  const hasFlaggedUnknownDevice =
    unknownDevices.length === 0 || unknownDevices.some((device) => flaggedDevices.has(device.id));

  const improvableControls = Object.entries(scenario.initialControls)
    .filter(([, initialValue]) => initialValue !== undefined)
    .map(([controlId, initialValue], originalIndex) => ({
      controlId,
      initialValue,
      originalIndex,
      currentValue: controls?.[controlId as keyof Controls],
    }))
    .filter(({ controlId, initialValue }) =>
      isControlImprovable(controlId, initialValue as Controls[keyof Controls])
    )
    .sort((left, right) => {
      const priorityDelta =
        getControlPriority(left.controlId) - getControlPriority(right.controlId);
      if (priorityDelta !== 0) return priorityDelta;
      return left.originalIndex - right.originalIndex;
    });

  const hasImprovedControl =
    improvableControls.length === 0 ||
    improvableControls.some(({ controlId, initialValue, currentValue }) =>
      isControlImproved(
        controlId,
        initialValue as Controls[keyof Controls],
        currentValue as Controls[keyof Controls] | undefined
      )
    );

  const unresolvedControl =
    improvableControls.find(
      ({ controlId, initialValue, currentValue }) =>
        !isControlImproved(
          controlId,
          initialValue as Controls[keyof Controls],
          currentValue as Controls[keyof Controls] | undefined
        )
    ) ?? null;

  const rawRiskReduction = scenarioStartRisk === null ? 0 : scenarioStartRisk - scoreTotal;
  const hasLoweredRisk =
    (scenarioStartRisk !== null && rawRiskReduction >= 0.5) || meetsWinCondition;

  const completionMap: Record<OnboardingGuideStepId, boolean> = {
    segment: hasSegmentedRiskDevice,
    flag: hasFlaggedUnknownDevice,
    control: hasImprovedControl,
    score: hasLoweredRisk,
  };

  const nextIncompleteStep = STEP_ORDER.find((stepId) => !completionMap[stepId]);
  const completedCount = STEP_ORDER.filter((stepId) => completionMap[stepId]).length;

  return {
    hasSegmentedRiskDevice,
    hasFlaggedUnknownDevice,
    hasImprovedControl,
    hasLoweredRisk,
    completedCount,
    totalSteps: STEP_ORDER.length,
    nextStepId: nextIncompleteStep ?? "complete",
    steps: STEP_ORDER.map((stepId) => ({
      id: stepId,
      completed: completionMap[stepId],
      status: completionMap[stepId]
        ? "done"
        : stepId === nextIncompleteStep
          ? "current"
          : "up_next",
    })),
    segmentCandidateId: unresolvedSegmentDevice?.id ?? null,
    segmentRecommendedZoneId: unresolvedSegmentDevice
      ? getRecommendedZoneId(unresolvedSegmentDevice)
      : null,
    unknownCandidateId: unresolvedUnknownDevice?.id ?? null,
    controlCandidateId: unresolvedControl?.controlId ?? null,
  };
}
