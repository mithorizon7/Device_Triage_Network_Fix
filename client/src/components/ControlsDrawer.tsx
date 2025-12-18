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
import { Wifi, Lock, Users, Shield, Key, RefreshCw, KeyRound, Info, HelpCircle } from "lucide-react";
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
  | "wifiSecurity";

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

const STORAGE_KEY_PASSWORD_TRAINING = 'deviceTriage_dontShowPasswordTraining';

function getPasswordTrainingDontShow(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_PASSWORD_TRAINING) === 'true';
  } catch {
    return false;
  }
}

function setPasswordTrainingDontShow(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_PASSWORD_TRAINING, value ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function ControlsDrawer({
  controls,
  onControlChange,
  guestNetworkAvailable,
  iotNetworkAvailable
}: ControlsDrawerProps) {
  const { t } = useTranslation();
  const [passwordTrainingOpen, setPasswordTrainingOpen] = useState(false);
  const [passwordDontShowAgain, setPasswordDontShowAgain] = useState(getPasswordTrainingDontShow);
  
  const {
    activeControl,
    dontShowAgain,
    setDontShowAgain,
    showEducation,
    closeEducation,
    shouldShowEducation,
  } = useControlEducation();

  const handleBooleanControlChange = (controlKey: EducatableControlKey, checked: boolean) => {
    if (controlKey === 'strongWifiPassword' && checked) {
      onControlChange('strongWifiPassword', true);
      if (!getPasswordTrainingDontShow()) {
        setPasswordTrainingOpen(true);
      }
      return;
    }
    
    onControlChange(controlKey as keyof Controls, checked as Controls[keyof Controls]);
    if (checked && shouldShowEducation(controlKey)) {
      showEducation(controlKey);
    }
  };

  const handlePasswordTrainingComplete = (accepted: boolean) => {
    if (passwordDontShowAgain) {
      setPasswordTrainingDontShow(true);
    }
    if (!accepted) {
      onControlChange('strongWifiPassword', false);
    }
    setPasswordTrainingOpen(false);
  };

  const handlePasswordTrainingClose = () => {
    setPasswordTrainingOpen(false);
  };

  const handlePasswordDontShowChange = (checked: boolean) => {
    setPasswordDontShowAgain(checked);
  };

  const openPasswordTraining = () => {
    setPasswordTrainingOpen(true);
  };

  const handleWifiSecurityChange = (value: Controls["wifiSecurity"]) => {
    const previousValue = controls.wifiSecurity;
    onControlChange("wifiSecurity", value);
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

  return (
    <>
    <PasswordTrainingDialog
      isOpen={passwordTrainingOpen}
      dontShowAgain={passwordDontShowAgain}
      onDontShowAgainChange={handlePasswordDontShowChange}
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
        <ControlItem
          icon={Wifi}
          label={t('controls.wifiSecurity')}
          description={t('controls.wifiSecurityDesc')}
          tooltip={t('tooltips.controls.wifiSecurity')}
        >
          <div className="flex items-center gap-1">
            <Select
              value={controls.wifiSecurity}
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
              checked={controls.strongWifiPassword}
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
            checked={controls.guestNetworkEnabled}
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
            checked={controls.iotNetworkEnabled}
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
            checked={controls.mfaEnabled}
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
            checked={controls.autoUpdatesEnabled}
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
            checked={controls.defaultPasswordsAddressed}
            onCheckedChange={(checked) => handleBooleanControlChange("defaultPasswordsAddressed", checked)}
            data-testid="switch-defaultPasswordsAddressed"
            aria-label={t('controls.defaultPasswordsAddressed')}
          />
        </ControlItem>
      </CardContent>
    </Card>
    </>
  );
}
