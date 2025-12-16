import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScenarioSelector } from "@/components/ScenarioSelector";
import { ZoneDropTarget } from "@/components/ZoneDropTarget";
import { RiskMeter } from "@/components/RiskMeter";
import { ControlsDrawer } from "@/components/ControlsDrawer";
import { ExplainScorePanel } from "@/components/ExplainScorePanel";
import { zones } from "@/lib/zones";
import { calculateScore, type ScoringRules } from "@/lib/scoringEngine";
import { RotateCcw, Target, BookOpen } from "lucide-react";
import type { Scenario, Controls, ZoneId, ScoreResult } from "@shared/schema";

export default function Home() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [deviceZones, setDeviceZones] = useState<Record<string, ZoneId>>({});
  const [controls, setControls] = useState<Controls | null>(null);

  const { data: scenariosList, isLoading: scenariosLoading } = useQuery<Array<{ id: string; title: string; environment: { type: string } }>>({
    queryKey: ["/api/scenarios"]
  });

  const { data: scoringRules, isLoading: rulesLoading } = useQuery<ScoringRules>({
    queryKey: ["/api/scoring-rules"]
  });

  const { data: currentScenario, isLoading: scenarioLoading } = useQuery<Scenario>({
    queryKey: ["/api/scenarios", selectedScenarioId],
    enabled: !!selectedScenarioId
  });

  useEffect(() => {
    if (scenariosList?.length && !selectedScenarioId) {
      setSelectedScenarioId(scenariosList[0].id);
    }
  }, [scenariosList, selectedScenarioId]);

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
    }
  }, [currentScenario]);

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

  const isLoading = scenariosLoading || rulesLoading || scenarioLoading;

  if (isLoading && !currentScenario) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Device Triage Planner</h1>
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
            <h1 className="text-lg font-semibold">Device Triage Planner</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <ScenarioSelector
              scenarios={scenariosList || []}
              selectedId={selectedScenarioId}
              onSelect={handleScenarioChange}
              isLoading={scenariosLoading}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              data-testid="button-reset"
              aria-label="Reset scenario to initial state"
            >
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" />
              Reset
            </Button>
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
                Learning Objectives
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
          </div>

          <div className="lg:col-span-4 space-y-4">
            <Card data-testid="risk-meter-card">
              <CardContent className="pt-6">
                <RiskMeter
                  subscores={scoreResult.subscores}
                  total={scoreResult.total}
                />
              </CardContent>
            </Card>

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
    </div>
  );
}
