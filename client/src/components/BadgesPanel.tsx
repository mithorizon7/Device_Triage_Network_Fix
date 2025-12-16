import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Award, Star, Shield, Zap, Target, BookOpen, FileText, Trophy
} from "lucide-react";
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
  custom_creator: FileText
};

const badgeColors: Record<string, string> = {
  first_completion: "text-yellow-500",
  all_builtin: "text-purple-500",
  perfect_score: "text-green-500",
  iot_master: "text-blue-500",
  quick_learner: "text-orange-500",
  persistent: "text-pink-500",
  custom_creator: "text-cyan-500"
};

export function BadgesPanel({ progress }: BadgesPanelProps) {
  const { badges, totalCompletions } = progress;

  if (badges.length === 0 && totalCompletions === 0) {
    return null;
  }

  return (
    <Card data-testid="badges-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Progress & Badges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" data-testid="text-completions">{totalCompletions}</span>
            <span className="text-muted-foreground">completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium" data-testid="text-badges-count">{badges.length}</span>
            <span className="text-muted-foreground">badges</span>
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
                  className="gap-1.5 py-1"
                  data-testid={`badge-${badge.id}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${colorClass}`} aria-hidden="true" />
                  {badge.name}
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
  const Icon = badgeIcons[badge.id] || Award;
  const colorClass = badgeColors[badge.id] || "text-foreground";

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-card border" data-testid={`notification-badge-${badge.id}`}>
      <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium">Badge Earned!</p>
        <p className="text-sm text-muted-foreground">{badge.name}: {badge.description}</p>
      </div>
    </div>
  );
}

export function CompletionBanner({ 
  score, 
  isNewCompletion 
}: { 
  score: number; 
  isNewCompletion: boolean;
}) {
  if (score > 35) return null;

  return (
    <div 
      className={`
        flex items-center gap-3 p-4 rounded-lg border
        ${isNewCompletion 
          ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400" 
          : "bg-muted border-border"
        }
      `}
      data-testid="completion-banner"
    >
      <Trophy className={`h-5 w-5 ${isNewCompletion ? "text-green-500" : "text-muted-foreground"}`} />
      <div>
        <p className="font-medium">
          {isNewCompletion ? "Scenario Complete!" : "Win Condition Met"}
        </p>
        <p className="text-sm opacity-80">
          Risk score: {Math.round(score)} (target: 35 or below)
        </p>
      </div>
    </div>
  );
}
