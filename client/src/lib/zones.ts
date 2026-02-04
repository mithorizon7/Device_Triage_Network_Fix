import type { ZoneId } from "@shared/schema";

export interface ZoneConfig {
  id: ZoneId;
  labelKey: string;
  descriptionKey: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

export const zones: ZoneConfig[] = [
  {
    id: "main",
    labelKey: "zones.main",
    descriptionKey: "zones.mainDescription",
    colorClass: "text-[hsl(var(--zone-main))]",
    borderClass: "border-[hsl(var(--zone-main)/0.7)]",
    bgClass: "bg-[hsl(var(--zone-main)/0.12)]",
  },
  {
    id: "guest",
    labelKey: "zones.guest",
    descriptionKey: "zones.guestDescription",
    colorClass: "text-[hsl(var(--zone-guest))]",
    borderClass: "border-[hsl(var(--zone-guest)/0.7)]",
    bgClass: "bg-[hsl(var(--zone-guest)/0.12)]",
  },
  {
    id: "iot",
    labelKey: "zones.iot",
    descriptionKey: "zones.iotDescription",
    colorClass: "text-[hsl(var(--zone-iot))]",
    borderClass: "border-[hsl(var(--zone-iot)/0.7)]",
    bgClass: "bg-[hsl(var(--zone-iot)/0.12)]",
  },
];

export function getZoneConfig(zoneId: ZoneId): ZoneConfig {
  return zones.find((z) => z.id === zoneId) || zones[0];
}
