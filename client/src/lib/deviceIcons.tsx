import {
  Laptop,
  Smartphone,
  Tablet,
  Tv,
  Speaker,
  Thermometer,
  Camera,
  Printer,
  Router,
  Cpu,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import type { DeviceType } from "@shared/schema";

export const deviceIconMap: Record<DeviceType, LucideIcon> = {
  router: Router,
  laptop: Laptop,
  phone: Smartphone,
  tablet: Tablet,
  tv: Tv,
  speaker: Speaker,
  thermostat: Thermometer,
  camera: Camera,
  printer: Printer,
  iot: Cpu,
  unknown: HelpCircle,
};

export function getDeviceIcon(type: DeviceType): LucideIcon {
  return deviceIconMap[type] || HelpCircle;
}
