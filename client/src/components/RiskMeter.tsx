import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Subscores } from "@shared/schema";
import { Shield, Key, Wrench } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface RiskMeterProps {
  subscores: Subscores;
  total: number;
}

function getRiskLevel(
  score: number,
  t: (key: string) => string
): { label: string; colorClass: string; bgClass: string } {
  if (score <= 25) {
    return {
      label: t("riskMeter.low"),
      colorClass: "text-[hsl(var(--risk-low))]",
      bgClass: "bg-[hsl(var(--risk-low))]",
    };
  }
  if (score <= 50) {
    return {
      label: t("riskMeter.medium"),
      colorClass: "text-[hsl(var(--risk-moderate))]",
      bgClass: "bg-[hsl(var(--risk-moderate))]",
    };
  }
  if (score <= 75) {
    return {
      label: t("riskMeter.high"),
      colorClass: "text-[hsl(var(--risk-high))]",
      bgClass: "bg-[hsl(var(--risk-high))]",
    };
  }
  return {
    label: t("riskMeter.critical"),
    colorClass: "text-[hsl(var(--risk-critical))]",
    bgClass: "bg-[hsl(var(--risk-critical))]",
  };
}

function SubscoreBar({
  label,
  value,
  icon: Icon,
  color,
  t,
}: {
  label: string;
  value: number;
  icon: typeof Shield;
  color: string;
  t: (key: string, options?: Record<string, string | number>) => string;
}) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const displayValue = Math.round(clampedValue);
  const ariaLabel = t("riskMeter.subscoreAria", { label, value: displayValue });
  const tooltipLabel = t("riskMeter.subscoreTooltip", { label, value: displayValue });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 group cursor-default">
          <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
            <Icon className={`h-4 w-4 ${color}`} aria-hidden="true" />
            <span className="text-xs text-muted-foreground truncate">{label}</span>
          </div>
          <div className="flex-1 h-2 bg-muted/70 rounded-full overflow-hidden">
            <div
              className={`h-full ${color.replace("text-", "bg-")} transition-all duration-300 ease-out rounded-full`}
              style={{ width: `${clampedValue}%` }}
              role="progressbar"
              aria-valuenow={clampedValue}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={ariaLabel}
            />
          </div>
          <span className="text-xs font-mono text-muted-foreground w-8 text-right">
            {displayValue}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltipLabel}
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
          <p className="eyebrow mb-2">{t("riskMeter.title")}</p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-5xl font-bold tabular-nums tracking-tight font-display"
              data-testid="text-total-risk"
            >
              {Math.round(clampedTotal)}
            </span>
            <span className="text-lg text-muted-foreground">{t("riskMeter.of100")}</span>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-full ${riskLevel.bgClass}/15 border border-border/60`}>
          <span
            className={`text-xs font-semibold tracking-[0.12em] uppercase ${riskLevel.colorClass}`}
            data-testid="text-risk-level"
          >
            {riskLevel.label}
          </span>
        </div>
      </div>

      <div className="relative h-3 bg-muted/70 rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${riskLevel.bgClass} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${clampedTotal}%` }}
          role="progressbar"
          aria-valuenow={clampedTotal}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${t("riskMeter.title")}: ${clampedTotal}%`}
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
          label={t("riskMeter.exposure")}
          value={subscores.exposure}
          icon={Shield}
          color="text-[hsl(var(--risk-critical))]"
          t={t}
        />
        <SubscoreBar
          label={t("riskMeter.credential")}
          value={subscores.credentialAccount}
          icon={Key}
          color="text-[hsl(var(--risk-moderate))]"
          t={t}
        />
        <SubscoreBar
          label={t("riskMeter.hygiene")}
          value={subscores.hygiene}
          icon={Wrench}
          color="text-[hsl(var(--risk-low))]"
          t={t}
        />
      </div>
    </div>
  );
}
