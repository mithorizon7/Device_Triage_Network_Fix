import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, CheckCircle2, XCircle, Zap, ArrowRight
} from "lucide-react";
import type { Scenario, Controls, ZoneId } from "@shared/schema";

interface SynergyVisualizationProps {
  scenario: Scenario;
  deviceZones: Record<string, ZoneId>;
  controls: Controls;
  flaggedDevices?: Set<string>;
  availableControlIds?: Set<string>;
  embedded?: boolean;
}

interface Synergy {
  id: string;
  nameKey: string;
  descriptionKey: string;
  isActive: boolean;
  impact: "high" | "medium" | "low";
  componentKeys: string[];
}

interface PotentialImprovement {
  id: string;
  actionKey: string;
  actionParams?: Record<string, number>;
  impactKey: string;
  priority: "high" | "medium" | "low";
  order?: number;
}

export function SynergyVisualization({
  scenario,
  deviceZones,
  controls,
  flaggedDevices = new Set(),
  availableControlIds,
  embedded = false
}: SynergyVisualizationProps) {
  const { t } = useTranslation();

  const isControlAvailable = <K extends keyof Controls>(key: K) =>
    availableControlIds
      ? availableControlIds.has(key) && controls[key] !== undefined
      : controls[key] !== undefined;
  const supportsIotNetwork = isControlAvailable("iotNetworkEnabled");
  const supportsGuestNetwork = isControlAvailable("guestNetworkEnabled");
  const supportsWifiSecurity = isControlAvailable("wifiSecurity");
  const supportsStrongWifiPassword = isControlAvailable("strongWifiPassword");
  const supportsMfa = isControlAvailable("mfaEnabled");
  const supportsUpdates = isControlAvailable("autoUpdatesEnabled");
  const supportsDefaultPasswords = isControlAvailable("defaultPasswordsAddressed");
  const supportsVpn = isControlAvailable("vpnEnabled");
  const supportsHotspot = isControlAvailable("personalHotspot");
  const supportsFirewall = isControlAvailable("firewallEnabled");
  const supportsFileSharing = isControlAvailable("fileSharingDisabled");
  const supportsBluetooth = isControlAvailable("bluetoothDisabled");
  const supportsHttpsOnly = isControlAvailable("httpsOnly");
  const supportsVerifyNetwork = isControlAvailable("verifyNetworkAuthenticity");

  const iotDevices = useMemo(() => 
    scenario.devices.filter(d => d.riskFlags.includes("iot_device")),
    [scenario.devices]
  );

  const visitorDevices = useMemo(() =>
    scenario.devices.filter(d => d.riskFlags.includes("visitor_device")),
    [scenario.devices]
  );

  const unknownDevices = useMemo(() =>
    scenario.devices.filter(d => d.riskFlags.includes("unknown_device")),
    [scenario.devices]
  );

  const iotInIotZone = useMemo(() =>
    iotDevices.filter(d => deviceZones[d.id] === "iot").length,
    [iotDevices, deviceZones]
  );

  const visitorsInGuest = useMemo(() =>
    visitorDevices.filter(d => deviceZones[d.id] === "guest").length,
    [visitorDevices, deviceZones]
  );

  const unknownsFlagged = useMemo(() =>
    unknownDevices.filter(d => flaggedDevices.has(d.id)).length,
    [unknownDevices, flaggedDevices]
  );

  const synergies: Synergy[] = useMemo(() => {
    const result: Synergy[] = [];

    if (supportsIotNetwork) {
      const iotIsolationActive = controls.iotNetworkEnabled && 
        iotDevices.length > 0 && 
        iotInIotZone >= iotDevices.length * 0.7;
      
      result.push({
        id: "iot_isolation",
        nameKey: "synergy.iotIsolation",
        descriptionKey: "synergy.iotIsolationDesc",
        isActive: iotIsolationActive,
        impact: "high",
        componentKeys: ["synergy.componentIotNetwork", "synergy.componentDevicePlacement"]
      });
    }

    if (supportsGuestNetwork) {
      const guestSegmentationActive = controls.guestNetworkEnabled && 
        visitorDevices.length > 0 && 
        visitorsInGuest >= 1;
      
      result.push({
        id: "guest_segmentation",
        nameKey: "synergy.guestSegmentation",
        descriptionKey: "synergy.guestSegmentationDesc",
        isActive: guestSegmentationActive,
        impact: "medium",
        componentKeys: ["synergy.componentGuestNetwork", "synergy.componentVisitorDevices"]
      });
    }

    if (unknownDevices.length > 0) {
      const threatQuarantineActive = unknownsFlagged === unknownDevices.length;
      
      result.push({
        id: "threat_quarantine",
        nameKey: "synergy.threatQuarantine",
        descriptionKey: "synergy.threatQuarantineDesc",
        isActive: threatQuarantineActive,
        impact: "high",
        componentKeys: ["synergy.componentInvestigateZone", "synergy.componentUnknownDevices"]
      });
    }

    if (supportsWifiSecurity && supportsStrongWifiPassword && supportsMfa) {
      const strongAuthActive = controls.strongWifiPassword && 
        controls.mfaEnabled && 
        controls.wifiSecurity === "WPA3";
      
      result.push({
        id: "strong_auth",
        nameKey: "synergy.defenseInDepth",
        descriptionKey: "synergy.defenseInDepthDesc",
        isActive: strongAuthActive,
        impact: "high",
        componentKeys: ["synergy.componentWPA3", "synergy.componentStrongPassword", "synergy.componentMFA"]
      });
    }

    if (supportsUpdates && supportsDefaultPasswords) {
      const maintenanceActive = controls.autoUpdatesEnabled && 
        controls.defaultPasswordsAddressed;
      
      result.push({
        id: "maintenance",
        nameKey: "synergy.activeMaintenance",
        descriptionKey: "synergy.activeMaintenanceDesc",
        isActive: maintenanceActive,
        impact: "medium",
        componentKeys: ["synergy.componentAutoUpdates", "synergy.componentPasswordHygiene"]
      });
    }

    return result;
  }, [
    controls, 
    iotDevices, 
    visitorDevices, 
    unknownDevices, 
    iotInIotZone, 
    visitorsInGuest, 
    unknownsFlagged,
    supportsIotNetwork,
    supportsGuestNetwork,
    supportsWifiSecurity,
    supportsStrongWifiPassword,
    supportsMfa,
    supportsUpdates,
    supportsDefaultPasswords
  ]);

  const potentialImprovements: PotentialImprovement[] = useMemo(() => {
    const improvements: PotentialImprovement[] = [];
    let order = 0;

    const addImprovement = (improvement: PotentialImprovement) => {
      improvements.push({ ...improvement, order: order++ });
    };

    if (supportsIotNetwork && !controls.iotNetworkEnabled && iotDevices.length > 0) {
      addImprovement({
        id: "enable_iot",
        actionKey: "synergy.actionEnableIot",
        impactKey: "synergy.impactIsolateIot",
        priority: "high"
      });
    }

    if (supportsIotNetwork && controls.iotNetworkEnabled && iotDevices.length > 0 && iotInIotZone < iotDevices.length) {
      addImprovement({
        id: "move_iot",
        actionKey: "synergy.actionMoveIot",
        actionParams: { placed: iotInIotZone, total: iotDevices.length },
        impactKey: "synergy.impactCompleteIot",
        priority: "high"
      });
    }

    if (supportsGuestNetwork && !controls.guestNetworkEnabled && visitorDevices.length > 0) {
      addImprovement({
        id: "enable_guest",
        actionKey: "synergy.actionEnableGuest",
        impactKey: "synergy.impactSeparateVisitors",
        priority: "medium"
      });
    }

    if (supportsGuestNetwork && controls.guestNetworkEnabled && visitorDevices.length > visitorsInGuest) {
      addImprovement({
        id: "move_visitors",
        actionKey: "synergy.actionMoveVisitors",
        impactKey: "synergy.impactGuestSynergy",
        priority: "medium"
      });
    }

    if (unknownDevices.length > unknownsFlagged) {
      addImprovement({
        id: "quarantine_unknown",
        actionKey: "synergy.actionQuarantineUnknown",
        impactKey: "synergy.impactQuarantine",
        priority: "high"
      });
    }

    if (supportsVpn && !controls.vpnEnabled) {
      addImprovement({
        id: "enable_vpn",
        actionKey: "synergy.actionEnableVpn",
        impactKey: "synergy.impactVpnProtection",
        priority: "high"
      });
    }

    if (supportsHotspot && !controls.personalHotspot) {
      addImprovement({
        id: "use_hotspot",
        actionKey: "synergy.actionUseHotspot",
        impactKey: "synergy.impactAvoidPublicWifi",
        priority: "high"
      });
    }

    if (supportsVerifyNetwork && !controls.verifyNetworkAuthenticity) {
      addImprovement({
        id: "verify_network",
        actionKey: "synergy.actionVerifyNetwork",
        impactKey: "synergy.impactAvoidEvilTwin",
        priority: "high"
      });
    }

    if (supportsFirewall && !controls.firewallEnabled) {
      addImprovement({
        id: "enable_firewall",
        actionKey: "synergy.actionEnableFirewall",
        impactKey: "synergy.impactBlockInbound",
        priority: "medium"
      });
    }

    if (supportsHttpsOnly && !controls.httpsOnly) {
      addImprovement({
        id: "enable_https_only",
        actionKey: "synergy.actionEnableHttpsOnly",
        impactKey: "synergy.impactEncryptWeb",
        priority: "medium"
      });
    }

    if (supportsFileSharing && !controls.fileSharingDisabled) {
      addImprovement({
        id: "disable_file_sharing",
        actionKey: "synergy.actionDisableFileSharing",
        impactKey: "synergy.impactReduceFileExposure",
        priority: "medium"
      });
    }

    if (supportsBluetooth && !controls.bluetoothDisabled) {
      addImprovement({
        id: "disable_bluetooth",
        actionKey: "synergy.actionDisableBluetooth",
        impactKey: "synergy.impactReduceNearbyAttack",
        priority: "low"
      });
    }

    if (supportsWifiSecurity && controls.wifiSecurity !== "WPA3") {
      addImprovement({
        id: "upgrade_wifi",
        actionKey: "synergy.actionUpgradeWifi",
        impactKey: "synergy.impactStrongerEncryption",
        priority: controls.wifiSecurity === "OPEN" ? "high" : "low"
      });
    }

    if (supportsMfa && !controls.mfaEnabled) {
      addImprovement({
        id: "enable_mfa",
        actionKey: "synergy.actionEnableMfa",
        impactKey: "synergy.impactProtectAccounts",
        priority: "medium"
      });
    }

    if (supportsUpdates && !controls.autoUpdatesEnabled) {
      addImprovement({
        id: "enable_updates",
        actionKey: "synergy.actionEnableUpdates",
        impactKey: "synergy.impactReduceVulnerability",
        priority: "medium"
      });
    }

    const priorityOrder: Record<PotentialImprovement["priority"], number> = {
      high: 0,
      medium: 1,
      low: 2
    };

    return improvements
      .sort((a, b) => {
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return (a.order ?? 0) - (b.order ?? 0);
      })
      .slice(0, 4);
  }, [
    controls, 
    iotDevices, 
    visitorDevices, 
    unknownDevices, 
    iotInIotZone, 
    visitorsInGuest, 
    unknownsFlagged,
    supportsIotNetwork,
    supportsGuestNetwork,
    supportsWifiSecurity,
    supportsMfa,
    supportsUpdates,
    supportsVpn,
    supportsHotspot,
    supportsFirewall,
    supportsFileSharing,
    supportsBluetooth,
    supportsHttpsOnly,
    supportsVerifyNetwork
  ]);

  const activeSynergies = synergies.filter(s => s.isActive);
  const inactiveSynergies = synergies.filter(s => !s.isActive);

  const getImpactColor = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high": return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30";
      case "medium": return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30";
      case "low": return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high": return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
      case "medium": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "low": return "bg-muted text-muted-foreground";
    }
  };

  const content = (
    <div className={embedded ? "space-y-4" : ""} data-testid="synergy-content">
        {activeSynergies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('synergy.activeSynergies')}
            </p>
            <div className="space-y-2">
              {activeSynergies.map(synergy => (
                <div 
                  key={synergy.id}
                  className={`p-3 rounded-md border ${getImpactColor(synergy.impact)}`}
                  data-testid={`synergy-active-${synergy.id}`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm font-medium">{t(synergy.nameKey)}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{t(synergy.descriptionKey)}</p>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {synergy.componentKeys.map((compKey, i) => (
                      <span key={compKey} className="flex items-center gap-1 text-xs">
                        {i > 0 && <ArrowRight className="h-3 w-3 opacity-50" />}
                        <span className="px-1.5 py-0.5 bg-background/50 rounded text-[10px]">
                          {t(compKey)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {inactiveSynergies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('synergy.availableSynergies')}
            </p>
            <div className="space-y-1">
              {inactiveSynergies.map(synergy => (
                <div 
                  key={synergy.id}
                  className="p-2 rounded-md border border-dashed border-border/50 bg-muted/30"
                  data-testid={`synergy-inactive-${synergy.id}`}
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                    <span className="text-sm text-muted-foreground">{t(synergy.nameKey)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {potentialImprovements.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {t('synergy.suggestedActions')}
            </p>
            <div className="space-y-2">
              {potentialImprovements.map(improvement => (
                <div 
                  key={improvement.id}
                  className={`p-2 rounded-md ${getPriorityColor(improvement.priority)}`}
                  data-testid={`improvement-${improvement.id}`}
                >
                  <p className="text-sm font-medium">
                    {t(improvement.actionKey, improvement.actionParams)}
                  </p>
                  <p className="text-xs opacity-80">{t(improvement.impactKey)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSynergies.length === synergies.length && potentialImprovements.length === 0 && (
          <div className="p-4 rounded-md bg-green-500/10 border border-green-500/30 text-center">
            <Shield className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              {t('synergy.maxSynergiesActive')}
            </p>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              {t('synergy.allOptimized')}
            </p>
          </div>
        )}
    </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card data-testid="synergy-visualization">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            {t('synergy.title')}
          </span>
          <Badge variant="secondary">
            {t('synergy.activeCount', { active: activeSynergies.length, total: synergies.length })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {content}
      </CardContent>
    </Card>
  );
}
