export interface TutorialStep {
  id: string;
  target: string;
  titleKey: string;
  contentKey: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  action?: string;
  highlightZone?: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    target: "body",
    titleKey: "tutorial.steps.welcome.title",
    contentKey: "tutorial.steps.welcome.content",
    placement: "center",
  },
  {
    id: "scenario-selector",
    target: "[data-testid='select-scenario']",
    titleKey: "tutorial.steps.scenarioSelector.title",
    contentKey: "tutorial.steps.scenarioSelector.content",
    placement: "bottom",
  },
  {
    id: "device-cards",
    target: "[data-testid^='card-device-'], [data-testid^='list-device-']",
    titleKey: "tutorial.steps.deviceCards.title",
    contentKey: "tutorial.steps.deviceCards.content",
    placement: "bottom",
    action: "segment-device",
  },
  {
    id: "flag-investigation",
    target: "[data-testid^='button-flag-'], [data-testid^='list-button-flag-']",
    titleKey: "tutorial.steps.flagInvestigation.title",
    contentKey: "tutorial.steps.flagInvestigation.content",
    placement: "left",
    action: "flag-unknown",
  },
  {
    id: "controls",
    target: "[data-testid='controls-drawer']",
    titleKey: "tutorial.steps.controls.title",
    contentKey: "tutorial.steps.controls.content",
    placement: "left",
    action: "enable-control",
  },
  {
    id: "risk-meter",
    target: "[data-testid='risk-meter-card']",
    titleKey: "tutorial.steps.riskMeter.title",
    contentKey: "tutorial.steps.riskMeter.content",
    placement: "left",
    action: "lower-risk",
  },
  {
    id: "insights-panel",
    target: "[data-testid='insights-card']",
    titleKey: "tutorial.steps.insightsPanel.title",
    contentKey: "tutorial.steps.insightsPanel.content",
    placement: "left",
  },
  {
    id: "complete",
    target: "body",
    titleKey: "tutorial.steps.complete.title",
    contentKey: "tutorial.steps.complete.content",
    placement: "center",
  },
];

const TUTORIAL_STORAGE_KEY = "device_triage_tutorial_complete";

export function isTutorialComplete(): boolean {
  try {
    return localStorage.getItem(TUTORIAL_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markTutorialComplete(): void {
  try {
    localStorage.setItem(TUTORIAL_STORAGE_KEY, "true");
  } catch {
    // Ignore localStorage errors
  }
}

export function resetTutorial(): void {
  try {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
