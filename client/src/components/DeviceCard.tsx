import { useRef } from "react";
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
import { GripVertical, AlertTriangle, Shield, User, Briefcase } from "lucide-react";
import type { Device, ZoneId, RiskFlag } from "@shared/schema";
import { getDeviceIcon } from "@/lib/deviceIcons";
import { zones } from "@/lib/zones";

interface DeviceCardProps {
  device: Device;
  currentZone: ZoneId;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, deviceId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const riskFlagConfig: Record<RiskFlag, { label: string; icon: typeof AlertTriangle; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unknown_device: { label: "Unknown", icon: AlertTriangle, variant: "destructive" },
  iot_device: { label: "IoT", icon: Shield, variant: "secondary" },
  visitor_device: { label: "Visitor", icon: User, variant: "outline" },
  trusted_work_device: { label: "Work", icon: Briefcase, variant: "default" }
};

export function DeviceCard({
  device,
  currentZone,
  onZoneChange,
  isDragging = false,
  onDragStart,
  onDragEnd
}: DeviceCardProps) {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const DeviceIcon = getDeviceIcon(device.type);

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

  return (
    <Card
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listitem"
      aria-label={`${device.label}, ${device.type} device${device.riskFlags.length > 0 ? `, flags: ${device.riskFlags.join(", ")}` : ""}`}
      data-testid={`card-device-${device.id}`}
      className={`
        relative flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing
        transition-all duration-200 ease-out
        hover-elevate active-elevate-2
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${isDragging ? "opacity-50 scale-95" : ""}
      `}
    >
      <div className="flex-shrink-0 text-muted-foreground">
        <GripVertical className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="flex-shrink-0 p-2 rounded-md bg-muted">
        <DeviceIcon className="h-6 w-6 text-foreground" aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" data-testid={`text-device-label-${device.id}`}>
          {device.label}
        </p>
        {device.ip && (
          <p className="text-xs font-mono text-muted-foreground truncate" data-testid={`text-device-ip-${device.id}`}>
            {device.ip}
          </p>
        )}
      </div>

      {device.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
          {device.riskFlags.map((flag) => {
            const config = riskFlagConfig[flag];
            const FlagIcon = config.icon;
            return (
              <Badge
                key={flag}
                variant={config.variant}
                className="text-xs px-1.5 py-0.5 gap-1"
                data-testid={`badge-flag-${device.id}-${flag}`}
              >
                <FlagIcon className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">{config.label}</span>
              </Badge>
            );
          })}
        </div>
      )}

      <div className="flex-shrink-0">
        <Select
          value={currentZone}
          onValueChange={(value) => onZoneChange(device.id, value as ZoneId)}
        >
          <SelectTrigger
            className="w-[110px] h-8 text-xs"
            data-testid={`select-zone-${device.id}`}
            aria-label={`Move ${device.label} to zone`}
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
      </div>
    </Card>
  );
}
