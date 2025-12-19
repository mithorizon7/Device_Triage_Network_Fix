import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getCustomScenarios } from "@/lib/customScenarios";
import { 
  getProgress, 
  recordAttempt, 
  checkWinCondition,
  type UserProgress
} from "@/lib/progressTracking";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw, Target, FileText, LayoutGrid, List } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type { Scenario, Controls, ZoneId, ScoreResult, Device } from "@shared/schema";
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
  onFlagToggle
}: DynamicZoneGridProps) {
  const guestZone = zones.find(z => z.id === "guest")!;
  const iotZone = zones.find(z => z.id === "iot")!;
  const mainZone = zones.find(z => z.id === "main")!;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-testid="zones-container">
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

export default function Home() {
  const { t } = useTranslation();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [deviceZones, setDeviceZones] = useState<Record<string, ZoneId>>({});
  const [controls, setControls] = useState<Controls | null>(null);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(getProgress());
  const [isNewCompletion, setIsNewCompletion] = useState(false);
  const [flaggedDevices, setFlaggedDevices] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    try {
      localStorage.setItem("deviceTriage_viewMode", viewMode);
    } catch {
      // Ignore localStorage errors
    }
  }, [viewMode]);

  const { data: serverScenariosList, isLoading: scenariosLoading } = useQuery<Array<{ id: string; title: string; environment: { type: string } }>>({
    queryKey: ["/api/scenarios"]
  });

  const { data: scoringRules, isLoading: rulesLoading } = useQuery<ScoringRules>({
    queryKey: ["/api/scoring-rules"]
  });

  useEffect(() => {
    setCustomScenarios(getCustomScenarios());
  }, []);

  const allScenarios = useMemo(() => {
    const serverScenarios = serverScenariosList || [];
    const customSummaries = customScenarios.map(s => ({
      id: s.id,
      title: s.title,
      environment: { type: s.environment.type },
      isCustom: true
    }));
    return [...serverScenarios.map(s => ({ ...s, isCustom: false })), ...customSummaries];
  }, [serverScenariosList, customScenarios]);

  const isCustomScenario = selectedScenarioId.startsWith("custom_") || selectedScenarioId.startsWith("imported_");

  const { data: serverScenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ["/api/scenarios", selectedScenarioId],
    enabled: !!selectedScenarioId && !isCustomScenario
  });

  const currentScenario: Scenario | undefined = useMemo(() => {
    if (isCustomScenario) {
      return customScenarios.find(s => s.id === selectedScenarioId);
    }
    return serverScenario;
  }, [isCustomScenario, selectedScenarioId, customScenarios, serverScenario]);

  const { showTutorial, startTutorial, completeTutorial, resetTutorialState } = useTutorial(!!currentScenario);

  useEffect(() => {
    if (allScenarios.length && !selectedScenarioId) {
      setSelectedScenarioId(allScenarios[0].id);
    }
  }, [allScenarios, selectedScenarioId]);

  useEffect(() => {
    if (currentScenario) {
      const initialZones: Record<string, ZoneId> = {};
      currentScenario.devices.forEach(device => {
        initialZones[device.id] = device.networkId as ZoneId;
      });
      setDeviceZones(initialZones);
      setControls({ ...currentScenario.initialControls });
    }
  }, [currentScenario]);

  const handleScenarioChange = useCallback((id: string) => {
    setSelectedScenarioId(id);
  }, []);

  const handleDeviceDrop = useCallback((deviceId: string, zoneId: ZoneId) => {
    setDeviceZones(prev => ({
      ...prev,
      [deviceId]: zoneId
    }));
  }, []);

  const handleZoneChange = useCallback((deviceId: string, newZone: ZoneId) => {
    setDeviceZones(prev => ({
      ...prev,
      [deviceId]: newZone
    }));
  }, []);

  const handleControlChange = useCallback(<K extends keyof Controls>(key: K, value: Controls[K]) => {
    setControls(prev => prev ? { ...prev, [key]: value } : null);
  }, []);

  const handleFlagToggle = useCallback((deviceId: string) => {
    setFlaggedDevices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  }, []);

  const handleReset = useCallback(() => {
    if (currentScenario) {
      const initialZones: Record<string, ZoneId> = {};
      currentScenario.devices.forEach(device => {
        initialZones[device.id] = device.networkId as ZoneId;
      });
      setDeviceZones(initialZones);
      setControls({ ...currentScenario.initialControls });
      setFlaggedDevices(new Set());
      resetTutorialState();
    }
  }, [currentScenario, resetTutorialState]);

  const scoreResult: ScoreResult = useMemo(() => {
    if (!scoringRules || !currentScenario || !controls) {
      return {
        subscores: { exposure: 0, credentialAccount: 0, hygiene: 0 },
        total: 0,
        explanations: []
      };
    }
    return calculateScore(scoringRules, currentScenario.devices, deviceZones, controls, flaggedDevices);
  }, [scoringRules, currentScenario, deviceZones, controls, flaggedDevices]);

  const guestNetworkAvailable = currentScenario?.networks.some(n => n.id === "guest") ?? false;
  const iotNetworkAvailable = currentScenario?.networks.some(n => n.id === "iot") ?? false;

  const iotDevicesInIotZone = useMemo(() => {
    if (!currentScenario) return false;
    const iotDevices = currentScenario.devices.filter(d => d.riskFlags.includes("iot_device"));
    if (iotDevices.length === 0) return false;
    const inIotZone = iotDevices.filter(d => deviceZones[d.id] === "iot");
    return inIotZone.length >= iotDevices.length * 0.7;
  }, [currentScenario, deviceZones]);

  const maxRisk = currentScenario?.suggestedWinConditions?.maxTotalRisk ?? 35;
  const meetsWinCondition = checkWinCondition(scoreResult.total, maxRisk);

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

      newBadges.forEach(badge => {
        toast({
          title: t('notifications.badgeEarned'),
          description: `${t(badge.name)}: ${t(badge.description)}`,
        });
      });
    }
  }, [currentScenario, scoreResult.total, meetsWinCondition, iotDevicesInIotZone, toast]);

  useEffect(() => {
    lastRecordedScore.current = null;
    previousScore.current = null;
    setIsNewCompletion(false);
    setFlaggedDevices(new Set());
  }, [selectedScenarioId]);

  useEffect(() => {
    if (previousScore.current === null) {
      previousScore.current = scoreResult.total;
      return;
    }

    const delta = scoreResult.total - previousScore.current;
    const shouldNotify = Math.abs(delta) >= 0.5;

    if (shouldNotify) {
      const lastExplanation = scoreResult.explanations.length > 0 
        ? scoreResult.explanations[scoreResult.explanations.length - 1] 
        : null;
      
      const deltaDisplay = delta > 0 ? `+${Math.round(delta)}` : `${Math.round(delta)}`;
      const isImprovement = delta < 0;

      toast({
        title: isImprovement ? t('notifications.riskReduced') : t('notifications.riskIncreased'),
        description: lastExplanation 
          ? t('notifications.riskDelta', { delta: deltaDisplay, reason: lastExplanation.explain })
          : t('notifications.riskDeltaGeneric', { delta: deltaDisplay }),
        variant: isImprovement ? "default" : "destructive",
      });
    }

    previousScore.current = scoreResult.total;
  }, [scoreResult.total, scoreResult.explanations, toast]);

  const isLoading = scenariosLoading || rulesLoading || scenarioLoading;

  if (isLoading && !currentScenario) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-lg font-semibold">{t('app.title')}</h1>
            </div>
            <Skeleton className="h-9 w-[280px]" />
            <ThemeToggle />
          </div>
        </header>
        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <h1 className="text-lg font-semibold">{t('app.title')}</h1>
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
              aria-label={t('header.reset')}
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('header.reset')}
            </Button>
            <Link href="/author">
              <Button variant="ghost" size="sm" data-testid="button-author">
                <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
                {t('header.author')}
              </Button>
            </Link>
            <div className="flex items-center border rounded-md" role="group" aria-label={t('header.viewMode')}>
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
                aria-pressed={viewMode === "grid"}
                aria-label={t('header.gridViewAriaLabel')}
                className="rounded-r-none border-r"
              >
                <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                data-testid="button-view-list"
                aria-pressed={viewMode === "list"}
                aria-label={t('header.listViewAriaLabel')}
                className="rounded-l-none"
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

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentScenario?.learningObjectives && currentScenario.learningObjectives.length > 0 && (
          <div className="mb-8 text-center" data-testid="goals-section">
            <h2 className="text-2xl font-semibold mb-6">{t('goals.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {currentScenario.learningObjectives.map((objective, index) => {
                const translationKey = `learningObjectives.${currentScenario.id}.${index}`;
                const translated = t(translationKey, { defaultValue: objective });
                const displayText = translated || objective;
                
                return (
                  <Card key={index} className="text-center" data-testid={`card-goal-${index}`}>
                    <CardContent className="pt-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-lg font-semibold mx-auto mb-3">
                        {index + 1}
                      </div>
                      <p className="text-sm text-muted-foreground">{displayText}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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

          <div className="lg:col-span-4 space-y-4">
            {meetsWinCondition && (
              <CompletionBanner 
                score={scoreResult.total} 
                isNewCompletion={isNewCompletion} 
              />
            )}

            <Card data-testid="risk-meter-card">
              <CardContent className="pt-6">
                <RiskMeter
                  subscores={scoreResult.subscores}
                  total={scoreResult.total}
                />
              </CardContent>
            </Card>

            {currentScenario && controls && (
              <WinConditionsCard
                scenario={currentScenario}
                currentScore={scoreResult.total}
                controls={controls}
              />
            )}

            {controls && currentScenario && (
              <ControlsDrawer
                controls={controls}
                onControlChange={handleControlChange}
                guestNetworkAvailable={guestNetworkAvailable}
                iotNetworkAvailable={iotNetworkAvailable}
                scenarioType={currentScenario.environment.type}
              />
            )}

            {currentScenario && controls && (
              <InsightsCard
                scenario={currentScenario}
                deviceZones={deviceZones}
                controls={controls}
                explanations={scoreResult.explanations}
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

      <footer className="border-t mt-12">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-xs text-muted-foreground text-center">
            {t('footer.disclaimer')}
          </p>
        </div>
      </footer>

      {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
    </div>
  );
}
