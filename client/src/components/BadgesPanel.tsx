import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Star, Shield, Zap, Target, BookOpen, FileText, Trophy } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Badge as BadgeType, UserProgress } from "@/lib/progressTracking";

interface BadgesPanelProps {
  progress: UserProgress;
}

const badgeIcons: Record<string, typeof Award> = {
  first_completion: Star,
  all_builtin: Trophy,
  perfect_score: Target,
  iot_master: Shield,
  quick_learner: Zap,
  persistent: BookOpen,
  custom_creator: FileText,
};

const badgeColors: Record<string, string> = {
  first_completion: "text-[hsl(var(--chart-4))]",
  all_builtin: "text-[hsl(var(--chart-3))]",
  perfect_score: "text-[hsl(var(--risk-low))]",
  iot_master: "text-[hsl(var(--chart-1))]",
  quick_learner: "text-[hsl(var(--accent))]",
  persistent: "text-[hsl(var(--chart-5))]",
  custom_creator: "text-[hsl(var(--chart-2))]",
};

export function BadgesPanel({ progress }: BadgesPanelProps) {
  const { t } = useTranslation();
  const { badges, totalCompletions } = progress;

  if (badges.length === 0 && totalCompletions === 0) {
    return null;
  }

  return (
    <Card data-testid="badges-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 font-display tracking-[0.12em] uppercase">
          <Award className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
          {t("badges.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" data-testid="text-completions">
              {totalCompletions}
            </span>
            <span className="text-muted-foreground">{t("badges.completed")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" data-testid="text-badges-count">
              {badges.length}
            </span>
            <span className="text-muted-foreground">{t("badges.badgesCount")}</span>
          </div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => {
              const Icon = badgeIcons[badge.id] || Award;
              const colorClass = badgeColors[badge.id] || "text-foreground";
              return (
                <Badge
                  key={badge.id}
                  variant="secondary"
                  className="gap-1.5 py-1.5"
                  data-testid={`badge-${badge.id}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${colorClass}`} aria-hidden="true" />
                  {t(badge.name)}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BadgeNotification({ badge }: { badge: BadgeType }) {
  const { t } = useTranslation();
  const Icon = badgeIcons[badge.id] || Award;
  const colorClass = badgeColors[badge.id] || "text-foreground";

  return (
    <div
      className="card-surface flex items-center gap-3 p-4 rounded-2xl"
      data-testid={`notification-badge-${badge.id}`}
    >
      <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium">{t("badges.badgeEarned")}</p>
        <p className="text-sm text-muted-foreground">
          {t("badges.badgeEarnedDetail", {
            name: t(badge.name),
            description: t(badge.description),
          })}
        </p>
      </div>
    </div>
  );
}

export function CompletionBanner({
  score,
  isNewCompletion,
}: {
  score: number;
  isNewCompletion: boolean;
}) {
  const { t } = useTranslation();

  if (score > 35) return null;

  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-2xl border
        ${
          isNewCompletion
            ? "bg-[hsl(var(--risk-low)/0.16)] border-[hsl(var(--risk-low)/0.4)] text-[hsl(var(--risk-low))]"
            : "bg-muted/60 border-border/60"
        }
      `}
      data-testid="completion-banner"
    >
      <Trophy
        className={`h-5 w-5 ${isNewCompletion ? "text-[hsl(var(--risk-low))]" : "text-muted-foreground"}`}
      />
      <div>
        <p className="font-medium">
          {isNewCompletion ? t("notifications.scenarioComplete") : t("badges.winConditionMet")}
        </p>
        <p className="text-sm opacity-80">
          {t("badges.riskScoreTarget", { score: Math.round(score), target: 35 })}
        </p>
      </div>
    </div>
  );
}
