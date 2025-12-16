const PROGRESS_KEY = "device_triage_progress";
const TUTORIAL_KEY = "device_triage_tutorial_completed";

export interface ScenarioProgress {
  scenarioId: string;
  scenarioTitle: string;
  bestScore: number;
  completedAt: string | null;
  attempts: number;
  lastAttemptAt: string;
}

export interface UserProgress {
  scenarios: Record<string, ScenarioProgress>;
  badges: Badge[];
  totalCompletions: number;
  firstCompletedAt: string | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: string;
  scenarioId?: string;
}

const BADGE_DEFINITIONS = {
  first_completion: {
    name: "First Steps",
    description: "Complete your first scenario"
  },
  all_builtin: {
    name: "Security Scholar",
    description: "Complete all three built-in scenarios"
  },
  perfect_score: {
    name: "Perfect Security",
    description: "Achieve a risk score of 20 or below"
  },
  iot_master: {
    name: "IoT Master",
    description: "Complete a scenario with all IoT devices properly isolated"
  },
  quick_learner: {
    name: "Quick Learner",
    description: "Complete a scenario on your first attempt"
  },
  persistent: {
    name: "Persistent",
    description: "Complete a scenario after 5 or more attempts"
  },
  custom_creator: {
    name: "Scenario Author",
    description: "Create and save a custom scenario"
  }
};

export function getProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) {
      return {
        scenarios: {},
        badges: [],
        totalCompletions: 0,
        firstCompletedAt: null
      };
    }
    return JSON.parse(stored);
  } catch {
    return {
      scenarios: {},
      badges: [],
      totalCompletions: 0,
      firstCompletedAt: null
    };
  }
}

export function saveProgress(progress: UserProgress): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function recordAttempt(
  scenarioId: string,
  scenarioTitle: string,
  score: number,
  meetsWinCondition: boolean,
  iotIsolated: boolean = false
): { newBadges: Badge[], isNewCompletion: boolean } {
  const progress = getProgress();
  const now = new Date().toISOString();
  const newBadges: Badge[] = [];
  let isNewCompletion = false;

  const existing = progress.scenarios[scenarioId] || {
    scenarioId,
    scenarioTitle,
    bestScore: 100,
    completedAt: null,
    attempts: 0,
    lastAttemptAt: now
  };

  existing.attempts += 1;
  existing.lastAttemptAt = now;
  existing.scenarioTitle = scenarioTitle;

  if (score < existing.bestScore) {
    existing.bestScore = score;
  }

  const wasCompleted = existing.completedAt !== null;

  if (meetsWinCondition && !wasCompleted) {
    existing.completedAt = now;
    isNewCompletion = true;
    progress.totalCompletions += 1;

    if (!progress.firstCompletedAt) {
      progress.firstCompletedAt = now;
      const badge = awardBadge(progress, "first_completion");
      if (badge) newBadges.push(badge);
    }

    if (existing.attempts === 1) {
      const badge = awardBadge(progress, "quick_learner", scenarioId);
      if (badge) newBadges.push(badge);
    }

    if (existing.attempts >= 5) {
      const badge = awardBadge(progress, "persistent", scenarioId);
      if (badge) newBadges.push(badge);
    }

    const builtInScenarios = ["family_iot_sprawl_v1", "small_office_v1", "hotel_public_v1"];
    const completedBuiltIn = builtInScenarios.filter(id => progress.scenarios[id]?.completedAt);
    if (builtInScenarios.includes(scenarioId)) {
      completedBuiltIn.push(scenarioId);
    }
    if (new Set(completedBuiltIn).size === 3) {
      const badge = awardBadge(progress, "all_builtin");
      if (badge) newBadges.push(badge);
    }
  }

  if (score <= 20 && !hasBadge(progress, "perfect_score")) {
    const badge = awardBadge(progress, "perfect_score", scenarioId);
    if (badge) newBadges.push(badge);
  }

  if (iotIsolated && meetsWinCondition && !hasBadge(progress, "iot_master")) {
    const badge = awardBadge(progress, "iot_master", scenarioId);
    if (badge) newBadges.push(badge);
  }

  progress.scenarios[scenarioId] = existing;
  saveProgress(progress);

  return { newBadges, isNewCompletion };
}

export function recordCustomScenarioCreated(): Badge | null {
  const progress = getProgress();
  const badge = awardBadge(progress, "custom_creator");
  if (badge) {
    saveProgress(progress);
  }
  return badge;
}

function hasBadge(progress: UserProgress, badgeId: string): boolean {
  return progress.badges.some(b => b.id === badgeId);
}

function awardBadge(progress: UserProgress, badgeId: string, scenarioId?: string): Badge | null {
  if (hasBadge(progress, badgeId)) return null;
  
  const definition = BADGE_DEFINITIONS[badgeId as keyof typeof BADGE_DEFINITIONS];
  if (!definition) return null;

  const badge: Badge = {
    id: badgeId,
    name: definition.name,
    description: definition.description,
    earnedAt: new Date().toISOString(),
    scenarioId
  };

  progress.badges.push(badge);
  return badge;
}

export function checkWinCondition(
  score: number,
  maxRisk: number = 35
): boolean {
  return score <= maxRisk;
}

export function getTutorialCompleted(): boolean {
  return localStorage.getItem(TUTORIAL_KEY) === "true";
}

export function setTutorialCompleted(): void {
  localStorage.setItem(TUTORIAL_KEY, "true");
}

export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

export function getCompletedScenarioIds(): string[] {
  const progress = getProgress();
  return Object.keys(progress.scenarios).filter(
    id => progress.scenarios[id].completedAt !== null
  );
}

export function getScenarioProgress(scenarioId: string): ScenarioProgress | null {
  const progress = getProgress();
  return progress.scenarios[scenarioId] || null;
}
