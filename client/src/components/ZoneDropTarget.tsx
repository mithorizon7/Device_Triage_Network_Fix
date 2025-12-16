import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Device, ZoneId } from "@shared/schema";
import type { ZoneConfig } from "@/lib/zones";
import { DeviceCard } from "./DeviceCard";
import { Network, Shield, Users, Search } from "lucide-react";

interface ZoneDropTargetProps {
  zone: ZoneConfig;
  devices: Device[];
  deviceZones: Record<string, ZoneId>;
  onDeviceDrop: (deviceId: string, zoneId: ZoneId) => void;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
}

const zoneIcons: Record<ZoneId, typeof Network> = {
  main: Network,
  guest: Users,
  iot: Shield,
  investigate: Search
};

export function ZoneDropTarget({
  zone,
  devices,
  deviceZones,
  onDeviceDrop,
  onZoneChange
}: ZoneDropTargetProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingDeviceId, setDraggingDeviceId] = useState<string | null>(null);

  const devicesInZone = devices.filter(d => deviceZones[d.id] === zone.id);
  const ZoneIcon = zoneIcons[zone.id];
  const label = t(zone.labelKey);
  const description = t(zone.descriptionKey);

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
      aria-label={`${label} zone with ${devicesInZone.length} devices`}
      data-testid={`zone-${zone.id}`}
      className={`
        relative flex flex-col min-h-[200px] rounded-lg border-2 border-dashed
        transition-all duration-200 ease-out
        ${isDragOver 
          ? `${zone.borderClass} ${zone.bgClass} border-solid` 
          : "border-border bg-card/30"
        }
      `}
    >
      <div className={`
        flex items-center gap-2 px-4 py-3 border-b
        ${isDragOver ? "border-transparent" : "border-border"}
      `}>
        <ZoneIcon className={`h-5 w-5 ${zone.colorClass}`} aria-hidden="true" />
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
        className="flex-1 p-3 overflow-auto"
        role="list"
        aria-label={`Devices in ${label}`}
      >
        {devicesInZone.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[120px] text-center">
            <div className={`p-3 rounded-full ${zone.bgClass} mb-2`}>
              <ZoneIcon className={`h-6 w-6 ${zone.colorClass} opacity-60`} aria-hidden="true" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('zones.dropHere', { defaultValue: 'Drop devices here' })}
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
              />
            ))}
          </div>
        )}
      </div>

      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-lg">
          <div className={`px-4 py-2 rounded-full ${zone.bgClass} ${zone.colorClass} font-medium text-sm`}>
            {t('zones.dropToMove', { defaultValue: 'Drop to move here' })}
          </div>
        </div>
      )}
    </div>
  );
}
