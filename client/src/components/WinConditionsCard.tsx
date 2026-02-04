import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Circle, ListChecks } from "lucide-react";
import type { Scenario, Controls, ControlsRegistry } from "@shared/schema";
import { getControlDefinition } from "@/lib/controlsRegistry";

interface WinConditionsCardProps {
  scenario: Scenario;
  currentScore: number;
  controls: Controls;
  requiredControls?: Array<{ control: string; value: boolean | string }>;
  controlsRegistry?: ControlsRegistry;
}

const controlKeys: Record<string, string> = {
  wifiSecurity: "controls.wifiSecurity",
  strongWifiPassword: "controls.strongWifiPassword",
  guestNetworkEnabled: "controls.guestNetworkEnabled",
  iotNetworkEnabled: "controls.iotNetworkEnabled",
  mfaEnabled: "controls.mfaEnabled",
  autoUpdatesEnabled: "controls.autoUpdatesEnabled",
  defaultPasswordsAddressed: "controls.defaultPasswordsAddressed",
  vpnEnabled: "controls.vpnEnabled",
  personalHotspot: "controls.personalHotspot",
  firewallEnabled: "controls.firewallEnabled",
  fileSharingDisabled: "controls.fileSharingDisabled",
  bluetoothDisabled: "controls.bluetoothDisabled",
  httpsOnly: "controls.httpsOnly",
  verifyNetworkAuthenticity: "controls.verifyNetwork",
};

export function WinConditionsCard({
  scenario,
  currentScore,
  controls,
  requiredControls: requiredControlsProp,
  controlsRegistry,
}: WinConditionsCardProps) {
  const { t } = useTranslation();
  const winConditions = scenario.suggestedWinConditions;

  const hasScoreGoal = winConditions?.maxTotalRisk !== undefined;
  const hasControlGoal = (winConditions?.requires?.length ?? 0) > 0;

  if (!winConditions || (!hasScoreGoal && !hasControlGoal)) {
    return null;
  }

  const targetScore = winConditions.maxTotalRisk;
  const scoreAchieved = hasScoreGoal && targetScore !== undefined && currentScore <= targetScore;

  const requiredControls = requiredControlsProp ?? winConditions.requires ?? [];
  const controlsStatus = requiredControls.map((req) => {
    const currentValue = controls[req.control as keyof Controls];
    const met = currentValue === req.value;
    const definition = getControlDefinition(controlsRegistry, req.control);
    const controlLabel = definition
      ? t(definition.labelKey)
      : t(controlKeys[req.control] || req.control);

    let goalText: string;
    if (typeof req.value === "boolean") {
      goalText = req.value
        ? t("goals.enable", { control: controlLabel })
        : t("goals.disable", { control: controlLabel });
    } else {
      goalText = t("goals.setTo", { control: controlLabel, value: req.value });
    }

    return {
      control: req.control,
      goalText,
      requiredValue: req.value,
      currentValue,
      met,
    };
  });

  const scoreRequirementMet = hasScoreGoal ? scoreAchieved : true;
  const allRequirementsMet = scoreRequirementMet && controlsStatus.every((c) => c.met);
  const missingControlsCount = controlsStatus.filter((c) => !c.met).length;
  const needsScore = hasScoreGoal && !scoreAchieved;
  const totalRequirements = (hasScoreGoal ? 1 : 0) + controlsStatus.length;
  const completedRequirements =
    (scoreRequirementMet ? 1 : 0) + controlsStatus.filter((c) => c.met).length;
  const progressPercent =
    totalRequirements > 0 ? Math.round((completedRequirements / totalRequirements) * 100) : 0;
  const statusMessage = !allRequirementsMet
    ? needsScore && missingControlsCount > 0
      ? t("goals.missingBoth", { target: targetScore, count: missingControlsCount })
      : needsScore
        ? t("goals.missingScore", { target: targetScore })
        : missingControlsCount > 0
          ? t("goals.missingControls", { count: missingControlsCount })
          : null
    : null;

  return (
    <Card
      className={allRequirementsMet ? "border-primary/40" : undefined}
      data-testid="win-conditions-card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 font-display tracking-[0.12em] uppercase">
          <Target className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
          {t("goals.title")}
          {allRequirementsMet && (
            <Badge variant="default" className="ml-auto">
              {t("goals.allComplete")}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {totalRequirements > 0 && (
          <div className="space-y-2" data-testid="goals-progress">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{t("goals.checklistTitle")}</span>
              </div>
              <span>
                {t("goals.progress", {
                  completed: completedRequirements,
                  total: totalRequirements,
                })}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted/70">
              <div
                className="h-1.5 rounded-full bg-primary/80"
                style={{ width: `${progressPercent}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        )}
        {statusMessage && (
          <div
            className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground"
            data-testid="goals-status"
          >
            {statusMessage}
          </div>
        )}
        {targetScore !== undefined && (
          <div className="flex items-center gap-2" data-testid="goal-score">
            {scoreAchieved ? (
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            )}
            <span className={`text-sm ${scoreAchieved ? "text-primary" : "text-foreground"}`}>
              {t("goals.reduceRiskTo", { target: targetScore })}
            </span>
            <span className="ml-auto text-sm font-mono text-muted-foreground">
              {t("goals.currentScore", { current: Math.round(currentScore), target: targetScore })}
            </span>
          </div>
        )}

        {controlsStatus.map(({ control, goalText, met }) => (
          <div
            key={control}
            className="flex items-center gap-2"
            data-testid={`goal-control-${control}`}
          >
            {met ? (
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            )}
            <span className={`text-sm ${met ? "text-primary" : "text-foreground"}`}>
              {goalText}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
