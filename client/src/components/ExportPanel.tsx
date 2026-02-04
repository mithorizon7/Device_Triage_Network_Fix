import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateExportData, exportAsJson, exportAsHtml } from "@/lib/exportUtils";
import { useTranslation } from "react-i18next";
import { formatExplanation } from "@/lib/explanationFormatter";
import { Download, FileJson, FileText } from "lucide-react";
import type { Scenario, Controls, ZoneId, ScoreResult } from "@shared/schema";
import { getScenarioDisplayTitle } from "@/lib/scenarioTitles";

interface ExportPanelProps {
  scenario: Scenario;
  deviceZones: Record<string, ZoneId>;
  controls: Controls;
  scoreResult: ScoreResult;
}

export function ExportPanel({ scenario, deviceZones, controls, scoreResult }: ExportPanelProps) {
  const { t, i18n } = useTranslation();
  const scenarioTitle = getScenarioDisplayTitle(scenario, t);

  const handleExportJson = () => {
    const data = generateExportData(scenario, deviceZones, controls, scoreResult, {
      formatExplanation: (explanation) => formatExplanation(explanation, t),
      scenarioTitle,
    });
    exportAsJson(data, { fileNamePrefix: t("export.report.fileNameDataPrefix") });
  };

  const handleExportHtml = () => {
    const data = generateExportData(scenario, deviceZones, controls, scoreResult, {
      formatExplanation: (explanation) => formatExplanation(explanation, t),
      scenarioTitle,
    });
    exportAsHtml(data, {
      t,
      locale: i18n.language,
      fileNamePrefix: t("export.report.fileNameReportPrefix"),
    });
  };

  return (
    <Card data-testid="export-panel">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 font-display tracking-[0.12em] uppercase">
          <Download className="h-4 w-4 text-[hsl(var(--primary))]" aria-hidden="true" />
          {t("export.title")}
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
          {t("export.htmlReport")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExportJson}
          className="w-full justify-start"
          data-testid="button-export-json"
        >
          <FileJson className="h-4 w-4 mr-2" aria-hidden="true" />
          {t("export.jsonData")}
        </Button>
      </CardContent>
    </Card>
  );
}
