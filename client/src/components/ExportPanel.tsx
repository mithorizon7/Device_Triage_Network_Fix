import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  generateExportData, 
  exportAsJson, 
  exportAsHtml,
  type ExportData 
} from "@/lib/exportUtils";
import { Download, FileJson, FileText } from "lucide-react";
import type { Scenario, Controls, ZoneId, ScoreResult } from "@shared/schema";

interface ExportPanelProps {
  scenario: Scenario;
  deviceZones: Record<string, ZoneId>;
  controls: Controls;
  scoreResult: ScoreResult;
}

export function ExportPanel({ 
  scenario, 
  deviceZones, 
  controls, 
  scoreResult 
}: ExportPanelProps) {
  const handleExportJson = () => {
    const data = generateExportData(scenario, deviceZones, controls, scoreResult);
    exportAsJson(data);
  };

  const handleExportHtml = () => {
    const data = generateExportData(scenario, deviceZones, controls, scoreResult);
    exportAsHtml(data);
  };

  return (
    <Card data-testid="export-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          Export Report
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportHtml}
          className="w-full justify-start"
          data-testid="button-export-html"
        >
          <FileText className="h-4 w-4 mr-2" aria-hidden="true" />
          Download Report (HTML)
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportJson}
          className="w-full justify-start"
          data-testid="button-export-json"
        >
          <FileJson className="h-4 w-4 mr-2" aria-hidden="true" />
          Export Data (JSON)
        </Button>
      </CardContent>
    </Card>
  );
}
