import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { ZoneDropTarget } from "@/components/ZoneDropTarget";
import { DeviceListView } from "@/components/DeviceListView";
import { RiskMeter } from "@/components/RiskMeter";
import { ControlsDrawer } from "@/components/ControlsDrawer";
import { BadgesPanel, CompletionBanner } from "@/components/BadgesPanel";
import { TutorialOverlay, TutorialTrigger, useTutorial } from "@/components/TutorialOverlay";
import { ExportPanel } from "@/components/ExportPanel";
import { WinConditionsCard } from "@/components/WinConditionsCard";
import { InsightsCard } from "@/components/InsightsCard";
import { zones } from "@/lib/zones";
import { calculateScore, type ScoringRules } from "@/lib/scoringEngine";
import { getCustomScenarios, getCustomScenariosUpdatedEventName } from "@/lib/customScenarios";
import { getDeviceDisplayLabel } from "@/lib/i18n";
import { formatExplanation } from "@/lib/explanationFormatter";
import { getOnboardingGuideState, type OnboardingGuideStepId } from "@/lib/onboardingGuide";
import {
  filterRequiredControlsByScenario,
  getControlDefinition,
  getScenarioControlIds,
} from "@/lib/controlsRegistry";
import {
  getProgress,
  recordAttempt,
  checkWinCondition,
  type UserProgress,
} from "@/lib/progressTracking";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Compass,
  FileText,
  GraduationCap,
  LayoutGrid,
  List,
  Network,
  RotateCcw,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type {
  Scenario,
  Controls,
  ZoneId,
  ScoreResult,
  Device,
  ControlsRegistry,
} from "@shared/schema";
import type { ZoneConfig } from "@/lib/zones";

interface DynamicZoneGridProps {
  zones: ZoneConfig[];
  devices: Device[];
  deviceZones: Record<string, ZoneId>;
  onDeviceDrop: (deviceId: string, zoneId: ZoneId) => void;
  onZoneChange: (deviceId: string, newZone: ZoneId) => void;
  scenarioId: string;
  flaggedDevices: Set<string>;
  onFlagToggle: (deviceId: string) => void;
}

function DynamicZoneGrid({
  zones,
  devices,
  deviceZones,
  onDeviceDrop,
  onZoneChange,
  scenarioId,
  flaggedDevices,
  onFlagToggle,
}: DynamicZoneGridProps) {
  const guestZone = zones.find((z) => z.id === "guest")!;
  const iotZone = zones.find((z) => z.id === "iot")!;
  const mainZone = zones.find((z) => z.id === "main")!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="zones-container">
      <ZoneDropTarget
        zone={mainZone}
        devices={devices}
        deviceZones={deviceZones}
        onDeviceDrop={onDeviceDrop}
        onZoneChange={onZoneChange}
        scenarioId={scenarioId}
        flaggedDevices={flaggedDevices}
        onFlagToggle={onFlagToggle}
      />
      <div className="flex flex-col gap-4">
        <ZoneDropTarget
          zone={guestZone}
          devices={devices}
          deviceZones={deviceZones}
          onDeviceDrop={onDeviceDrop}
          onZoneChange={onZoneChange}
          scenarioId={scenarioId}
          flaggedDevices={flaggedDevices}
          onFlagToggle={onFlagToggle}
          minHeight={200}
        />
        <ZoneDropTarget
          zone={iotZone}
          devices={devices}
          deviceZones={deviceZones}
          onDeviceDrop={onDeviceDrop}
          onZoneChange={onZoneChange}
          scenarioId={scenarioId}
          flaggedDevices={flaggedDevices}
          onFlagToggle={onFlagToggle}
          minHeight={200}
        />
      </div>
    </div>
  );
}

const zoneGuideIcons: Record<ZoneId, typeof Network> = {
  main: Network,
  guest: Users,
  iot: Shield,
};

