import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Shield, User, Briefcase, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Device, ZoneId, RiskFlag } from "@shared/schema";
import { getDeviceIcon } from "@/lib/deviceIcons";
import { zones } from "@/lib/zones";
import { getDeviceDisplayLabel } from "@/lib/i18n";

interface DeviceListViewProps {
  devices: Device[];
  deviceZones: Record<string, ZoneId>;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
  scenarioId?: string;
  flaggedDevices?: Set<string>;
  onFlagToggle?: (deviceId: string) => void;
}

const riskFlagKeys: Record<
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

export function DeviceListView({
  devices,
  deviceZones,
  onZoneChange,
  scenarioId,
  flaggedDevices = new Set(),
  onFlagToggle,
}: DeviceListViewProps) {
  const { t } = useTranslation();

  const deviceLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const device of devices) {
      labels[device.id] = getDeviceDisplayLabel(device.id, device.label, scenarioId || null, t);
    }
    return labels;
  }, [devices, scenarioId, t]);

  const getLabel = (device: Device): string => deviceLabels[device.id] || device.label;

  const devicesByZone = zones.map((zone) => ({
    zone,
    label: t(zone.labelKey),
    description: t(zone.descriptionKey),
    devices: devices.filter((d) => deviceZones[d.id] === zone.id),
  }));

  return (
    <div
      className="space-y-4"
      role="region"
      aria-label={t("devices.listViewLabel")}
      data-testid="device-list-view"
    >
      <p className="sr-only">{t("devices.listViewHint")}</p>

      {devicesByZone.map(({ zone, label, description, devices: zoneDevices }) => (
        <Card key={zone.id} data-testid={`list-zone-${zone.id}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${zone.bgClass}`}
                aria-hidden="true"
              />
              {label}
              <Badge variant="outline" className="ml-auto">
                {t("devices.count", { count: zoneDevices.length })}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent>
            {zoneDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">{t("devices.noDevices")}</p>
            ) : (
              <ul
                className="divide-y divide-border"
                role="list"
                aria-label={t("devices.in", { zone: label })}
              >
                {zoneDevices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  return (
                    <li
                      key={device.id}
                      className={`py-3 first:pt-0 last:pb-0 ${flaggedDevices.has(device.id) ? "bg-amber-100/50 dark:bg-amber-900/20 -mx-4 px-4 rounded-md" : ""}`}
                      data-testid={`list-device-${device.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex-shrink-0 p-2 rounded-md bg-muted cursor-help">
                              <DeviceIcon className="h-5 w-5 text-foreground" aria-hidden="true" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[280px]">
                            <p className="text-sm">{t(`tooltips.deviceTypes.${device.type}`)}</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{getLabel(device)}</p>
                          <p className="text-xs text-muted-foreground">
                            {t(`devices.${device.type}`, {
                              defaultValue:
                                device.type.charAt(0).toUpperCase() + device.type.slice(1),
                            })}
                            {device.ip && ` - ${device.ip}`}
                          </p>
                          {device.riskFlags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {device.riskFlags.map((flag) => {
                                const config = riskFlagKeys[flag];
                                const FlagIcon = config.icon;
                                return (
                                  <Tooltip key={flag}>
                                    <TooltipTrigger asChild>
                                      <span className="inline-flex">
                                        <Badge
                                          variant={config.variant}
                                          className="text-xs px-1.5 py-0 gap-1 cursor-help"
                                        >
                                          <FlagIcon className="h-3 w-3" aria-hidden="true" />
                                          <span className="sr-only">{t(config.labelKey)}</span>
                                        </Badge>
                                      </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[280px]">
                                      <p className="text-sm">{t(`tooltips.riskFlags.${flag}`)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                          <label className="sr-only" htmlFor={`zone-select-${device.id}`}>
                            {t("devices.moveToZone", { device: getLabel(device) })}
                          </label>
                          <Select
                            value={deviceZones[device.id]}
                            onValueChange={(value) => onZoneChange(device.id, value as ZoneId)}
                          >
                            <SelectTrigger
                              id={`zone-select-${device.id}`}
                              className="w-[130px] text-xs"
                              data-testid={`list-select-zone-${device.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {zones.map((z) => (
                                <SelectItem key={z.id} value={z.id}>
                                  {t(z.labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {device.riskFlags.includes("unknown_device") && onFlagToggle && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant={flaggedDevices.has(device.id) ? "default" : "outline"}
                                  onClick={() => onFlagToggle(device.id)}
                                  data-testid={`list-button-flag-${device.id}`}
                                  aria-label={
                                    flaggedDevices.has(device.id)
                                      ? t("actions.unflagDevice")
                                      : t("actions.flagDevice")
                                  }
                                  className={
                                    flaggedDevices.has(device.id)
                                      ? "bg-amber-500 hover:bg-amber-600 text-white"
                                      : ""
                                  }
                                >
                                  <Flag className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-[280px]">
                                <p className="text-sm">
                                  {flaggedDevices.has(device.id)
                                    ? t("tooltips.flagged")
                                    : t("tooltips.flagForInvestigation")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
