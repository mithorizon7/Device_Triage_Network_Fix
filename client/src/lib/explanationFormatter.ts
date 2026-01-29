import type { TFunction } from "i18next";
import type { ScoreResult } from "@shared/schema";

type Explanation = ScoreResult["explanations"][number];

export function formatExplanation(explanation: Explanation, t: TFunction): string {
  if (explanation.explainKey) {
    return t(explanation.explainKey, {
      ...(explanation.explainParams || {}),
      defaultValue: explanation.explain,
    });
  }
  return explanation.explain;
}
