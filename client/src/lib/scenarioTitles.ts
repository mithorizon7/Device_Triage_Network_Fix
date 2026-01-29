import type { Scenario } from "@shared/schema";
import type { TFunction } from "i18next";

export const builtInScenarioTitleKeys: Record<string, string> = {
  family_iot_sprawl_v1: "scenarios.familyIoT",
  small_office_v1: "scenarios.smallOffice",
  hotel_public_v1: "scenarios.hotelPublic",
};

export function getScenarioDisplayTitle(
  scenario: Pick<Scenario, "id" | "title">,
  t: TFunction
): string {
  const titleKey = builtInScenarioTitleKeys[scenario.id];
  return titleKey ? t(titleKey) : scenario.title;
}
