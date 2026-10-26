import type { Controls } from "@shared/schema";
import { z } from "zod";

const PROGRESS_KEY = "device_triage_progress";
const TUTORIAL_KEY = "device_triage_tutorial_complete";
const LEGACY_TUTORIAL_KEY = "device_triage_tutorial_completed";
const PROGRESS_RECOVERY_KEY = "device_triage_progress_recovery";
const MAX_PROGRESS_SIZE = 1_000_000;

const timestampSchema = z.string().max(64);
const progressSchema = z
  .unknown()
  .refine(
    (value) => {
      if (typeof value !== "object" || value === null) return false;
      const { scenarios, badges } = value as Record<string, unknown>;
      return (
        typeof scenarios === "object" &&
        scenarios !== null &&
        !Array.isArray(scenarios) &&
        Object.keys(scenarios).length <= 1_000 &&
        Array.isArray(badges) &&
        badges.length <= 8
      );
    },
    { abort: true }
  )
  .pipe(
    z.object({
      scenarios: z.preprocess(
        (value) => new Map(Object.entries(value as Record<string, unknown>)),
        z
          .map(
            z.string().max(128),
            z.object({
              scenarioId: z.string().max(128),
              scenarioTitle: z.string().max(512),
              bestScore: z.number().min(0).max(100),
              completedAt: timestampSchema.nullable(),
              attempts: z.number().int().nonnegative(),
              lastAttemptAt: timestampSchema,
            })
          )
          .transform((entries) => Object.fromEntries(entries))
      ),
      badges: z
        .array(
          z.object({
            id: z.enum([
              "first_completion",
              "all_builtin",
              "perfect_score",
              "iot_master",
              "quick_learner",
              "persistent",
              "custom_creator",
              "security_expert",
            ]),
            name: z.string().max(128),
            description: z.string().max(128),
            earnedAt: timestampSchema,
            scenarioId: z.string().max(128).optional(),
          })
        )
        .max(8),
      totalCompletions: z.number().int().nonnegative(),
      firstCompletedAt: timestampSchema.nullable(),
    })
  );

function parseProgress(stored: string): UserProgress {
  if (stored.length > MAX_PROGRESS_SIZE) throw new Error("Progress size limit");
  const progress = progressSchema.parse(JSON.parse(stored));
  return { ...progress, scenarios: Object.assign(Object.create(null), progress.scenarios) };
}

function emptyProgress(): UserProgress {
  return {
    scenarios: Object.create(null),
    badges: [],
    totalCompletions: 0,
    firstCompletedAt: null,
  };
}

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

export const BADGE_DEFINITIONS: Record<string, { nameKey: string; descriptionKey: string }> = {
  first_completion: {
    nameKey: "badges.firstSteps",
    descriptionKey: "badges.firstStepsDesc",
  },
  all_builtin: {
    nameKey: "badges.zoneMaster",
    descriptionKey: "badges.zoneMasterDesc",
  },
  perfect_score: {
    nameKey: "badges.perfectScore",
    descriptionKey: "badges.perfectScoreDesc",
  },
  iot_master: {
    nameKey: "badges.iotWrangler",
    descriptionKey: "badges.iotWranglerDesc",
  },
  quick_learner: {
    nameKey: "badges.speedDemon",
    descriptionKey: "badges.speedDemonDesc",
  },
  persistent: {
    nameKey: "badges.persistent",
    descriptionKey: "badges.persistentDesc",
  },
  custom_creator: {
    nameKey: "badges.scenarioAuthor",
    descriptionKey: "badges.scenarioAuthorDesc",
  },
  security_expert: {
    nameKey: "badges.securityExpert",
    descriptionKey: "badges.securityExpertDesc",
  },
};