export default function Home() {
  const { t } = useTranslation();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [deviceZones, setDeviceZones] = useState<Record<string, ZoneId>>({});
  const [controls, setControls] = useState<Controls | null>(null);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(getProgress());
  const [isNewCompletion, setIsNewCompletion] = useState(false);
  const [flaggedDevices, setFlaggedDevices] = useState<Set<string>>(new Set());
  const [scenarioStartRisk, setScenarioStartRisk] = useState<number | null>(null);
  const [lastAction, setLastAction] = useState<{
    type: "deviceMoved" | "controlUpdated" | "unknownFlagged" | "unknownUnflagged";
    deviceId?: string;
    zoneId?: ZoneId;
    controlId?: string;
    value?: Controls[keyof Controls];
  } | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    try {
      const saved = localStorage.getItem("deviceTriage_viewMode");
      return saved === "list" ? "list" : "grid";
    } catch {
      return "grid";
    }
  });
  const lastRecordedScore = useRef<number | null>(null);
  const previousScore = useRef<number | null>(null);
  const { toast } = useToast();
  const lastZoneWarningScenario = useRef<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("deviceTriage_viewMode", viewMode);
    } catch {
      // Ignore localStorage errors
    }
  }, [viewMode]);

  const { data: serverScenariosList, isLoading: scenariosLoading } = useQuery<
    Array<{ id: string; title: string; environment: { type: string } }>
  >({
    queryKey: ["/api/scenarios"],
  });

  const { data: scoringRules, isLoading: rulesLoading } = useQuery<ScoringRules>({
    queryKey: ["/api/scoring-rules"],
  });

  const { data: controlsRegistry } = useQuery<ControlsRegistry>({
    queryKey: ["/api/controls-registry"],
  });

  useEffect(() => {
    const refreshCustomScenarios = () => {
      setCustomScenarios(getCustomScenarios());
    };

    const scenariosUpdatedEventName = getCustomScenariosUpdatedEventName();
    refreshCustomScenarios();
    window.addEventListener("focus", refreshCustomScenarios);
    window.addEventListener("storage", refreshCustomScenarios);
    window.addEventListener(scenariosUpdatedEventName, refreshCustomScenarios);

    return () => {
      window.removeEventListener("focus", refreshCustomScenarios);
      window.removeEventListener("storage", refreshCustomScenarios);
      window.removeEventListener(scenariosUpdatedEventName, refreshCustomScenarios);
    };
  }, []);

  const allScenarios = useMemo(() => {
    const serverScenarios = serverScenariosList || [];
    const customSummaries = customScenarios.map((s) => ({
      id: s.id,
      title: s.title,
      environment: { type: s.environment.type },
      isCustom: true,
    }));
    return [...serverScenarios.map((s) => ({ ...s, isCustom: false })), ...customSummaries];
  }, [serverScenariosList, customScenarios]);

  const isCustomScenario =
    selectedScenarioId.startsWith("custom_") || selectedScenarioId.startsWith("imported_");

  const { data: serverScenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ["/api/scenarios", selectedScenarioId],
    enabled: !!selectedScenarioId && !isCustomScenario,
  });

  const currentScenario: Scenario | undefined = useMemo(() => {
    if (isCustomScenario) {
      return customScenarios.find((s) => s.id === selectedScenarioId);
    }
    return serverScenario;
  }, [isCustomScenario, selectedScenarioId, customScenarios, serverScenario]);

  const {
    showTutorial,
    hasCompletedTutorial,
    startTutorial,
    completeTutorial,
    resetTutorialState,
  } = useTutorial(!!currentScenario);

  useEffect(() => {
    if (allScenarios.length && !selectedScenarioId) {
      setSelectedScenarioId(allScenarios[0].id);
    }
  }, [allScenarios, selectedScenarioId]);

  useEffect(() => {
    if (currentScenario) {
      const allowedZoneIds = new Set(zones.map((zone) => zone.id));
      const initialZones: Record<string, ZoneId> = {};
      const invalidDeviceIds: string[] = [];
      currentScenario.devices.forEach((device) => {
        const zoneId = allowedZoneIds.has(device.networkId as ZoneId)
          ? (device.networkId as ZoneId)
          : "main";
        if (zoneId === "main" && device.networkId !== "main") {
          invalidDeviceIds.push(device.id);
        }
        initialZones[device.id] = zoneId;
      });
      setDeviceZones(initialZones);
      setControls({ ...currentScenario.initialControls });

      if (invalidDeviceIds.length > 0 && lastZoneWarningScenario.current !== currentScenario.id) {
        toast({
          title: t("author.importZoneWarningTitle"),
          description: t("author.importZoneWarning", { count: invalidDeviceIds.length }),
        });
        lastZoneWarningScenario.current = currentScenario.id;
      }
    }
  }, [currentScenario, toast, t]);

  const handleScenarioChange = useCallback((id: string) => {
    setSelectedScenarioId(id);
  }, []);

  const getZoneLabel = useCallback(
    (zoneId: ZoneId) => {
      const zone = zones.find((z) => z.id === zoneId);
      return zone ? t(zone.labelKey) : zoneId;
    },
    [t]
  );

  const getDeviceLabelById = useCallback(
    (deviceId: string) => {
      const device = currentScenario?.devices.find((d) => d.id === deviceId);
      if (!device) return deviceId;
      return getDeviceDisplayLabel(device.id, device.label, currentScenario?.id ?? null, t);
    },
    [currentScenario, t]
  );

  const getControlLabel = useCallback(
    (controlId: string) => {
      const definition = getControlDefinition(controlsRegistry, controlId);
      if (definition) return t(definition.labelKey);
      const fallbackKeyMap: Record<string, string> = {
        verifyNetworkAuthenticity: "controls.verifyNetwork",
      };
      const fallbackKey = fallbackKeyMap[controlId] ?? `controls.${controlId}`;
      return t(fallbackKey, { defaultValue: controlId });
    },
    [controlsRegistry, t]
  );

  const getControlValueLabel = useCallback(
    (controlId: string, value: Controls[keyof Controls]) => {
      if (typeof value === "boolean") {
        return value ? t("learning.value.enabled") : t("learning.value.disabled");
      }
      if (controlId === "wifiSecurity") {
        const keyMap: Record<string, string> = {
          OPEN: "controls.wifiSecurityOpen",
          WPA2: "controls.wifiSecurityWPA2",
          WPA3: "controls.wifiSecurityWPA3",
        };
        const valueKey = keyMap[String(value)];
        return valueKey ? t(valueKey) : String(value);
      }
      return String(value);
    },
    [t]
  );

  const handleDeviceDrop = useCallback(
    (deviceId: string, zoneId: ZoneId) => {
      const currentZone = deviceZones[deviceId];
      if (currentZone === zoneId) return;
      setDeviceZones((prev) => ({
        ...prev,
        [deviceId]: zoneId,
      }));
      setLastAction({ type: "deviceMoved", deviceId, zoneId });
    },
    [deviceZones]
  );

  const handleZoneChange = useCallback(
    (deviceId: string, newZone: ZoneId) => {
      const currentZone = deviceZones[deviceId];
      if (currentZone === newZone) return;
      setDeviceZones((prev) => ({
        ...prev,
        [deviceId]: newZone,
      }));
      setLastAction({ type: "deviceMoved", deviceId, zoneId: newZone });
    },
    [deviceZones]
  );

  const handleControlChange = useCallback(
    <K extends keyof Controls>(key: K, value: Controls[K]) => {
      if (!controls) return;
      if (controls[key] === value) return;
      setControls((prev) => (prev ? { ...prev, [key]: value } : null));
      setLastAction({ type: "controlUpdated", controlId: String(key), value });
    },
    [controls]
  );

  const handleFlagToggle = useCallback(
    (deviceId: string) => {
      const wasFlagged = flaggedDevices.has(deviceId);
      setFlaggedDevices((prev) => {
        const newSet = new Set(prev);
        if (wasFlagged) {
          newSet.delete(deviceId);
        } else {
          newSet.add(deviceId);
        }
        return newSet;
      });
      setLastAction({ type: wasFlagged ? "unknownUnflagged" : "unknownFlagged", deviceId });
    },
    [flaggedDevices]
  );

  const actionInsight = useMemo(() => {
    if (!lastAction) return null;
    switch (lastAction.type) {
      case "deviceMoved": {
        if (!lastAction.deviceId || !lastAction.zoneId) return null;
        const params: Record<string, string | number> = {
          device: getDeviceLabelById(lastAction.deviceId),
          zone: getZoneLabel(lastAction.zoneId),
        };
        return {
          key: "learning.action.deviceMoved",
          params,
        };
      }
      case "controlUpdated": {
        if (!lastAction.controlId || lastAction.value === undefined) return null;
        const params: Record<string, string | number> = {
          control: getControlLabel(lastAction.controlId),
          value: getControlValueLabel(lastAction.controlId, lastAction.value),
        };
        return {
          key: "learning.action.controlUpdated",
          params,
        };
      }
      case "unknownFlagged":
      case "unknownUnflagged": {
        if (!lastAction.deviceId) return null;
        const params: Record<string, string | number> = {
          device: getDeviceLabelById(lastAction.deviceId),
        };
        return {
          key:
            lastAction.type === "unknownFlagged"
              ? "learning.action.unknownFlagged"
              : "learning.action.unknownUnflagged",
          params,
        };
      }
      default:
        return null;
    }
  }, [lastAction, getDeviceLabelById, getZoneLabel, getControlLabel, getControlValueLabel]);

  const handleReset = useCallback(() => {
    if (currentScenario) {
      const allowedZoneIds = new Set(zones.map((zone) => zone.id));
      const initialZones: Record<string, ZoneId> = {};
      currentScenario.devices.forEach((device) => {
        const zoneId = allowedZoneIds.has(device.networkId as ZoneId)
          ? (device.networkId as ZoneId)
          : "main";
        initialZones[device.id] = zoneId;
      });
      setDeviceZones(initialZones);
      setControls({ ...currentScenario.initialControls });
      setFlaggedDevices(new Set());
      setLastAction(null);
      setScenarioStartRisk(null);
      resetTutorialState();
    }
  }, [currentScenario, resetTutorialState]);

  const scoreResult: ScoreResult = useMemo(() => {
    if (!scoringRules || !currentScenario || !controls) {
      return {
        subscores: { exposure: 0, credentialAccount: 0, hygiene: 0 },
        total: 0,
        explanations: [],
      };
    }
    const getDeviceLabel = (device: Device) =>
      getDeviceDisplayLabel(device.id, device.label, currentScenario?.id ?? null, t);
    return calculateScore(
      scoringRules,
      currentScenario.devices,
      deviceZones,
      controls,
      flaggedDevices,
      currentScenario.environment.type,
      getDeviceLabel
    );
  }, [scoringRules, currentScenario, deviceZones, controls, flaggedDevices, t]);

  const guestNetworkAvailable = currentScenario?.networks.some((n) => n.id === "guest") ?? false;
  const iotNetworkAvailable = currentScenario?.networks.some((n) => n.id === "iot") ?? false;
  const initialScenarioZones = useMemo<Record<string, ZoneId>>(() => {
    if (!currentScenario) return {};
    const allowedZoneIds = new Set(zones.map((zone) => zone.id));
    const initialZones: Record<string, ZoneId> = {};
    currentScenario.devices.forEach((device) => {
      initialZones[device.id] = allowedZoneIds.has(device.networkId as ZoneId)
        ? (device.networkId as ZoneId)
        : "main";
    });
    return initialZones;
  }, [currentScenario]);

  const iotDevicesInIotZone = useMemo(() => {
    if (!currentScenario) return false;
    const iotDevices = currentScenario.devices.filter((d) => d.riskFlags.includes("iot_device"));
    if (iotDevices.length === 0) return false;
    const inIotZone = iotDevices.filter((d) => deviceZones[d.id] === "iot");
    return inIotZone.length >= iotDevices.length * 0.7;
  }, [currentScenario, deviceZones]);

  const maxRisk = currentScenario?.suggestedWinConditions?.maxTotalRisk ?? 35;
  const scopedRequiredControls = useMemo(() => {
    const requiredControls = currentScenario?.suggestedWinConditions?.requires ?? [];
    return filterRequiredControlsByScenario(
      requiredControls,
      controlsRegistry,
      currentScenario?.environment.type
    );
  }, [
    currentScenario?.suggestedWinConditions?.requires,
    controlsRegistry,
    currentScenario?.environment.type,
  ]);
  const availableControlIds = useMemo(() => {
    if (!controlsRegistry) return undefined;
    const ids = getScenarioControlIds(controlsRegistry, currentScenario?.environment.type);
    return ids.size > 0 ? ids : undefined;
  }, [controlsRegistry, currentScenario?.environment.type]);
  const meetsWinCondition = checkWinCondition(
    scoreResult.total,
    maxRisk,
    scopedRequiredControls,
    controls
  );
  const onboardingGuide = useMemo(
    () =>
      getOnboardingGuideState({
        scenario: currentScenario,
        initialScenarioZones,
        deviceZones,
        flaggedDevices,
        controls,
        scenarioStartRisk,
        scoreTotal: scoreResult.total,
        meetsWinCondition,
      }),
    [
      currentScenario,
      initialScenarioZones,
      deviceZones,
      flaggedDevices,
      controls,
      scenarioStartRisk,
      scoreResult.total,
      meetsWinCondition,
    ]
  );
  const { hasSegmentedRiskDevice, hasFlaggedUnknownDevice, hasImprovedControl, hasLoweredRisk } =
    onboardingGuide;
  const tutorialActionProgress = useMemo(
    () => ({
      "segment-device": { completed: hasSegmentedRiskDevice },
      "flag-unknown": { completed: hasFlaggedUnknownDevice },
      "enable-control": { completed: hasImprovedControl },
      "lower-risk": { completed: hasLoweredRisk },
    }),
    [hasSegmentedRiskDevice, hasFlaggedUnknownDevice, hasImprovedControl, hasLoweredRisk]
  );
  const guideSteps = useMemo(
    () =>
      onboardingGuide.steps.map((step) => {
        const statusKey =
          step.status === "done"
            ? "onboardingGuide.status.done"
            : step.status === "current"
              ? "onboardingGuide.status.current"
              : "onboardingGuide.status.upNext";
        const detailKey = `onboardingGuide.steps.${step.id}.detail`;
        const detail = t(detailKey);

        return {
          ...step,
          title: t(`onboardingGuide.steps.${step.id}.title`),
          detail:
            step.id === "segment"
              ? `${detail} ${
                  viewMode === "grid"
                    ? t("onboardingGuide.viewHintGrid")
                    : t("onboardingGuide.viewHintList")
                }`
              : detail,
          statusLabel: t(statusKey),
        };
      }),
    [onboardingGuide.steps, t, viewMode]
  );
  const nextActionMessage = useMemo(() => {
    if (!currentScenario) return "";

    switch (onboardingGuide.nextStepId) {
      case "segment": {
        if (onboardingGuide.segmentCandidateId && onboardingGuide.segmentRecommendedZoneId) {
          return t("onboardingGuide.nextAction.segmentSpecific", {
            device: getDeviceLabelById(onboardingGuide.segmentCandidateId),
            zone: getZoneLabel(onboardingGuide.segmentRecommendedZoneId),
          });
        }

        return t("onboardingGuide.nextAction.segmentGeneric");
      }
      case "flag":
        return onboardingGuide.unknownCandidateId
          ? t("onboardingGuide.nextAction.flagSpecific", {
              device: getDeviceLabelById(onboardingGuide.unknownCandidateId),
            })
          : t("onboardingGuide.nextAction.flagGeneric");
      case "control":
        return onboardingGuide.controlCandidateId
          ? t("onboardingGuide.nextAction.controlSpecific", {
              control: getControlLabel(onboardingGuide.controlCandidateId),
            })
          : t("onboardingGuide.nextAction.controlGeneric");
      case "score":
        return currentScenario.suggestedWinConditions?.maxTotalRisk !== undefined
          ? t("onboardingGuide.nextAction.scoreTarget", {
              target: currentScenario.suggestedWinConditions.maxTotalRisk,
            })
          : t("onboardingGuide.nextAction.scoreGeneric");
      case "complete":
      default:
        return t("onboardingGuide.nextAction.done");
    }
  }, [currentScenario, onboardingGuide, t, getControlLabel, getDeviceLabelById, getZoneLabel]);
  const focusGuideTarget = useCallback(() => {
    const selectorMap: Record<OnboardingGuideStepId | "complete", string> = {
      segment:
        viewMode === "list"
          ? "[data-testid='device-list-view']"
          : "[data-testid='zones-container']",
      flag:
        viewMode === "list"
          ? "[data-testid='device-list-view']"
          : "[data-testid='zones-container']",
      control: "[data-testid='controls-drawer']",
      score: "[data-testid='risk-meter-card']",
      complete: "[data-testid='insights-card']",
    };

    const selector = selectorMap[onboardingGuide.nextStepId];
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }, [onboardingGuide.nextStepId, viewMode]);
  const nextActionButtonLabel = useMemo(() => {
    switch (onboardingGuide.nextStepId) {
      case "segment":
      case "flag":
        return t("onboardingGuide.actions.goToDevices");
      case "control":
        return t("onboardingGuide.actions.goToControls");
      case "score":
        return t("onboardingGuide.actions.goToScore");
      case "complete":
      default:
        return t("onboardingGuide.actions.goToInsights");
    }
  }, [onboardingGuide.nextStepId, t]);
  const fallbackLearningObjectives = useMemo(() => {
    if (currentScenario?.learningObjectives && currentScenario.learningObjectives.length > 0) {
      return currentScenario.learningObjectives.map((objective, index) => {
        const translationKey = `learningObjectives.${currentScenario.id}.${index}`;
        return t(translationKey, { defaultValue: objective }) || objective;
      });
    }

    return [t("onboardingGuide.fallbackLearningFocus")];
  }, [currentScenario, t]);

  useEffect(() => {
    if (!currentScenario || !controls || !scoringRules) return;
    if (scenarioStartRisk !== null) return;
    setScenarioStartRisk(scoreResult.total);
  }, [currentScenario, controls, scoringRules, scenarioStartRisk, scoreResult.total]);

  useEffect(() => {
    if (!currentScenario || scoreResult.total === 0) return;

    const currentScore = Math.round(scoreResult.total);
    if (lastRecordedScore.current === currentScore) return;

    if (meetsWinCondition && lastRecordedScore.current !== currentScore) {
      lastRecordedScore.current = currentScore;

      const { newBadges, isNewCompletion: newCompletion } = recordAttempt(
        currentScenario.id,
        currentScenario.title,
        currentScore,
        meetsWinCondition,
        iotDevicesInIotZone
      );

      setUserProgress(getProgress());
      setIsNewCompletion(newCompletion);

      newBadges.forEach((badge) => {
        toast({
          title: t("notifications.badgeEarned"),
          description: `${t(badge.name)}: ${t(badge.description)}`,
        });
      });
    }
  }, [currentScenario, scoreResult.total, meetsWinCondition, iotDevicesInIotZone, toast, t]);

  useEffect(() => {
    lastRecordedScore.current = null;
    previousScore.current = null;
    setIsNewCompletion(false);
    setFlaggedDevices(new Set());
    setLastAction(null);
    setScenarioStartRisk(null);
  }, [selectedScenarioId]);

  useEffect(() => {
    if (previousScore.current === null) {
      previousScore.current = scoreResult.total;
      return;
    }

    const delta = scoreResult.total - previousScore.current;
    const shouldNotify = Math.abs(delta) >= 0.5;

    if (shouldNotify) {
      const lastExplanation =
        scoreResult.explanations.length > 0
          ? scoreResult.explanations[scoreResult.explanations.length - 1]
          : null;

      const deltaDisplay = delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`;
      const isImprovement = delta < 0;
      const actionText = actionInsight ? t(actionInsight.key, actionInsight.params || {}) : null;
      const actionLine = actionText ? t("notifications.actionWhy", { action: actionText }) : null;
      const baseDescription = lastExplanation
        ? t("notifications.riskDelta", {
            delta: deltaDisplay,
            reason: formatExplanation(lastExplanation, t),
          })
        : t("notifications.riskDeltaGeneric", { delta: deltaDisplay });

      toast({
        title: isImprovement ? t("notifications.riskReduced") : t("notifications.riskIncreased"),
        description: actionLine ? `${baseDescription} ${actionLine}` : baseDescription,
        variant: isImprovement ? "default" : "destructive",
      });
    }

    previousScore.current = scoreResult.total;
  }, [scoreResult.total, scoreResult.explanations, actionInsight, toast, t]);

  const isLoading = scenariosLoading || rulesLoading || scenarioLoading;

  if (isLoading && !currentScenario) {
    return (
      <div className="min-h-screen app-shell">
        <header className="app-header">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-[hsl(var(--primary))]" />
              <h1 className="text-lg font-semibold font-display tracking-[0.16em] uppercase">
                {t("app.title")}
              </h1>
            </div>
            <Skeleton className="h-9 w-[280px]" />
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <Skeleton className="h-[200px] rounded-lg" />
              <Skeleton className="h-[200px] rounded-lg" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <Skeleton className="h-[180px] rounded-lg" />
              <Skeleton className="h-[300px] rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell">
      <header className="app-header">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-[hsl(var(--primary))]" aria-hidden="true" />
            <h1 className="text-lg font-semibold font-display tracking-[0.16em] uppercase">
              {t("app.title")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ScenarioSelector
              scenarios={allScenarios}
              selectedId={selectedScenarioId}
              onSelect={handleScenarioChange}
              isLoading={scenariosLoading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset"
              aria-label={t("header.reset")}
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              {t("header.reset")}
            </Button>
            <Link href="/author">
              <Button variant="ghost" size="sm" data-testid="button-author">
                <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                {t("header.author")}
              </Button>
            </Link>
            <div
              className="flex items-center rounded-full border border-border/60 bg-card/60 p-1 shadow-[inset_0_1px_0_hsl(var(--foreground)/0.06)]"
              role="group"
              aria-label={t("header.viewMode")}
            >
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
                aria-pressed={viewMode === "grid"}
                aria-label={t("header.gridViewAriaLabel")}
                className="rounded-full"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
                aria-pressed={viewMode === "list"}
                aria-label={t("header.listViewAriaLabel")}
                className="rounded-full"
              >
                <List className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <TutorialTrigger onStart={startTutorial} />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 reveal">
        {currentScenario && (
          <div
            className="mb-8 grid grid-cols-1 xl:grid-cols-12 gap-6"
            data-testid="onboarding-guide"
          >
            <Card className="xl:col-span-8 border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
                      <CardTitle className="text-xl tracking-[0.08em] uppercase">
                        {t("onboardingGuide.title")}
                      </CardTitle>
                    </div>
                    <CardDescription>{t("onboardingGuide.subtitle")}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="self-start">
                    {t("onboardingGuide.progress", {
                      completed: onboardingGuide.completedCount,
                      total: onboardingGuide.totalSteps,
                    })}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div
                  className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-4"
                  data-testid="onboarding-next-step"
                  aria-live="polite"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/80">
                        {onboardingGuide.nextStepId === "complete"
                          ? t("onboardingGuide.completeTitle")
                          : t("onboardingGuide.nextStepTitle")}
                      </p>
                      <p className="text-sm leading-relaxed">{nextActionMessage}</p>
                      {onboardingGuide.nextStepId === "complete" && (
                        <p className="text-sm text-muted-foreground">
                          {t("onboardingGuide.completionSummary")}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={focusGuideTarget} data-testid="button-guide-focus">
                        {nextActionButtonLabel}
                        <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={startTutorial}
                        data-testid="button-guide-tutorial"
                      >
                        <GraduationCap className="h-4 w-4 mr-2" aria-hidden="true" />
                        {hasCompletedTutorial
                          ? t("onboardingGuide.actions.replay")
                          : t("onboardingGuide.actions.walkthrough")}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {guideSteps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`rounded-2xl border px-4 py-4 ${
                        step.status === "done"
                          ? "border-primary/25 bg-primary/6"
                          : step.status === "current"
                            ? "border-primary/35 bg-card/80 shadow-[0_16px_32px_-28px_hsl(var(--shadow-color)/0.7)]"
                            : "border-border/60 bg-card/60"
                      }`}
                      data-testid={`guide-step-${step.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {step.status === "done" ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                          ) : (
                            <Circle
                              className={`h-5 w-5 ${
                                step.status === "current" ? "text-primary" : "text-muted-foreground"
                              }`}
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">
                              {t("common.numberedItem", { number: index + 1 })} {step.title}
                            </p>
                            <Badge
                              variant={step.status === "done" ? "secondary" : "outline"}
                              className="text-[0.6rem]"
                            >
                              {step.statusLabel}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg tracking-[0.08em] uppercase">
                  {t("onboardingGuide.zoneGuideTitle")}
                </CardTitle>
                <CardDescription>{t("onboardingGuide.zoneGuideDescription")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3">
                  {zones.map((zone) => {
                    const ZoneIcon = zoneGuideIcons[zone.id];
                    return (
                      <div
                        key={zone.id}
                        className="flex items-start gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3"
                      >
                        <div
                          className={`mt-0.5 rounded-full border p-2 ${zone.borderClass} ${zone.bgClass}`}
                        >
                          <ZoneIcon className={`h-4 w-4 ${zone.colorClass}`} aria-hidden="true" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{t(zone.labelKey)}</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {t(zone.descriptionKey)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 px-4 py-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                    <p className="text-sm font-medium">{t("onboardingGuide.learningFocusTitle")}</p>
                  </div>
                  <ul className="mt-3 space-y-2">
                    {fallbackLearningObjectives.map((objective, index) => (
                      <li
                        key={`${objective}-${index}`}
                        className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                        data-testid={`card-goal-${index}`}
                      >
                        <span
                          className="mt-1 h-1.5 w-1.5 rounded-full bg-primary/70"
                          aria-hidden="true"
                        />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {viewMode === "grid" ? (
              <DynamicZoneGrid
                zones={zones}
                devices={currentScenario?.devices || []}
                deviceZones={deviceZones}
                onDeviceDrop={handleDeviceDrop}
                onZoneChange={handleZoneChange}
                scenarioId={selectedScenarioId}
                flaggedDevices={flaggedDevices}
                onFlagToggle={handleFlagToggle}
              />
            ) : (
              <DeviceListView
                devices={currentScenario?.devices || []}
                deviceZones={deviceZones}
                onZoneChange={handleZoneChange}
                scenarioId={selectedScenarioId}
                flaggedDevices={flaggedDevices}
                onFlagToggle={handleFlagToggle}
              />
            )}
          </div>

          <div className="lg:col-span-4 space-y-5">
            {meetsWinCondition && (
              <CompletionBanner score={scoreResult.total} isNewCompletion={isNewCompletion} />
            )}

            <Card data-testid="risk-meter-card">
              <CardContent className="pt-6">
                <RiskMeter subscores={scoreResult.subscores} total={scoreResult.total} />
              </CardContent>
            </Card>

            {currentScenario && controls && (
              <WinConditionsCard
                scenario={currentScenario}
                currentScore={scoreResult.total}
                controls={controls}
                requiredControls={scopedRequiredControls}
                controlsRegistry={controlsRegistry}
              />
            )}

            {controls && currentScenario && (
              <ControlsDrawer
                controls={controls}
                onControlChange={handleControlChange}
                guestNetworkAvailable={guestNetworkAvailable}
                iotNetworkAvailable={iotNetworkAvailable}
                scenarioType={currentScenario.environment.type}
                controlsRegistry={controlsRegistry}
              />
            )}

            {currentScenario && controls && (
              <InsightsCard
                scenario={currentScenario}
                deviceZones={deviceZones}
                controls={controls}
                explanations={scoreResult.explanations}
                flaggedDevices={flaggedDevices}
                actionInsight={actionInsight}
                maxExplainItems={scoringRules?.explainPanel?.maxItems ?? 8}
                explainSortOrder={scoringRules?.explainPanel?.sortOrder}
                availableControlIds={availableControlIds}
              />
            )}

            {currentScenario && controls && (
              <ExportPanel
                scenario={currentScenario}
                deviceZones={deviceZones}
                controls={controls}
                scoreResult={scoreResult}
              />
            )}

            <BadgesPanel progress={userProgress} />
          </div>
        </div>
      </main>

      <footer className="border-t border-border/60 mt-14">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-xs text-muted-foreground text-center">{t("footer.disclaimer")}</p>
        </div>
      </footer>

      {showTutorial && (
        <TutorialOverlay onComplete={completeTutorial} actionProgress={tutorialActionProgress} />
      )}
    </div>
  );
}
