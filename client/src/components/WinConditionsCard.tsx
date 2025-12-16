import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Circle } from "lucide-react";
import type { Scenario, Controls } from "@shared/schema";

interface WinConditionsCardProps {
  scenario: Scenario;
  currentScore: number;
  controls: Controls;
}

const controlKeys: Record<string, string> = {
  wifiSecurity: "controls.wifiSecurity",
  strongWifiPassword: "controls.strongWifiPassword",
  guestNetworkEnabled: "controls.guestNetworkEnabled",
  iotNetworkEnabled: "controls.iotNetworkEnabled",
  mfaEnabled: "controls.mfaEnabled",
  autoUpdatesEnabled: "controls.autoUpdatesEnabled",
  defaultPasswordsAddressed: "controls.defaultPasswordsAddressed"
};

export function WinConditionsCard({ scenario, currentScore, controls }: WinConditionsCardProps) {
  const { t } = useTranslation();
  const winConditions = scenario.suggestedWinConditions;
  
  if (!winConditions || (!winConditions.maxTotalRisk && !winConditions.requires?.length)) {
    return null;
  }

  const targetScore = winConditions.maxTotalRisk;
  const scoreAchieved = targetScore !== undefined && currentScore <= targetScore;
  
  const requiredControls = winConditions.requires || [];
  const controlsStatus = requiredControls.map(req => {
    const currentValue = controls[req.control as keyof Controls];
    const met = currentValue === req.value;
    const controlLabel = t(controlKeys[req.control] || req.control);
    
    let goalText: string;
    if (typeof req.value === "boolean") {
      goalText = req.value 
        ? t('goals.enable', { control: controlLabel })
        : t('goals.disable', { control: controlLabel });
    } else {
      goalText = t('goals.setTo', { control: controlLabel, value: req.value });
    }
    
    return {
      control: req.control,
      goalText,
      requiredValue: req.value,
      currentValue,
      met
    };
  });

  const allRequirementsMet = scoreAchieved && controlsStatus.every(c => c.met);

  return (
    <Card 
      className={allRequirementsMet ? "border-emerald-500/50" : undefined}
      data-testid="win-conditions-card"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          {t('goals.title')}
          {allRequirementsMet && (
            <Badge variant="default" className="ml-auto bg-emerald-500 hover:bg-emerald-600">
              {t('goals.allComplete')}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {targetScore !== undefined && (
          <div className="flex items-center gap-2" data-testid="goal-score">
            {scoreAchieved ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            )}
            <span className={`text-sm ${scoreAchieved ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
              {t('goals.reduceRiskTo', { target: targetScore })}
            </span>
            <span className="ml-auto text-sm font-mono text-muted-foreground">
              {t('goals.currentScore', { current: Math.round(currentScore), target: targetScore })}
            </span>
          </div>
        )}
        
        {controlsStatus.map(({ control, goalText, met }) => (
          <div key={control} className="flex items-center gap-2" data-testid={`goal-control-${control}`}>
            {met ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
            )}
            <span className={`text-sm ${met ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
              {goalText}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
