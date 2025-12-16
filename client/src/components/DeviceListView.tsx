import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, User, Briefcase } from "lucide-react";
import type { Device, ZoneId, RiskFlag } from "@shared/schema";
import { getDeviceIcon } from "@/lib/deviceIcons";
import { zones } from "@/lib/zones";

interface DeviceListViewProps {
  devices: Device[];
  deviceZones: Record<string, ZoneId>;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
}

const riskFlagKeys: Record<RiskFlag, { labelKey: string; icon: typeof AlertTriangle; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  unknown_device: { labelKey: "devices.unknownFlag", icon: AlertTriangle, variant: "destructive" },
  iot_device: { labelKey: "devices.iotFlag", icon: Shield, variant: "secondary" },
  visitor_device: { labelKey: "devices.visitorFlag", icon: User, variant: "outline" },
  trusted_work_device: { labelKey: "devices.workFlag", icon: Briefcase, variant: "default" }
};

export function DeviceListView({ devices, deviceZones, onZoneChange }: DeviceListViewProps) {
  const { t } = useTranslation();
  
  const devicesByZone = zones.map(zone => ({
    zone,
    label: t(zone.labelKey),
    description: t(zone.descriptionKey),
    devices: devices.filter(d => deviceZones[d.id] === zone.id)
  }));

  return (
    <div 
      className="space-y-4" 
      role="region" 
      aria-label={t('devices.listViewLabel')}
      data-testid="device-list-view"
    >
      <p className="sr-only">
        {t('devices.listViewHint')}
      </p>
      
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
                {t('devices.count', { count: zoneDevices.length })}
              </Badge>
            </CardTitle>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardHeader>
          <CardContent>
            {zoneDevices.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-2">
                {t('devices.noDevices')}
              </p>
            ) : (
              <ul className="divide-y divide-border" role="list" aria-label={`${t('devices.in')} ${label}`}>
                {zoneDevices.map((device) => {
                  const DeviceIcon = getDeviceIcon(device.type);
                  return (
                    <li 
                      key={device.id}
                      className="py-3 first:pt-0 last:pb-0"
                      data-testid={`list-device-${device.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-2 rounded-md bg-muted" aria-hidden="true">
                          <DeviceIcon className="h-5 w-5 text-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{device.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.type.charAt(0).toUpperCase() + device.type.slice(1)}
                            {device.ip && ` - ${device.ip}`}
                          </p>
                          {device.riskFlags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {device.riskFlags.map((flag) => {
                                const config = riskFlagKeys[flag];
                                const FlagIcon = config.icon;
                                return (
                                  <Badge
                                    key={flag}
                                    variant={config.variant}
                                    className="text-xs px-1.5 py-0 gap-1"
                                  >
                                    <FlagIcon className="h-3 w-3" aria-hidden="true" />
                                    {t(config.labelKey)}
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <label className="sr-only" htmlFor={`zone-select-${device.id}`}>
                            {t('devices.moveToZone', { device: device.label })}
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
                                <SelectItem
                                  key={z.id}
                                  value={z.id}
                                >
                                  {t(z.labelKey)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
