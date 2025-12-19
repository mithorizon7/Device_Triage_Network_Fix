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
    placement: "center"
  },
  {
    id: "scenario-selector",
    target: "[data-testid='select-scenario']",
    titleKey: "tutorial.steps.scenarioSelector.title",
    contentKey: "tutorial.steps.scenarioSelector.content",
    placement: "bottom"
  },
  {
    id: "the-problem",
    target: "[data-testid='zone-main']",
    titleKey: "tutorial.steps.theProblem.title",
    contentKey: "tutorial.steps.theProblem.content",
    placement: "right",
    highlightZone: "main"
  },
  {
    id: "main-zone",
    target: "[data-testid='zone-main']",
    titleKey: "tutorial.steps.mainZone.title",
    contentKey: "tutorial.steps.mainZone.content",
    placement: "right",
    highlightZone: "main"
  },
  {
    id: "guest-zone",
    target: "[data-testid='zone-guest']",
    titleKey: "tutorial.steps.guestZone.title",
    contentKey: "tutorial.steps.guestZone.content",
    placement: "left",
    highlightZone: "guest"
  },
  {
    id: "iot-zone",
    target: "[data-testid='zone-iot']",
    titleKey: "tutorial.steps.iotZone.title",
    contentKey: "tutorial.steps.iotZone.content",
    placement: "right",
    highlightZone: "iot"
  },
  {
    id: "device-cards",
    target: "[data-testid^='card-device-']",
    titleKey: "tutorial.steps.deviceCards.title",
    contentKey: "tutorial.steps.deviceCards.content",
    placement: "bottom"
  },
  {
    id: "flag-investigation",
    target: "[data-testid^='button-flag-']",
    titleKey: "tutorial.steps.flagInvestigation.title",
    contentKey: "tutorial.steps.flagInvestigation.content",
    placement: "left"
  },
  {
    id: "risk-meter",
    target: "[data-testid='risk-meter-card']",
    titleKey: "tutorial.steps.riskMeter.title",
    contentKey: "tutorial.steps.riskMeter.content",
    placement: "left"
  },
  {
    id: "controls",
    target: "[data-testid='controls-drawer']",
    titleKey: "tutorial.steps.controls.title",
    contentKey: "tutorial.steps.controls.content",
    placement: "left"
  },
  {
    id: "insights-panel",
    target: "[data-testid='insights-card']",
    titleKey: "tutorial.steps.insightsPanel.title",
    contentKey: "tutorial.steps.insightsPanel.content",
    placement: "left"
  },
  {
    id: "complete",
    target: "body",
    titleKey: "tutorial.steps.complete.title",
    contentKey: "tutorial.steps.complete.content",
    placement: "center"
  }
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
