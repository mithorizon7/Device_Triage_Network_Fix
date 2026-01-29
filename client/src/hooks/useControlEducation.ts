import { useState, useCallback } from "react";

const STORAGE_KEY = "deviceTriage_controlEducationDismissed";

type ControlKey =
  | "strongWifiPassword"
  | "guestNetworkEnabled"
  | "iotNetworkEnabled"
  | "mfaEnabled"
  | "autoUpdatesEnabled"
  | "defaultPasswordsAddressed"
  | "wifiSecurity";

interface DismissedControls {
  [key: string]: boolean;
}

function getDismissedControls(): DismissedControls {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setDismissedControl(controlKey: string, dismissed: boolean): void {
  try {
    const current = getDismissedControls();
    current[controlKey] = dismissed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Ignore localStorage errors
  }
}

export function useControlEducation() {
  const [activeControl, setActiveControl] = useState<ControlKey | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const shouldShowEducation = useCallback((controlKey: ControlKey): boolean => {
    const dismissed = getDismissedControls();
    return !dismissed[controlKey];
  }, []);

  const showEducation = useCallback(
    (controlKey: ControlKey) => {
      if (shouldShowEducation(controlKey)) {
        setActiveControl(controlKey);
        setDontShowAgain(false);
      }
    },
    [shouldShowEducation]
  );

  const dismissEducation = useCallback(
    (keepEnabled: boolean) => {
      if (activeControl && dontShowAgain) {
        setDismissedControl(activeControl, true);
      }
      const result = {
        controlKey: activeControl,
        keepEnabled,
      };
      setActiveControl(null);
      setDontShowAgain(false);
      return result;
    },
    [activeControl, dontShowAgain]
  );

  const closeEducation = useCallback(() => {
    if (activeControl && dontShowAgain) {
      setDismissedControl(activeControl, true);
    }
    setActiveControl(null);
    setDontShowAgain(false);
  }, [activeControl, dontShowAgain]);

  return {
    activeControl,
    dontShowAgain,
    setDontShowAgain,
    showEducation,
    dismissEducation,
    closeEducation,
    shouldShowEducation,
  };
}

export function resetEducationDismissals(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}
