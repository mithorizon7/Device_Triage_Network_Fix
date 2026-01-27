import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SynergyVisualization } from "@/components/SynergyVisualization";
import { ExplainScorePanel } from "@/components/ExplainScorePanel";
import { Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Scenario, Controls, ZoneId, ScoreResult } from "@shared/schema";

interface InsightsCardProps {
  scenario: Scenario;
  deviceZones: Record<string, ZoneId>;
  controls: Controls;
  explanations: ScoreResult["explanations"];
  flaggedDevices: Set<string>;
  availableControlIds?: Set<string>;
  maxExplainItems?: number;
  explainSortOrder?: string;
}

export function InsightsCard({
  scenario,
  deviceZones,
  controls,
  explanations,
  flaggedDevices,
  availableControlIds,
  maxExplainItems = 8,
  explainSortOrder,
}: InsightsCardProps) {
  const { t } = useTranslation();

  return (
    <Card data-testid="insights-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          {t('insights.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="synergies" className="w-full">
          <TabsList className="w-full grid grid-cols-2 mb-3">
            <TabsTrigger 
              value="synergies" 
              className="text-xs"
              data-testid="tab-synergies"
            >
              {t('insights.synergiesTab')}
            </TabsTrigger>
            <TabsTrigger 
              value="explain" 
              className="text-xs"
              data-testid="tab-explain"
            >
              {t('insights.explainTab')}
            </TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[320px]">
            <TabsContent value="synergies" className="mt-0 pr-2">
              <SynergyVisualization
                scenario={scenario}
                deviceZones={deviceZones}
                controls={controls}
                flaggedDevices={flaggedDevices}
                availableControlIds={availableControlIds}
                embedded={true}
              />
            </TabsContent>
            
            <TabsContent value="explain" className="mt-0 pr-2">
              <ExplainScorePanel
                explanations={explanations}
                maxItems={maxExplainItems}
                sortOrder={explainSortOrder}
                embedded={true}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
}
