import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { ScoreResult } from "@shared/schema";
import { formatExplanation } from "@/lib/explanationFormatter";

interface ExplainScorePanelProps {
  explanations: ScoreResult["explanations"];
  maxItems?: number;
  sortOrder?: string;
  embedded?: boolean;
  actionInsight?: { key: string; params?: Record<string, string | number> } | null;
}

function getDeltaDisplay(
  delta: Record<string, number>,
  t: (key: string) => string
): {
  total: number;
  breakdown: string[];
} {
  const deltaKeyMap: Record<string, string> = {
    credentialAccount: "riskMeter.credential",
    exposure: "riskMeter.exposure",
    hygiene: "riskMeter.hygiene",
  };

  const entries = Object.entries(delta);
  const total = entries.reduce((sum, [, val]) => sum + val, 0);
  const breakdown = entries
    .filter(([, val]) => val !== 0)
    .map(([key, val]) => {
      const sign = val > 0 ? "+" : "";
      const translationKey = deltaKeyMap[key];
      const label = translationKey ? t(translationKey) : t(`riskMeter.${key}`);
      return `${sign}${val} ${label}`;
    });
  return { total, breakdown };
}

export function ExplainScorePanel({
  explanations,
  maxItems = 8,
  sortOrder = "largestAbsoluteImpactFirst",
  embedded = false,
  actionInsight,
}: ExplainScorePanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const actionText = actionInsight ? t(actionInsight.key, actionInsight.params || {}) : null;

  const totalsBySubscore = explanations.reduce(
    (totals, exp) => {
      Object.entries(exp.delta).forEach(([key, value]) => {
        totals[key] = (totals[key] || 0) + value;
      });
      return totals;
    },
    {} as Record<string, number>
  );

  const topDrivers = [...explanations]
    .map((exp) => ({
      ...exp,
      totalDelta: Object.values(exp.delta).reduce((sum, val) => sum + val, 0),
    }))
    .filter((exp) => exp.totalDelta !== 0 && exp.ruleId !== "baseline")
    .sort((a, b) => Math.abs(b.totalDelta) - Math.abs(a.totalDelta))
    .slice(0, 3);

  const sortedExplanations = [...explanations]
    .map((exp) => ({
      ...exp,
      totalDelta: Object.values(exp.delta).reduce((sum, val) => sum + val, 0),
    }))
    .sort((a, b) => {
      switch (sortOrder) {
        case "largestIncreaseFirst":
          return b.totalDelta - a.totalDelta;
        case "largestReductionFirst":
          return a.totalDelta - b.totalDelta;
        case "largestAbsoluteImpactFirst":
        default:
          return Math.abs(b.totalDelta) - Math.abs(a.totalDelta);
      }
    })
    .slice(0, maxItems);

  const hasPositiveImpact = sortedExplanations.some((e) => e.totalDelta < 0);
  const hasNegativeImpact = sortedExplanations.some((e) => e.totalDelta > 0);

  const content = (
    <div className="space-y-2" data-testid="explain-content">
      {actionText && (
        <div className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">{t("explain.recentActionLabel")}</span>{" "}
          {actionText}
        </div>
      )}
      {Object.keys(totalsBySubscore).length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/70 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {t("explain.subscoreSummary")}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>
              {t("explain.subscoreValue", {
                label: t("riskMeter.exposure"),
                value: totalsBySubscore.exposure
                  ? `${totalsBySubscore.exposure > 0 ? "+" : ""}${totalsBySubscore.exposure}`
                  : "0",
              })}
            </span>
            <span>
              {t("explain.subscoreValue", {
                label: t("riskMeter.credential"),
                value: totalsBySubscore.credentialAccount
                  ? `${totalsBySubscore.credentialAccount > 0 ? "+" : ""}${totalsBySubscore.credentialAccount}`
                  : "0",
              })}
            </span>
            <span>
              {t("explain.subscoreValue", {
                label: t("riskMeter.hygiene"),
                value: totalsBySubscore.hygiene
                  ? `${totalsBySubscore.hygiene > 0 ? "+" : ""}${totalsBySubscore.hygiene}`
                  : "0",
              })}
            </span>
          </div>
        </div>
      )}
      {topDrivers.length > 0 && (
        <div className="rounded-xl border border-border/60 bg-card/70 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">
            {t("explain.topDrivers")}
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            {topDrivers.map((driver) => {
              const delta = driver.totalDelta;
              return (
                <div
                  key={`driver-${driver.ruleId}`}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="flex-1 min-w-0">{formatExplanation(driver, t)}</span>
                  <span className="tabular-nums">
                    {delta > 0 ? "+" : ""}
                    {delta}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {sortedExplanations.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-4">
          {t("explain.noFactors")}
        </div>
      ) : (
        <>
          {sortedExplanations.map((exp, index) => {
            const { total, breakdown } = getDeltaDisplay(exp.delta, t);
            const isPositive = total < 0;
            const isNegative = total > 0;
            const Icon = isPositive ? TrendingDown : isNegative ? TrendingUp : Minus;

            return (
              <div
                key={exp.ruleId}
                className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0"
                data-testid={`explain-item-${index}`}
              >
                <div
                  className={`
                  flex-shrink-0 p-1.5 rounded-lg mt-0.5
                  ${
                    isPositive
                      ? "bg-[hsl(var(--risk-low)/0.15)] text-[hsl(var(--risk-low))]"
                      : isNegative
                        ? "bg-[hsl(var(--risk-critical)/0.15)] text-[hsl(var(--risk-critical))]"
                        : "bg-muted/70 text-muted-foreground"
                  }
                `}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" data-testid={`text-explain-${index}`}>
                    {formatExplanation(exp, t)}
                  </p>
                  {breakdown.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {breakdown.join(", ")}
                    </p>
                  )}
                </div>
                <div
                  className={`
                  flex-shrink-0 text-sm font-semibold tabular-nums
                  ${
                    isPositive
                      ? "text-[hsl(var(--risk-low))]"
                      : isNegative
                        ? "text-[hsl(var(--risk-critical))]"
                        : "text-muted-foreground"
                  }
                `}
                >
                  {total > 0 ? "+" : ""}
                  {total}
                </div>
              </div>
            );
          })}

          {hasPositiveImpact && hasNegativeImpact && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1">
                <TrendingDown className="h-3 w-3 text-[hsl(var(--risk-low))]" />
                <span>{t("explain.reducesRisk")}</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-[hsl(var(--risk-critical))]" />
                <span>{t("explain.increasesRisk")}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card data-testid="explain-score-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            {t("explain.title")}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-explain"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? t("explain.collapseExplanations") : t("explain.expandExplanations")
            }
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {!isExpanded && (
          <p className="text-xs text-muted-foreground">
            {t("explain.factorsAffecting", { count: sortedExplanations.length })}
          </p>
        )}
      </CardHeader>

      {isExpanded && <CardContent>{content}</CardContent>}
    </Card>
  );
}
