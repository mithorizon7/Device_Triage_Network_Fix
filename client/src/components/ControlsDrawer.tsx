import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
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
import { 
  Wifi, Lock, Users, Shield, Key, RefreshCw, KeyRound, Info, HelpCircle,
  Smartphone, ShieldCheck, FolderX, BluetoothOff, Search
} from "lucide-react";
import type { Controls } from "@shared/schema";
import { useControlEducation } from "@/hooks/useControlEducation";
import { ControlEducationDialog } from "./ControlEducationDialog";
import { PasswordTrainingDialog } from "./PasswordTrainingDialog";

type EducatableControlKey = 
  | "strongWifiPassword"
  | "guestNetworkEnabled"
  | "iotNetworkEnabled"
  | "mfaEnabled"
  | "autoUpdatesEnabled"
  | "defaultPasswordsAddressed"
  | "wifiSecurity"
  | "vpnEnabled"
  | "personalHotspot"
  | "firewallEnabled"
  | "fileSharingDisabled"
  | "bluetoothDisabled"
  | "httpsOnly"
  | "verifyNetworkAuthenticity";

interface ControlsDrawerProps {
  controls: Controls;
  onControlChange: <K extends keyof Controls>(key: K, value: Controls[K]) => void;
  guestNetworkAvailable: boolean;
  iotNetworkAvailable: boolean;
  scenarioType: string;
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
  iotNetworkAvailable,
  scenarioType
}: ControlsDrawerProps) {
  const { t } = useTranslation();
  const [passwordTrainingOpen, setPasswordTrainingOpen] = useState(false);
  
  const {
    activeControl,
    dontShowAgain,
    setDontShowAgain,
    showEducation,
    closeEducation,
    shouldShowEducation,
  } = useControlEducation();

  const isHotelScenario = scenarioType === 'hotel';

  const handleBooleanControlChange = (controlKey: EducatableControlKey, checked: boolean) => {
    if (controlKey === 'strongWifiPassword' && checked) {
      onControlChange('strongWifiPassword', true);
      setPasswordTrainingOpen(true);
      return;
    }
    
    onControlChange(controlKey as keyof Controls, checked as Controls[keyof Controls]);
    const educatableKeys = ['strongWifiPassword', 'guestNetworkEnabled', 'iotNetworkEnabled', 'mfaEnabled', 'autoUpdatesEnabled', 'defaultPasswordsAddressed', 'wifiSecurity'] as const;
    type EducatableKey = typeof educatableKeys[number];
    if (checked && educatableKeys.includes(controlKey as EducatableKey)) {
      if (shouldShowEducation(controlKey as EducatableKey)) {
        showEducation(controlKey as EducatableKey);
      }
    }
  };

  const handlePasswordTrainingComplete = (accepted: boolean) => {
    if (!accepted) {
      onControlChange('strongWifiPassword', false);
    }
    setPasswordTrainingOpen(false);
  };

  const handlePasswordTrainingClose = () => {
    setPasswordTrainingOpen(false);
  };

  const openPasswordTraining = () => {
    setPasswordTrainingOpen(true);
  };

  const handleWifiSecurityChange = (value: string) => {
    const previousValue = controls.wifiSecurity;
    const typedValue = value as Controls["wifiSecurity"];
    onControlChange("wifiSecurity", typedValue);
    if ((previousValue === "OPEN" && value !== "OPEN") && shouldShowEducation("wifiSecurity")) {
      showEducation("wifiSecurity");
    }
  };

  const handleKeepEnabled = () => {
    closeEducation();
  };

  const handleTurnOff = () => {
    if (activeControl && activeControl !== "wifiSecurity") {
      onControlChange(activeControl as keyof Controls, false as Controls[keyof Controls]);
    } else if (activeControl === "wifiSecurity") {
      onControlChange("wifiSecurity", "OPEN");
    }
    closeEducation();
  };

  const renderHomeOfficeControls = () => (
    <>
      <ControlItem
        icon={Wifi}
        label={t('controls.wifiSecurity')}
        description={t('controls.wifiSecurityDesc')}
        tooltip={t('tooltips.controls.wifiSecurity')}
      >
        <div className="flex items-center gap-1">
          <Select
            value={controls.wifiSecurity || "WPA2"}
            onValueChange={handleWifiSecurityChange}
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
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={openPasswordTraining}
                data-testid="button-password-training"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-sm">{t('passwordTraining.title')}</p>
            </TooltipContent>
          </Tooltip>
          <Switch
            checked={controls.strongWifiPassword || false}
            onCheckedChange={(checked) => handleBooleanControlChange("strongWifiPassword", checked)}
            data-testid="switch-strongWifiPassword"
            aria-label={t('controls.strongWifiPassword')}
          />
        </div>
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
          checked={controls.guestNetworkEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("guestNetworkEnabled", checked)}
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
          checked={controls.iotNetworkEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("iotNetworkEnabled", checked)}
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
          checked={controls.mfaEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("mfaEnabled", checked)}
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
          checked={controls.autoUpdatesEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("autoUpdatesEnabled", checked)}
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
          checked={controls.defaultPasswordsAddressed || false}
          onCheckedChange={(checked) => handleBooleanControlChange("defaultPasswordsAddressed", checked)}
          data-testid="switch-defaultPasswordsAddressed"
          aria-label={t('controls.defaultPasswordsAddressed')}
        />
      </ControlItem>
    </>
  );

  const renderHotelControls = () => (
    <>
      <ControlItem
        icon={Shield}
        label={t('controls.vpnEnabled')}
        description={t('controls.vpnEnabledDesc')}
        tooltip={t('tooltips.controls.vpnEnabled')}
      >
        <Switch
          checked={controls.vpnEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("vpnEnabled", checked)}
          data-testid="switch-vpnEnabled"
          aria-label={t('controls.vpnEnabled')}
        />
      </ControlItem>

      <Separator />

      <ControlItem
        icon={Smartphone}
        label={t('controls.personalHotspot')}
        description={t('controls.personalHotspotDesc')}
        tooltip={t('tooltips.controls.personalHotspot')}
      >
        <Switch
          checked={controls.personalHotspot || false}
          onCheckedChange={(checked) => handleBooleanControlChange("personalHotspot", checked)}
          data-testid="switch-personalHotspot"
          aria-label={t('controls.personalHotspot')}
        />
      </ControlItem>

      <Separator />

      <ControlItem
        icon={Search}
        label={t('controls.verifyNetwork')}
        description={t('controls.verifyNetworkDesc')}
        tooltip={t('tooltips.controls.verifyNetwork')}
      >
        <Switch
          checked={controls.verifyNetworkAuthenticity || false}
          onCheckedChange={(checked) => handleBooleanControlChange("verifyNetworkAuthenticity", checked)}
          data-testid="switch-verifyNetworkAuthenticity"
          aria-label={t('controls.verifyNetwork')}
        />
      </ControlItem>

      <Separator />

      <ControlItem
        icon={ShieldCheck}
        label={t('controls.firewallEnabled')}
        description={t('controls.firewallEnabledDesc')}
        tooltip={t('tooltips.controls.firewallEnabled')}
      >
        <Switch
          checked={controls.firewallEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("firewallEnabled", checked)}
          data-testid="switch-firewallEnabled"
          aria-label={t('controls.firewallEnabled')}
        />
      </ControlItem>

      <Separator />

      <ControlItem
        icon={FolderX}
        label={t('controls.fileSharingDisabled')}
        description={t('controls.fileSharingDisabledDesc')}
        tooltip={t('tooltips.controls.fileSharingDisabled')}
      >
        <Switch
          checked={controls.fileSharingDisabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("fileSharingDisabled", checked)}
          data-testid="switch-fileSharingDisabled"
          aria-label={t('controls.fileSharingDisabled')}
        />
      </ControlItem>

      <Separator />

      <ControlItem
        icon={BluetoothOff}
        label={t('controls.bluetoothDisabled')}
        description={t('controls.bluetoothDisabledDesc')}
        tooltip={t('tooltips.controls.bluetoothDisabled')}
      >
        <Switch
          checked={controls.bluetoothDisabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("bluetoothDisabled", checked)}
          data-testid="switch-bluetoothDisabled"
          aria-label={t('controls.bluetoothDisabled')}
        />
      </ControlItem>

      <Separator />

      <ControlItem
        icon={Lock}
        label={t('controls.httpsOnly')}
        description={t('controls.httpsOnlyDesc')}
        tooltip={t('tooltips.controls.httpsOnly')}
      >
        <Switch
          checked={controls.httpsOnly || false}
          onCheckedChange={(checked) => handleBooleanControlChange("httpsOnly", checked)}
          data-testid="switch-httpsOnly"
          aria-label={t('controls.httpsOnly')}
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
          checked={controls.mfaEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("mfaEnabled", checked)}
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
          checked={controls.autoUpdatesEnabled || false}
          onCheckedChange={(checked) => handleBooleanControlChange("autoUpdatesEnabled", checked)}
          data-testid="switch-autoUpdatesEnabled"
          aria-label={t('controls.autoUpdatesEnabled')}
        />
      </ControlItem>
    </>
  );

  return (
    <>
    <PasswordTrainingDialog
      isOpen={passwordTrainingOpen}
      onComplete={handlePasswordTrainingComplete}
      onClose={handlePasswordTrainingClose}
    />
    <ControlEducationDialog
      controlKey={activeControl}
      isOpen={activeControl !== null}
      dontShowAgain={dontShowAgain}
      onDontShowAgainChange={setDontShowAgain}
      onKeepEnabled={handleKeepEnabled}
      onTurnOff={handleTurnOff}
      onClose={closeEducation}
    />
    <Card data-testid="controls-drawer">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          {t('controls.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {isHotelScenario ? renderHotelControls() : renderHomeOfficeControls()}
      </CardContent>
    </Card>
    </>
  );
}
