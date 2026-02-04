import { useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { GripVertical, HelpCircle, Shield, User, Briefcase, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Device, ZoneId, RiskFlag } from "@shared/schema";
import { getDeviceIcon } from "@/lib/deviceIcons";
import { zones } from "@/lib/zones";
import { getDeviceDisplayLabel } from "@/lib/i18n";

interface DeviceCardProps {
  device: Device;
  currentZone: ZoneId;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, deviceId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  scenarioId?: string;
  isFlagged?: boolean;
  onFlagToggle?: (deviceId: string) => void;
}

const riskFlagConfig: Record<
  RiskFlag,
  {
    labelKey: string;
    icon: typeof HelpCircle;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  unknown_device: { labelKey: "devices.unknownFlag", icon: HelpCircle, variant: "outline" },
  iot_device: { labelKey: "devices.iotFlag", icon: Shield, variant: "outline" },
  visitor_device: { labelKey: "devices.visitorFlag", icon: User, variant: "outline" },
  trusted_work_device: { labelKey: "devices.workFlag", icon: Briefcase, variant: "outline" },
};

export function DeviceCard({
  device,
  currentZone,
  onZoneChange,
  isDragging = false,
  onDragStart,
  onDragEnd,
  scenarioId,
  isFlagged = false,
  onFlagToggle,
}: DeviceCardProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const DeviceIcon = getDeviceIcon(device.type);
  const deviceLabel = useMemo(
    () => getDeviceDisplayLabel(device.id, device.label, scenarioId || null, t),
    [device.id, device.label, scenarioId, t]
  );
  const hasUnknownFlag = device.riskFlags.includes("unknown_device");

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", device.id);
    e.dataTransfer.effectAllowed = "move";
    onDragStart?.(e, device.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cardRef.current?.focus();
    }
  };

  const flagLabels = device.riskFlags.map((flag) => t(riskFlagConfig[flag].labelKey));
  const ariaLabel = [
    `${deviceLabel}, ${t(`devices.${device.type}`)}`,
    flagLabels.length > 0 ? t("devices.flagsList", { flags: flagLabels.join(", ") }) : "",
    isFlagged ? t("devices.flaggedForReview") : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listitem"
      aria-label={ariaLabel}
      data-testid={`card-device-${device.id}`}
      className={`
        device-card relative flex flex-wrap items-center gap-2 p-3 cursor-grab active:cursor-grabbing rounded-xl
        transition-all duration-200 ease-out
        hover-elevate active-elevate-2
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isFlagged ? "bg-[hsl(var(--accent)/0.18)] border-[hsl(var(--accent)/0.6)]" : ""}
      `}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-shrink-0 p-2 rounded-lg bg-muted/70 border border-border/60 cursor-help">
            <DeviceIcon className="h-5 w-5 text-foreground" aria-hidden="true" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[280px]">
          <p className="text-sm">{t(`tooltips.deviceTypes.${device.type}`)}</p>
        </TooltipContent>
      </Tooltip>

      <div className="flex-1 min-w-[100px]">
        <p
          className="text-sm font-medium leading-tight"
          data-testid={`text-device-label-${device.id}`}
        >
          {deviceLabel}
        </p>
        {device.ip && (
          <p
            className="text-xs font-mono text-muted-foreground hidden sm:block"
            data-testid={`text-device-ip-${device.id}`}
          >
            {device.ip}
          </p>
        )}
      </div>

      {device.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-end">
          {device.riskFlags.map((flag) => {
            const config = riskFlagConfig[flag];
            const FlagIcon = config.icon;
            const label = t(config.labelKey);
            return (
              <Tooltip key={flag}>
                <TooltipTrigger asChild>
                  <Badge
                    variant={config.variant}
                    className="text-xs px-1.5 py-0.5 gap-1 cursor-help"
                    data-testid={`badge-flag-${device.id}-${flag}`}
                  >
                    <FlagIcon className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">{label}</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[280px]">
                  <p className="text-sm">{t(`tooltips.riskFlags.${flag}`)}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      )}

      <div className="flex-shrink-0 flex items-center gap-2">
        <Select
          value={currentZone}
          onValueChange={(value) => onZoneChange(device.id, value as ZoneId)}
        >
          <SelectTrigger
            className="w-auto min-w-[88px] h-8 text-xs rounded-full"
            data-testid={`select-zone-${device.id}`}
            aria-label={t("devices.moveToZone", { device: deviceLabel })}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zones.map((zone) => (
              <SelectItem
                key={zone.id}
                value={zone.id}
                data-testid={`option-zone-${device.id}-${zone.id}`}
              >
                {t(zone.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasUnknownFlag && onFlagToggle && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={isFlagged ? "default" : "outline"}
                onClick={(e) => {
                  e.stopPropagation();
                  onFlagToggle(device.id);
                }}
                data-testid={`button-flag-${device.id}`}
                aria-label={isFlagged ? t("actions.unflagDevice") : t("actions.flagDevice")}
                className={
                  isFlagged
                    ? "bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.9)] text-white"
                    : ""
                }
              >
                <Flag className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[280px]">
              <p className="text-sm">
                {isFlagged ? t("tooltips.flagged") : t("tooltips.flagForInvestigation")}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </Card>
  );
}
