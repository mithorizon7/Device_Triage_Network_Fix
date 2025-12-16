import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Subscores } from "@shared/schema";
import { Shield, Key, Wrench } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RiskMeterProps {
  subscores: Subscores;
  total: number;
}

function getRiskLevel(score: number, t: (key: string) => string): { label: string; colorClass: string; bgClass: string } {
  if (score <= 25) {
    return { label: t('riskMeter.low'), colorClass: "text-emerald-600 dark:text-emerald-400", bgClass: "bg-emerald-500" };
  }
  if (score <= 50) {
    return { label: t('riskMeter.medium'), colorClass: "text-amber-600 dark:text-amber-400", bgClass: "bg-amber-500" };
  }
  if (score <= 75) {
    return { label: t('riskMeter.high'), colorClass: "text-orange-600 dark:text-orange-400", bgClass: "bg-orange-500" };
  }
  return { label: t('riskMeter.high'), colorClass: "text-red-600 dark:text-red-400", bgClass: "bg-red-500" };
}

function SubscoreBar({ 
  label, 
  value, 
  icon: Icon, 
  color 
}: { 
  label: string; 
  value: number; 
  icon: typeof Shield; 
  color: string;
}) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 group cursor-default">
          <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
            <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            <span className="text-xs text-muted-foreground truncate">{label}</span>
          </div>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-300 ease-out rounded-full`}
              style={{ width: `${clampedValue}%` }}
              role="progressbar"
              aria-valuenow={clampedValue}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${label}: ${clampedValue}%`}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground w-8 text-right">
            {Math.round(clampedValue)}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {label}: {Math.round(clampedValue)} / 100
      </TooltipContent>
    </Tooltip>
  );
}

export function RiskMeter({ subscores, total }: RiskMeterProps) {
  const { t } = useTranslation();
  const clampedTotal = Math.max(0, Math.min(100, total));
  const riskLevel = useMemo(() => getRiskLevel(clampedTotal, t), [clampedTotal, t]);

  return (
    <div className="space-y-4" data-testid="risk-meter">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{t('riskMeter.title')}</p>
          <div className="flex items-baseline gap-2">
            <span 
              className="text-5xl font-bold tabular-nums tracking-tight"
              data-testid="text-total-risk"
            >
              {Math.round(clampedTotal)}
            </span>
            <span className="text-lg text-muted-foreground">{t('riskMeter.of100')}</span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full ${riskLevel.bgClass}/20`}>
          <span className={`text-sm font-medium ${riskLevel.colorClass}`} data-testid="text-risk-level">
            {riskLevel.label}
          </span>
        </div>
      </div>

      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${riskLevel.bgClass} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedTotal}%` }}
          role="progressbar"
          aria-valuenow={clampedTotal}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t('riskMeter.title')}: ${clampedTotal}%`}
        />
        <div className="absolute inset-0 flex">
          <div className="w-1/4 border-r border-background/30" />
          <div className="w-1/4 border-r border-background/30" />
          <div className="w-1/4 border-r border-background/30" />
          <div className="w-1/4" />
        </div>
      </div>

      <div className="grid gap-2 pt-2">
        <SubscoreBar
          label={t('riskMeter.exposure')}
          value={subscores.exposure}
          icon={Shield}
          color="text-red-500 dark:text-red-400"
        />
        <SubscoreBar
          label={t('riskMeter.credential')}
          value={subscores.credentialAccount}
          icon={Key}
          color="text-amber-500 dark:text-amber-400"
        />
        <SubscoreBar
          label={t('riskMeter.hygiene')}
          value={subscores.hygiene}
          icon={Wrench}
          color="text-blue-500 dark:text-blue-400"
        />
      </div>
    </div>
  );
}
