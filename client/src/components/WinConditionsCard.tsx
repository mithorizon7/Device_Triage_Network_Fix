import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Circle } from "lucide-react";
import type { Scenario, Controls } from "@shared/schema";

interface WinConditionsCardProps {
  scenario: Scenario;
  currentScore: number;
  controls: Controls;
}

const controlLabels: Record<string, string> = {
  wifiSecurity: "Wi-Fi Security",
  strongWifiPassword: "Strong Wi-Fi Password",
  guestNetworkEnabled: "Guest Network",
  iotNetworkEnabled: "IoT Network",
  mfaEnabled: "MFA",
  autoUpdatesEnabled: "Auto Updates",
  defaultPasswordsAddressed: "Default Passwords Changed"
};

function formatGoalText(control: string, requiredValue: boolean | string): string {
  const label = controlLabels[control] || control;
  if (typeof requiredValue === "boolean") {
    return requiredValue ? `Enable ${label}` : `Disable ${label}`;
  }
  return `Set ${label} to ${requiredValue}`;
}

export function WinConditionsCard({ scenario, currentScore, controls }: WinConditionsCardProps) {
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
    return {
      control: req.control,
      goalText: formatGoalText(req.control, req.value),
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
          Goals
          {allRequirementsMet && (
            <Badge variant="default" className="ml-auto bg-emerald-500 hover:bg-emerald-600">
              Complete
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
              Reduce risk score to {targetScore} or below
            </span>
            <span className="ml-auto text-sm font-mono text-muted-foreground">
              {Math.round(currentScore)}/{targetScore}
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
