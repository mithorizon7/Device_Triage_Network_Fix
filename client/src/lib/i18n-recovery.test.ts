import { afterEach, expect, it, vi } from "vitest";
import i18n, { initializeI18n } from "./i18n";

vi.mock("../locales/ru.json", () => {
  throw new Error("Locale download unavailable");
});
afterEach(() => vi.unstubAllGlobals());

it("starts in bundled English when a preferred locale cannot be downloaded", async () => {
  vi.stubGlobal("window", {
    localStorage: { getItem: () => "ru", setItem: vi.fn(), removeItem: vi.fn() },
    navigator: { languages: ["ru"], language: "ru" },
  });
  await initializeI18n();
  expect(i18n.language).toBe("en");
  expect(i18n.t("app.title")).not.toBe("app.title");
});

it("keeps working in the current language after a later locale download fails", async () => {
  await initializeI18n();
  await expect(i18n.changeLanguage("ru")).rejects.toThrow();
  expect(i18n.language).toBe("en");
});
