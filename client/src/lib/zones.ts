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
    colorClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20"
  },
  {
    id: "guest",
    labelKey: "zones.guest",
    descriptionKey: "zones.guestDescription",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20"
  },
  {
    id: "iot",
    labelKey: "zones.iot",
    descriptionKey: "zones.iotDescription",
    colorClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-500",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20"
  },
  {
    id: "investigate",
    labelKey: "zones.investigate",
    descriptionKey: "zones.investigateDescription",
    colorClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20"
  }
];

export function getZoneConfig(zoneId: ZoneId): ZoneConfig {
  return zones.find(z => z.id === zoneId) || zones[0];
}
