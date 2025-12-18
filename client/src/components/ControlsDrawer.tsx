import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Wifi, Lock, Users, Shield, Key, RefreshCw, KeyRound, Info } from "lucide-react";
import type { Controls } from "@shared/schema";

interface ControlsDrawerProps {
  controls: Controls;
  onControlChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void;
  guestNetworkAvailable: boolean;
  iotNetworkAvailable: boolean;
}

interface ControlItemProps {
  icon: typeof Wifi;
  label: string;
  description: string;
  tooltip: string;
  children: React.ReactNode;
}

function ControlItem({ icon: Icon, label, description, tooltip, children }: ControlItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex-shrink-0 p-2 rounded-md bg-muted cursor-help">
            <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-[280px]">
          <p className="text-sm">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );
}

export function ControlsDrawer({
  controls,
  onControlChange,
  guestNetworkAvailable,
  iotNetworkAvailable
}: ControlsDrawerProps) {
  const { t } = useTranslation();

  return (
    <Card data-testid="controls-drawer">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          {t('controls.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <ControlItem
          icon={Wifi}
          label={t('controls.wifiSecurity')}
          description={t('controls.wifiSecurityDesc')}
          tooltip={t('tooltips.controls.wifiSecurity')}
        >
          <div className="flex items-center gap-1">
            <Select
              value={controls.wifiSecurity}
              onValueChange={(value) => onControlChange("wifiSecurity", value as Controls["wifiSecurity"])}
            >
              <SelectTrigger 
                className="w-[100px] text-xs"
                data-testid="select-wifi-security"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="OPEN">{t('controls.wifiSecurityOpen')}</SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[280px]">
                    <p className="text-sm">{t('tooltips.wifiSecurity.open')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="WPA2">{t('controls.wifiSecurityWPA2')}</SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[280px]">
                    <p className="text-sm">{t('tooltips.wifiSecurity.wpa2')}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SelectItem value="WPA3">{t('controls.wifiSecurityWPA3')}</SelectItem>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[280px]">
                    <p className="text-sm">{t('tooltips.wifiSecurity.wpa3')}</p>
                  </TooltipContent>
                </Tooltip>
              </SelectContent>
            </Select>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[280px]">
                <p className="text-sm font-medium mb-1">{t('controls.wifiSecurityOpen')}</p>
                <p className="text-xs text-muted-foreground mb-2">{t('tooltips.wifiSecurity.open')}</p>
                <p className="text-sm font-medium mb-1">{t('controls.wifiSecurityWPA2')}</p>
                <p className="text-xs text-muted-foreground mb-2">{t('tooltips.wifiSecurity.wpa2')}</p>
                <p className="text-sm font-medium mb-1">{t('controls.wifiSecurityWPA3')}</p>
                <p className="text-xs text-muted-foreground">{t('tooltips.wifiSecurity.wpa3')}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Lock}
          label={t('controls.strongWifiPassword')}
          description={t('controls.strongWifiPasswordDesc')}
          tooltip={t('tooltips.controls.strongWifiPassword')}
        >
          <Switch
            checked={controls.strongWifiPassword}
            onCheckedChange={(checked) => onControlChange("strongWifiPassword", checked)}
            data-testid="switch-strongWifiPassword"
            aria-label={t('controls.strongWifiPassword')}
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Users}
          label={t('controls.guestNetworkEnabled')}
          description={guestNetworkAvailable 
            ? t('controls.guestNetworkDesc')
            : t('controls.enableInSettings')
          }
          tooltip={t('tooltips.controls.guestNetworkEnabled')}
        >
          <Switch
            checked={controls.guestNetworkEnabled}
            onCheckedChange={(checked) => onControlChange("guestNetworkEnabled", checked)}
            disabled={!guestNetworkAvailable}
            data-testid="switch-guestNetworkEnabled"
            aria-label={t('controls.guestNetworkEnabled')}
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Shield}
          label={t('controls.iotNetworkEnabled')}
          description={iotNetworkAvailable 
            ? t('controls.iotNetworkDesc')
            : t('controls.enableInSettings')
          }
          tooltip={t('tooltips.controls.iotNetworkEnabled')}
        >
          <Switch
            checked={controls.iotNetworkEnabled}
            onCheckedChange={(checked) => onControlChange("iotNetworkEnabled", checked)}
            disabled={!iotNetworkAvailable}
            data-testid="switch-iotNetworkEnabled"
            aria-label={t('controls.iotNetworkEnabled')}
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Key}
          label={t('controls.mfaEnabled')}
          description={t('controls.mfaDesc')}
          tooltip={t('tooltips.controls.mfaEnabled')}
        >
          <Switch
            checked={controls.mfaEnabled}
            onCheckedChange={(checked) => onControlChange("mfaEnabled", checked)}
            data-testid="switch-mfaEnabled"
            aria-label={t('controls.mfaEnabled')}
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={RefreshCw}
          label={t('controls.autoUpdatesEnabled')}
          description={t('controls.autoUpdatesDesc')}
          tooltip={t('tooltips.controls.autoUpdatesEnabled')}
        >
          <Switch
            checked={controls.autoUpdatesEnabled}
            onCheckedChange={(checked) => onControlChange("autoUpdatesEnabled", checked)}
            data-testid="switch-autoUpdatesEnabled"
            aria-label={t('controls.autoUpdatesEnabled')}
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={KeyRound}
          label={t('controls.defaultPasswordsAddressed')}
          description={t('controls.defaultPasswordsDesc')}
          tooltip={t('tooltips.controls.defaultPasswordsAddressed')}
        >
          <Switch
            checked={controls.defaultPasswordsAddressed}
            onCheckedChange={(checked) => onControlChange("defaultPasswordsAddressed", checked)}
            data-testid="switch-defaultPasswordsAddressed"
            aria-label={t('controls.defaultPasswordsAddressed')}
          />
        </ControlItem>
      </CardContent>
    </Card>
  );
}