export function getProgress(): UserProgress {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (!stored) {
      return emptyProgress();
    }
    return parseProgress(stored);
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    const serialized = JSON.stringify(progress);
    parseProgress(serialized);
    const previous = localStorage.getItem(PROGRESS_KEY);
    if (previous) {
      try {
        parseProgress(previous);
      } catch {
        // Do not overwrite damaged history unless a recovery copy can be retained.
        if (localStorage.getItem(PROGRESS_RECOVERY_KEY) === null) {
          localStorage.setItem(PROGRESS_RECOVERY_KEY, previous);
        } else if (localStorage.getItem(PROGRESS_RECOVERY_KEY) !== previous) {
          return;
        }
      }
    }
    localStorage.setItem(PROGRESS_KEY, serialized);
  } catch {
    // Ignore localStorage errors (e.g., quota exceeded, private browsing)
  }
}

export function recordAttempt(
  scenarioId: string,
  scenarioTitle: string,
  score: number,
  meetsWinCondition: boolean,
  iotIsolated: boolean = false
): { newBadges: Badge[]; isNewCompletion: boolean } {
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
    lastAttemptAt: now,
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
    const completedBuiltIn = builtInScenarios.filter((id) => progress.scenarios[id]?.completedAt);
    if (builtInScenarios.includes(scenarioId)) {
      completedBuiltIn.push(scenarioId);
    }
    if (new Set(completedBuiltIn).size === 3) {
      const badge = awardBadge(progress, "all_builtin");
      if (badge) newBadges.push(badge);
    }
  }

  if (score <= 10 && meetsWinCondition && !hasBadge(progress, "perfect_score")) {
    const badge = awardBadge(progress, "perfect_score", scenarioId);
    if (badge) newBadges.push(badge);
  }

  if (iotIsolated && meetsWinCondition && !hasBadge(progress, "iot_master")) {
    const badge = awardBadge(progress, "iot_master", scenarioId);
    if (badge) newBadges.push(badge);
  }

  // Security Expert badge: Complete 5 different scenarios
  progress.scenarios[scenarioId] = existing;
  const completedScenarioCount = Object.values(progress.scenarios).filter(
    (s) => s.completedAt !== null
  ).length;
  if (completedScenarioCount >= 5 && !hasBadge(progress, "security_expert")) {
    const badge = awardBadge(progress, "security_expert");
    if (badge) newBadges.push(badge);
  }

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
  return progress.badges.some((b) => b.id === badgeId);
}

function awardBadge(progress: UserProgress, badgeId: string, scenarioId?: string): Badge | null {
  if (hasBadge(progress, badgeId)) return null;

  const definition = BADGE_DEFINITIONS[badgeId];
  if (!definition) return null;

  const badge: Badge = {
    id: badgeId,
    name: definition.nameKey,
    description: definition.descriptionKey,
    earnedAt: new Date().toISOString(),
    scenarioId,
  };

  progress.badges.push(badge);
  return badge;
}

export function checkWinCondition(
  score: number,
  maxRisk: number = 35,
  requires: Array<{ control: string; value: boolean | string }> = [],
  controls?: Controls | null
): boolean {
  const scoreMet = score <= maxRisk;
  if (!requires.length) return scoreMet;
  if (!controls) return false;

  const requirementsMet = requires.every(
    (req) => controls[req.control as keyof Controls] === req.value
  );

  return scoreMet && requirementsMet;
}

export function getTutorialCompleted(): boolean {
  try {
    return (
      localStorage.getItem(TUTORIAL_KEY) === "true" ||
      localStorage.getItem(LEGACY_TUTORIAL_KEY) === "true"
    );
  } catch {
    return false;
  }
}

export function setTutorialCompleted(): void {
  try {
    localStorage.setItem(TUTORIAL_KEY, "true");
    localStorage.removeItem(LEGACY_TUTORIAL_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

export function getBadgeDefinitions() {
  return BADGE_DEFINITIONS;
}

export function getCompletedScenarioIds(): string[] {
  const progress = getProgress();
  return Object.keys(progress.scenarios).filter(
    (id) => progress.scenarios[id].completedAt !== null
  );
}

export function getScenarioProgress(scenarioId: string): ScenarioProgress | null {
  const progress = getProgress();
  return progress.scenarios[scenarioId] || null;
}
