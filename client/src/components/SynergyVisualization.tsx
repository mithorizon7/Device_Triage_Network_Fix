import { useMemo } from "react";
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
}

interface Synergy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  impact: "high" | "medium" | "low";
  components: string[];
}

interface PotentialImprovement {
  id: string;
  action: string;
  impact: string;
  priority: "high" | "medium" | "low";
}

export function SynergyVisualization({
  scenario,
  deviceZones,
  controls
}: SynergyVisualizationProps) {
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

  const unknownsQuarantined = useMemo(() =>
    unknownDevices.filter(d => deviceZones[d.id] === "investigate").length,
    [unknownDevices, deviceZones]
  );

  const synergies: Synergy[] = useMemo(() => {
    const result: Synergy[] = [];

    const iotIsolationActive = controls.iotNetworkEnabled && 
      iotDevices.length > 0 && 
      iotInIotZone >= iotDevices.length * 0.7;
    
    result.push({
      id: "iot_isolation",
      name: "IoT Isolation",
      description: "IoT network enabled with devices properly segregated",
      isActive: iotIsolationActive,
      impact: "high",
      components: ["IoT Network", "Device Placement"]
    });

    const guestSegmentationActive = controls.guestNetworkEnabled && 
      visitorDevices.length > 0 && 
      visitorsInGuest >= 1;
    
    result.push({
      id: "guest_segmentation",
      name: "Guest Segmentation",
      description: "Guest network enabled with visitors properly isolated",
      isActive: guestSegmentationActive,
      impact: "medium",
      components: ["Guest Network", "Visitor Devices"]
    });

    const threatQuarantineActive = unknownDevices.length > 0 && 
      unknownsQuarantined === unknownDevices.length;
    
    result.push({
      id: "threat_quarantine",
      name: "Threat Quarantine",
      description: "All unknown devices isolated for investigation",
      isActive: threatQuarantineActive,
      impact: "high",
      components: ["Investigate Zone", "Unknown Devices"]
    });

    const strongAuthActive = controls.strongWifiPassword && 
      controls.mfaEnabled && 
      controls.wifiSecurity === "WPA3";
    
    result.push({
      id: "strong_auth",
      name: "Defense in Depth",
      description: "Strong Wi-Fi security with MFA and WPA3",
      isActive: strongAuthActive,
      impact: "high",
      components: ["WPA3", "Strong Password", "MFA"]
    });

    const maintenanceActive = controls.autoUpdatesEnabled && 
      controls.defaultPasswordsAddressed;
    
    result.push({
      id: "maintenance",
      name: "Active Maintenance",
      description: "Auto-updates enabled and default passwords changed",
      isActive: maintenanceActive,
      impact: "medium",
      components: ["Auto Updates", "Password Hygiene"]
    });

    return result;
  }, [controls, iotDevices, visitorDevices, unknownDevices, iotInIotZone, visitorsInGuest, unknownsQuarantined]);

  const potentialImprovements: PotentialImprovement[] = useMemo(() => {
    const improvements: PotentialImprovement[] = [];

    if (!controls.iotNetworkEnabled && iotDevices.length > 0) {
      improvements.push({
        id: "enable_iot",
        action: "Enable IoT Network",
        impact: "Isolate smart devices from main network",
        priority: "high"
      });
    }

    if (controls.iotNetworkEnabled && iotDevices.length > 0 && iotInIotZone < iotDevices.length) {
      improvements.push({
        id: "move_iot",
        action: `Move IoT devices to IoT zone (${iotInIotZone}/${iotDevices.length} placed)`,
        impact: "Complete IoT isolation for full synergy bonus",
        priority: "high"
      });
    }

    if (!controls.guestNetworkEnabled && visitorDevices.length > 0) {
      improvements.push({
        id: "enable_guest",
        action: "Enable Guest Network",
        impact: "Separate visitor devices from main network",
        priority: "medium"
      });
    }

    if (controls.guestNetworkEnabled && visitorDevices.length > visitorsInGuest) {
      improvements.push({
        id: "move_visitors",
        action: "Move visitor devices to Guest zone",
        impact: "Activate guest segmentation synergy",
        priority: "medium"
      });
    }

    if (unknownDevices.length > unknownsQuarantined) {
      improvements.push({
        id: "quarantine_unknown",
        action: "Quarantine unknown devices",
        impact: "Reduce exposure from unidentified devices",
        priority: "high"
      });
    }

    if (controls.wifiSecurity !== "WPA3") {
      improvements.push({
        id: "upgrade_wifi",
        action: "Upgrade to WPA3",
        impact: "Stronger wireless encryption",
        priority: controls.wifiSecurity === "OPEN" ? "high" : "low"
      });
    }

    if (!controls.mfaEnabled) {
      improvements.push({
        id: "enable_mfa",
        action: "Enable MFA on accounts",
        impact: "Protect cloud-connected devices from account compromise",
        priority: "medium"
      });
    }

    if (!controls.autoUpdatesEnabled) {
      improvements.push({
        id: "enable_updates",
        action: "Enable auto-updates",
        impact: "Reduce vulnerability exposure over time",
        priority: "medium"
      });
    }

    return improvements.slice(0, 4);
  }, [controls, iotDevices, visitorDevices, unknownDevices, iotInIotZone, visitorsInGuest, unknownsQuarantined]);

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

  return (
    <Card data-testid="synergy-visualization">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Control Synergies
          </span>
          <Badge variant="secondary">
            {activeSynergies.length}/{synergies.length} active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeSynergies.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Synergies
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
                    <span className="text-sm font-medium">{synergy.name}</span>
                  </div>
                  <p className="text-xs mt-1 opacity-80">{synergy.description}</p>
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {synergy.components.map((comp, i) => (
                      <span key={comp} className="flex items-center gap-1 text-xs">
                        {i > 0 && <ArrowRight className="h-3 w-3 opacity-50" />}
                        <span className="px-1.5 py-0.5 bg-background/50 rounded text-[10px]">
                          {comp}
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
              Available Synergies
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
                    <span className="text-sm text-muted-foreground">{synergy.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {potentialImprovements.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Suggested Actions
            </p>
            <div className="space-y-2">
              {potentialImprovements.map(improvement => (
                <div 
                  key={improvement.id}
                  className={`p-2 rounded-md ${getPriorityColor(improvement.priority)}`}
                  data-testid={`improvement-${improvement.id}`}
                >
                  <p className="text-sm font-medium">{improvement.action}</p>
                  <p className="text-xs opacity-80">{improvement.impact}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSynergies.length === synergies.length && potentialImprovements.length === 0 && (
          <div className="p-4 rounded-md bg-green-500/10 border border-green-500/30 text-center">
            <Shield className="h-8 w-8 mx-auto text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Maximum Synergies Active
            </p>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              All control combinations are optimized
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
