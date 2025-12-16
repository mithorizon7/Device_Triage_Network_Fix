import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { ScoreResult } from "@shared/schema";

interface ExplainScorePanelProps {
  explanations: ScoreResult["explanations"];
  maxItems?: number;
}

function getDeltaDisplay(delta: Record<string, number>, t: (key: string) => string): { 
  total: number; 
  breakdown: string[];
} {
  const deltaKeyMap: Record<string, string> = {
    credentialAccount: 'riskMeter.credential',
    exposure: 'riskMeter.exposure',
    hygiene: 'riskMeter.hygiene'
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
  maxItems = 8 
}: ExplainScorePanelProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const sortedExplanations = [...explanations]
    .map(exp => ({
      ...exp,
      totalDelta: Object.values(exp.delta).reduce((sum, val) => sum + val, 0)
    }))
    .sort((a, b) => Math.abs(b.totalDelta) - Math.abs(a.totalDelta))
    .slice(0, maxItems);

  const hasPositiveImpact = sortedExplanations.some(e => e.totalDelta < 0);
  const hasNegativeImpact = sortedExplanations.some(e => e.totalDelta > 0);

  return (
    <Card data-testid="explain-score-panel">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            {t('explain.title')}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            data-testid="button-toggle-explain"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? t('explain.collapseExplanations') : t('explain.expandExplanations')}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        {!isExpanded && (
          <p className="text-xs text-muted-foreground">
            {t('explain.factorsAffecting', { count: sortedExplanations.length })}
          </p>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-2">
          {sortedExplanations.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              {t('explain.noFactors')}
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
                    <div className={`
                      flex-shrink-0 p-1.5 rounded-md mt-0.5
                      ${isPositive 
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                        : isNegative 
                          ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                          : "bg-muted text-muted-foreground"
                      }
                    `}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" data-testid={`text-explain-${index}`}>
                        {exp.explain}
                      </p>
                      {breakdown.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {breakdown.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className={`
                      flex-shrink-0 text-sm font-semibold tabular-nums
                      ${isPositive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : isNegative 
                          ? "text-red-600 dark:text-red-400" 
                          : "text-muted-foreground"
                      }
                    `}>
                      {total > 0 ? "+" : ""}{total}
                    </div>
                  </div>
                );
              })}

              {hasPositiveImpact && hasNegativeImpact && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-3 w-3 text-emerald-500" />
                    <span>{t('explain.reducesRisk')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-red-500" />
                    <span>{t('explain.increasesRisk')}</span>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
