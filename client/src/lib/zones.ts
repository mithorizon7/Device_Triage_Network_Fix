import type { ZoneId } from "@shared/schema";

export interface ZoneConfig {
  id: ZoneId;
  label: string;
  description: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
}

export const zones: ZoneConfig[] = [
  {
    id: "main",
    label: "Main Network",
    description: "Trusted personal devices with full access",
    colorClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20"
  },
  {
    id: "guest",
    label: "Guest Network",
    description: "Visitor devices with internet-only access",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20"
  },
  {
    id: "iot",
    label: "IoT Network",
    description: "Smart devices isolated from main network",
    colorClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-purple-500",
    bgClass: "bg-purple-500/10 dark:bg-purple-500/20"
  },
  {
    id: "investigate",
    label: "Investigate",
    description: "Unknown or suspicious devices for review",
    colorClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20"
  }
];

export function getZoneConfig(zoneId: ZoneId): ZoneConfig {
  return zones.find(z => z.id === zoneId) || zones[0];
}
