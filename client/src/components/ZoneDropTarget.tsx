import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device, ZoneId } from "@shared/schema";
import type { ZoneConfig } from "@/lib/zones";
import { DeviceCard } from "./DeviceCard";
import { Network, Shield, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ZoneDropTargetProps {
  zone: ZoneConfig;
  devices: Device[];
  deviceZones: Record<string, ZoneId>;
  onDeviceDrop: (deviceId: string, zoneId: ZoneId) => void;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
  scenarioId?: string;
  compact?: boolean;
  flaggedDevices?: Set<string>;
  onFlagToggle?: (deviceId: string) => void;
}

const zoneIcons: Record<ZoneId, typeof Network> = {
  main: Network,
  guest: Users,
  iot: Shield
};

export function ZoneDropTarget({
  zone,
  devices,
  deviceZones,
  onDeviceDrop,
  onZoneChange,
  scenarioId,
  compact = false,
  flaggedDevices = new Set(),
  onFlagToggle
}: ZoneDropTargetProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);

  const devicesInZone = devices.filter(d => deviceZones[d.id] === zone.id);
  const ZoneIcon = zoneIcons[zone.id];
  const label = t(zone.labelKey);
  const description = t(zone.descriptionKey);
  
  const isEmpty = devicesInZone.length === 0;
  const isCompactDisplay = compact && isEmpty;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!isDragOver) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const deviceId = e.dataTransfer.getData("text/plain");
    if (deviceId) {
      onDeviceDrop(deviceId, zone.id);
    }
  };

  const handleDragStart = (_e: React.DragEvent, deviceId: string) => {
    setDraggingDeviceId(deviceId);
  };

  const handleDragEnd = () => {
    setDraggingDeviceId(null);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      role="region"
      aria-label={t('zones.zoneWithDevices', { zone: label, count: devicesInZone.length })}
      data-testid={`zone-${zone.id}`}
      className={`
        relative flex flex-col rounded-lg border-2 border-dashed
        transition-all duration-300 ease-out
        ${isCompactDisplay ? "min-h-[80px]" : isEmpty ? "min-h-[120px]" : "min-h-0"}
        ${isDragOver 
          ? `${zone.borderClass} ${zone.bgClass} border-solid min-h-[120px]` 
          : "border-border bg-card/30"
        }
      `}
    >
      <div className={`
        flex items-center gap-2 px-4 py-3 border-b
        ${isDragOver ? "border-transparent" : "border-border"}
      `}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-help">
              <ZoneIcon className={`h-5 w-5 ${zone.colorClass}`} aria-hidden="true" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[280px]">
            <p className="text-sm">{t(`tooltips.zones.${zone.id}`)}</p>
          </TooltipContent>
        </Tooltip>
        <div className="flex-1">
          <h3 className={`text-sm font-semibold ${zone.colorClass}`}>
            {label}
          </h3>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {devicesInZone.length}
        </span>
      </div>

      <div
        className={`flex-1 overflow-auto ${isCompactDisplay ? "p-2" : "p-3"}`}
        role="list"
        aria-label={t('devices.in', { zone: label })}
      >
        {devicesInZone.length === 0 ? (
          <div className={`flex items-center justify-center h-full text-center ${isCompactDisplay ? "min-h-[32px] gap-2" : "flex-col min-h-[72px]"}`}>
            {!isCompactDisplay && (
              <div className={`p-2 rounded-full ${zone.bgClass} mb-1`}>
                <ZoneIcon className={`h-5 w-5 ${zone.colorClass} opacity-60`} aria-hidden="true" />
              </div>
            )}
            <p className={`text-muted-foreground ${isCompactDisplay ? "text-xs" : "text-sm"}`}>
              {t('zones.dropHere')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {devicesInZone.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                currentZone={zone.id}
                onZoneChange={onZoneChange}
                isDragging={draggingDeviceId === device.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                scenarioId={scenarioId}
                isFlagged={flaggedDevices.has(device.id)}
                onFlagToggle={onFlagToggle}
              />
            ))}
          </div>
        )}
      </div>

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg">
          <div className={`px-4 py-2 rounded-full ${zone.bgClass} ${zone.colorClass} font-medium text-sm`}>
            {t('zones.dropToMove')}
          </div>
        </div>
      )}
    </div>
  );
}
