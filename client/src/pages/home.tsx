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
import { ExplainScorePanel } from "@/components/ExplainScorePanel";
import { BadgesPanel, CompletionBanner } from "@/components/BadgesPanel";
import { TutorialOverlay, TutorialTrigger, useTutorial } from "@/components/TutorialOverlay";
import { ExportPanel } from "@/components/ExportPanel";
import { SynergyVisualization } from "@/components/SynergyVisualization";
import { WinConditionsCard } from "@/components/WinConditionsCard";
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
import { RotateCcw, Target, BookOpen, FileText, LayoutGrid, List } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import type { Scenario, Controls, ZoneId, ScoreResult } from "@shared/schema";

export default function Home() {
  const { t } = useTranslation();
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [deviceZones, setDeviceZones] = useState<Record<string, ZoneId>>({});
  const [controls, setControls] = useState<Controls | null>(null);
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(getProgress());
  const [isNewCompletion, setIsNewCompletion] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("deviceTriage_viewMode");
    return saved === "list" ? "list" : "grid";
  });
  const lastRecordedScore = useRef<number | null>(null);
  const previousScore = useRef<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem("deviceTriage_viewMode", viewMode);
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

  const handleReset = useCallback(() => {
    if (currentScenario) {
      const initialZones: Record<string, ZoneId> = {};
      currentScenario.devices.forEach(device => {
        initialZones[device.id] = device.networkId as ZoneId;
      });
      setDeviceZones(initialZones);
      setControls({ ...currentScenario.initialControls });
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
    return calculateScore(scoringRules, currentScenario.devices, deviceZones, controls);
  }, [scoringRules, currentScenario, deviceZones, controls]);

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
          title: "Badge Earned!",
          description: `${badge.name}: ${badge.description}`,
        });
      });
    }
  }, [currentScenario, scoreResult.total, meetsWinCondition, iotDevicesInIotZone, toast]);

  useEffect(() => {
    lastRecordedScore.current = null;
    previousScore.current = null;
    setIsNewCompletion(false);
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
        title: isImprovement ? "Risk Reduced" : "Risk Increased",
        description: lastExplanation 
          ? `${deltaDisplay} risk: ${lastExplanation.explain}`
          : `${deltaDisplay} risk from recent change`,
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
            <div className="flex items-center border rounded-md" role="group" aria-label="View mode">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                data-testid="button-view-grid"
                aria-pressed={viewMode === "grid"}
                aria-label="Grid view with drag and drop"
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
                aria-label="Screen reader friendly list view"
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
          <Card className="mb-6" data-testid="learning-objectives">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                {t('learningObjectives.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {currentScenario.learningObjectives.map((objective, index) => (
                  <li 
                    key={index} 
                    className="text-sm text-muted-foreground flex items-start gap-2"
                    data-testid={`text-objective-${index}`}
                  >
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    {objective}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="zones-container">
                {zones.map((zone) => (
                  <ZoneDropTarget
                    key={zone.id}
                    zone={zone}
                    devices={currentScenario?.devices || []}
                    deviceZones={deviceZones}
                    onDeviceDrop={handleDeviceDrop}
                    onZoneChange={handleZoneChange}
                  />
                ))}
              </div>
            ) : (
              <DeviceListView
                devices={currentScenario?.devices || []}
                deviceZones={deviceZones}
                onZoneChange={handleZoneChange}
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

            {controls && (
              <ControlsDrawer
                controls={controls}
                onControlChange={handleControlChange}
                guestNetworkAvailable={guestNetworkAvailable}
                iotNetworkAvailable={iotNetworkAvailable}
              />
            )}

            <ExplainScorePanel
              explanations={scoreResult.explanations}
              maxItems={8}
            />

            {currentScenario && controls && (
              <SynergyVisualization
                scenario={currentScenario}
                deviceZones={deviceZones}
                controls={controls}
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
            All addresses and identifiers are fictional for training purposes. No real network data is collected.
          </p>
        </div>
      </footer>

      {showTutorial && <TutorialOverlay onComplete={completeTutorial} />}
    </div>
  );
}
