import { describe, it, expect, beforeEach } from "vitest";
import {
  checkWinCondition,
  recordAttempt,
  getProgress,
  getTutorialCompleted,
  setTutorialCompleted,
  saveProgress,
} from "./progressTracking";
import type { Controls } from "@shared/schema";

const createLocalStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

describe("checkWinCondition", () => {
  it("returns true when score meets target and no required controls", () => {
    expect(checkWinCondition(20, 35)).toBe(true);
  });

  it("returns false when score exceeds target", () => {
    expect(checkWinCondition(40, 35)).toBe(false);
  });

  it("returns false when required controls are not met", () => {
    const controls: Controls = { mfaEnabled: false };
    const requires = [{ control: "mfaEnabled", value: true }];
    expect(checkWinCondition(20, 35, requires, controls)).toBe(false);
  });

  it("returns true when score and required controls are met", () => {
    const controls: Controls = { mfaEnabled: true };
    const requires = [{ control: "mfaEnabled", value: true }];
    expect(checkWinCondition(20, 35, requires, controls)).toBe(true);
  });
});

describe("recordAttempt", () => {
  beforeEach(() => {
    const mockStorage = createLocalStorageMock();
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      configurable: true,
    });
    mockStorage.clear();
  });

  it("awards perfect score badge only when win condition is met and score <= 10", () => {
    recordAttempt("scenario-1", "Scenario", 9, false, false);
    expect(getProgress().badges.some((badge) => badge.id === "perfect_score")).toBe(false);

    recordAttempt("scenario-1", "Scenario", 9, true, false);
    expect(getProgress().badges.some((badge) => badge.id === "perfect_score")).toBe(true);
  });

  it("does not award perfect score badge above threshold", () => {
    recordAttempt("scenario-2", "Scenario", 11, true, false);
    expect(getProgress().badges.some((badge) => badge.id === "perfect_score")).toBe(false);
  });

  it("awards the five-scenario badge on the fifth completion, not a later attempt", () => {
    for (let i = 1; i <= 4; i++) recordAttempt(`s${i}`, "Scenario", 30, true);
    const fifth = recordAttempt("s5", "Scenario", 30, true);
    expect(fifth.newBadges.some((badge) => badge.id === "security_expert")).toBe(true);
    expect(getProgress().totalCompletions).toBe(5);
    expect(recordAttempt("s5", "Scenario", 30, true).isNewCompletion).toBe(false);
    expect(getProgress().totalCompletions).toBe(5);
  });

  it("reads legacy tutorial completion key for backward compatibility", () => {
    localStorage.setItem("device_triage_tutorial_completed", "true");
    expect(getTutorialCompleted()).toBe(true);
  });

  it("writes tutorial completion to canonical key and clears legacy key", () => {
    localStorage.setItem("device_triage_tutorial_completed", "true");
    setTutorialCompleted();
    expect(localStorage.getItem("device_triage_tutorial_complete")).toBe("true");
    expect(localStorage.getItem("device_triage_tutorial_completed")).toBeNull();
  });

  it.each(["null", "{}", "[]", "not-json", '{"scenarios":null,"badges":[]}'])(
    "recovers safely from malformed progress %s without changing storage on read",
    (stored) => {
      localStorage.setItem("device_triage_progress", stored);
      expect(getProgress().badges).toEqual([]);
      expect(getProgress().totalCompletions).toBe(0);
      expect(localStorage.getItem("device_triage_progress")).toBe(stored);
    }
  );

  it("retains damaged progress in a recovery copy before saving repaired history", () => {
    localStorage.setItem("device_triage_progress", "null");
    recordAttempt("scenario-1", "Scenario", 30, true);
    expect(localStorage.getItem("device_triage_progress_recovery")).toBe("null");
    expect(getProgress().totalCompletions).toBe(1);
  });

  it("never overwrites a different existing recovery copy", () => {
    localStorage.setItem("device_triage_progress_recovery", "older history");
    localStorage.setItem("device_triage_progress", "null");
    saveProgress(getProgress());
    expect(localStorage.getItem("device_triage_progress")).toBe("null");
    expect(localStorage.getItem("device_triage_progress_recovery")).toBe("older history");
  });

  it.each(["__proto__", "constructor", "toString"])(
    "records prototype-named scenario %s without inherited state",
    (id) => {
      recordAttempt(id, "Scenario", 30, true);
      const progress = getProgress();
      expect(progress.scenarios[id]?.attempts).toBe(1);
      expect(progress.totalCompletions).toBe(1);
      expect(Object.getPrototypeOf(progress.scenarios)).toBeNull();
      expect((Object.prototype as Record<string, unknown>).attempts).toBeUndefined();
    }
  );

  it("rejects excessive progress collections before validating their elements", () => {
    localStorage.setItem(
      "device_triage_progress",
      JSON.stringify({
        scenarios: {},
        badges: Array(9).fill(null),
        totalCompletions: 0,
        firstCompletedAt: null,
      })
    );
    expect(getProgress().badges).toEqual([]);
    localStorage.setItem("device_triage_progress", " ".repeat(1_000_001));
    expect(getProgress().scenarios).toEqual({});
  });
});
