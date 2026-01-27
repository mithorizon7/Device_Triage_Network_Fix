import { describe, it, expect, beforeEach } from "vitest";
import { checkWinCondition, recordAttempt, getProgress } from "./progressTracking";
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
    }
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
      configurable: true
    });
    mockStorage.clear();
  });

  it("awards perfect score badge only when win condition is met and score <= 10", () => {
    recordAttempt("scenario-1", "Scenario", 9, false, false);
    expect(getProgress().badges.some(badge => badge.id === "perfect_score")).toBe(false);

    recordAttempt("scenario-1", "Scenario", 9, true, false);
    expect(getProgress().badges.some(badge => badge.id === "perfect_score")).toBe(true);
  });

  it("does not award perfect score badge above threshold", () => {
    recordAttempt("scenario-2", "Scenario", 11, true, false);
    expect(getProgress().badges.some(badge => badge.id === "perfect_score")).toBe(false);
  });
});
