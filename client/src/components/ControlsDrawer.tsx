import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Wifi, Lock, Users, Shield, Key, RefreshCw, KeyRound } from "lucide-react";
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
  children: React.ReactNode;
}

function ControlItem({ icon: Icon, label, description, children }: ControlItemProps) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-shrink-0 p-2 rounded-md bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
      </div>
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
  return (
    <Card data-testid="controls-drawer">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Security Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <ControlItem
          icon={Wifi}
          label="Wi-Fi Security"
          description="Encryption standard for wireless traffic"
        >
          <Select
            value={controls.wifiSecurity}
            onValueChange={(value) => onControlChange("wifiSecurity", value as Controls["wifiSecurity"])}
          >
            <SelectTrigger 
              className="w-[100px] h-8 text-xs"
              data-testid="select-wifi-security"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="WPA2">WPA2</SelectItem>
              <SelectItem value="WPA3">WPA3</SelectItem>
            </SelectContent>
          </Select>
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Lock}
          label="Strong Wi-Fi Password"
          description="Complex password for network access"
        >
          <Switch
            checked={controls.strongWifiPassword}
            onCheckedChange={(checked) => onControlChange("strongWifiPassword", checked)}
            data-testid="switch-strong-password"
            aria-label="Toggle strong Wi-Fi password"
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Users}
          label="Guest Network"
          description={guestNetworkAvailable ? "Separate network for visitors" : "Enable in scenario settings"}
        >
          <Switch
            checked={controls.guestNetworkEnabled}
            onCheckedChange={(checked) => onControlChange("guestNetworkEnabled", checked)}
            disabled={!guestNetworkAvailable}
            data-testid="switch-guest-network"
            aria-label="Toggle guest network"
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Shield}
          label="IoT Network"
          description={iotNetworkAvailable ? "Isolated network for smart devices" : "Enable in scenario settings"}
        >
          <Switch
            checked={controls.iotNetworkEnabled}
            onCheckedChange={(checked) => onControlChange("iotNetworkEnabled", checked)}
            disabled={!iotNetworkAvailable}
            data-testid="switch-iot-network"
            aria-label="Toggle IoT network"
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={Key}
          label="MFA on Accounts"
          description="Multi-factor auth for device accounts"
        >
          <Switch
            checked={controls.mfaEnabled}
            onCheckedChange={(checked) => onControlChange("mfaEnabled", checked)}
            data-testid="switch-mfa"
            aria-label="Toggle MFA"
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={RefreshCw}
          label="Auto Updates"
          description="Keep device firmware current"
        >
          <Switch
            checked={controls.autoUpdatesEnabled}
            onCheckedChange={(checked) => onControlChange("autoUpdatesEnabled", checked)}
            data-testid="switch-auto-updates"
            aria-label="Toggle auto updates"
          />
        </ControlItem>

        <Separator />

        <ControlItem
          icon={KeyRound}
          label="Default Passwords Changed"
          description="Replace factory default credentials"
        >
          <Switch
            checked={controls.defaultPasswordsAddressed}
            onCheckedChange={(checked) => onControlChange("defaultPasswordsAddressed", checked)}
            data-testid="switch-default-passwords"
            aria-label="Toggle default passwords addressed"
          />
        </ControlItem>
      </CardContent>
    </Card>
  );
}
