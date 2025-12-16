export interface TutorialStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement: "top" | "bottom" | "left" | "right" | "center";
  action?: string;
  highlightZone?: string;
}

export const tutorialSteps: TutorialStep[] = [
  {
    id: "welcome",
    target: "body",
    title: "Welcome to Device Triage Planner",
    content: "This tool teaches you how to organize devices on your network for better security. We'll walk you through the key concepts step by step.",
    placement: "center"
  },
  {
    id: "scenario-selector",
    target: "[data-testid='select-scenario']",
    title: "Choose a Scenario",
    content: "Start by selecting a scenario. Each one simulates a different network environment with various devices that need to be organized.",
    placement: "bottom"
  },
  {
    id: "zones-overview",
    target: "[data-testid='zones-container']",
    title: "Understanding Trust Zones",
    content: "Your network is divided into four zones based on trust level. Each zone has different access permissions and security levels.",
    placement: "top"
  },
  {
    id: "main-zone",
    target: "[data-testid='zone-main']",
    title: "Main Network Zone",
    content: "This is for your most trusted devices - personal computers, phones, and tablets that need full network access.",
    placement: "right",
    highlightZone: "main"
  },
  {
    id: "guest-zone",
    target: "[data-testid='zone-guest']",
    title: "Guest Network Zone",
    content: "Visitor devices belong here. They get internet access but can't see or reach your main devices.",
    placement: "left",
    highlightZone: "guest"
  },
  {
    id: "iot-zone",
    target: "[data-testid='zone-iot']",
    title: "IoT Network Zone",
    content: "Smart home devices like cameras, thermostats, and speakers should be isolated here. These often have weaker security.",
    placement: "right",
    highlightZone: "iot"
  },
  {
    id: "investigate-zone",
    target: "[data-testid='zone-investigate']",
    title: "Investigate Zone",
    content: "Unknown or suspicious devices go here for review. Keep them isolated until you determine what they are.",
    placement: "left",
    highlightZone: "investigate"
  },
  {
    id: "device-cards",
    target: "[data-testid^='device-card-']",
    title: "Moving Devices",
    content: "You can drag devices between zones, or use the dropdown menu on each card to reassign them. Try organizing the devices based on their type and risk level.",
    placement: "bottom"
  },
  {
    id: "risk-meter",
    target: "[data-testid='risk-meter-card']",
    title: "Risk Score",
    content: "This meter shows your current network risk level. Lower is better! The goal is typically to get below 35 points.",
    placement: "left"
  },
  {
    id: "controls",
    target: "[data-testid='controls-drawer']",
    title: "Security Controls",
    content: "Toggle these security controls to further reduce risk. Each control addresses different vulnerabilities in your network.",
    placement: "left"
  },
  {
    id: "explain-panel",
    target: "[data-testid='explain-score-panel']",
    title: "Understanding Your Score",
    content: "This panel explains why your score is what it is. Each item shows what's adding to your risk and hints at how to fix it.",
    placement: "left"
  },
  {
    id: "complete",
    target: "body",
    title: "You're Ready!",
    content: "That's the basics! Try to get the risk score as low as possible by organizing devices into appropriate zones and enabling security controls. Good luck!",
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
