import type { Scenario, Controls, ZoneId, ScoreResult, RiskFlag } from "@shared/schema";
import type { TFunction } from "i18next";

export interface ExportData {
  exportedAt: string;
  scenarioId: string;
  scenarioTitle: string;
  environment: string;
  devicePlacements: Array<{
    deviceId: string;
    deviceName: string;
    deviceType: string;
    originalZone: ZoneId;
    currentZone: ZoneId;
    wasMoved: boolean;
    riskFlags: string[];
  }>;
  controlStates: Controls;
  scoring: {
    total: number;
    subscores: {
      exposure: number;
      credentialAccount: number;
      hygiene: number;
    };
    explanations: string[];
  };
  summary: {
    totalDevices: number;
    devicesInMainZone: number;
    devicesInGuestZone: number;
    devicesInIoTZone: number;
    devicesMoved: number;
    controlsEnabled: number;
    controlsTotal: number;
  };
}

export interface GenerateExportDataOptions {
  formatExplanation?: (explanation: ScoreResult["explanations"][number]) => string;
  scenarioTitle?: string;
}

export interface ExportFileOptions {
  fileNamePrefix?: string;
}

export interface ExportHtmlOptions extends ExportFileOptions {
  t: TFunction;
  locale?: string;
}

export function generateExportData(
  scenario: Scenario,
  deviceZones: Record<string, ZoneId>,
  controls: Controls,
  scoreResult: ScoreResult,
  options?: GenerateExportDataOptions
): ExportData {
  const scenarioTitle = options?.scenarioTitle ?? scenario.title;
  const formatExplanation = options?.formatExplanation;
  const devicePlacements = scenario.devices.map((device) => ({
    deviceId: device.id,
    deviceName: device.label,
    deviceType: device.type,
    originalZone: device.networkId as ZoneId,
    currentZone: deviceZones[device.id] || (device.networkId as ZoneId),
    wasMoved: deviceZones[device.id] !== device.networkId,
    riskFlags: device.riskFlags,
  }));

  const zoneCounts = {
    main: 0,
    guest: 0,
    iot: 0,
  };

  devicePlacements.forEach((d) => {
    if (d.currentZone in zoneCounts) {
      zoneCounts[d.currentZone]++;
    }
  });

  const devicesMoved = devicePlacements.filter((d) => d.wasMoved).length;

  const controlEntries = Object.entries(controls).filter(([, value]) => value !== undefined);
  const controlsEnabled = controlEntries.reduce((count, [key, value]) => {
    if (typeof value === "boolean") {
      return count + (value ? 1 : 0);
    }
    if (key === "wifiSecurity") {
      return count + (value === "OPEN" ? 0 : 1);
    }
    return count;
  }, 0);
  const controlsTotal = controlEntries.length;

  return {
    exportedAt: new Date().toISOString(),
    scenarioId: scenario.id,
    scenarioTitle,
    environment: scenario.environment.type,
    devicePlacements,
    controlStates: controls,
    scoring: {
      total: Math.round(scoreResult.total * 10) / 10,
      subscores: {
        exposure: Math.round(scoreResult.subscores.exposure * 10) / 10,
        credentialAccount: Math.round(scoreResult.subscores.credentialAccount * 10) / 10,
        hygiene: Math.round(scoreResult.subscores.hygiene * 10) / 10,
      },
      explanations: formatExplanation
        ? scoreResult.explanations.map(formatExplanation)
        : scoreResult.explanations.map((e) => e.explain),
    },
    summary: {
      totalDevices: scenario.devices.length,
      devicesInMainZone: zoneCounts.main,
      devicesInGuestZone: zoneCounts.guest,
      devicesInIoTZone: zoneCounts.iot,
      devicesMoved,
      controlsEnabled,
      controlsTotal,
    },
  };
}

export function exportAsJson(data: ExportData, options?: ExportFileOptions): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  const fileNamePrefix = options?.fileNamePrefix || "network-triage";
  link.href = url;
  link.download = `${fileNamePrefix}-${data.scenarioId}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ZONE_LABEL_KEYS: Record<ZoneId, string> = {
  main: "zones.main",
  guest: "zones.guest",
  iot: "zones.iot",
};

const RISK_FLAG_LABEL_KEYS: Record<RiskFlag, string> = {
  unknown_device: "devices.unknownFlag",
  iot_device: "devices.iotFlag",
  visitor_device: "devices.visitorFlag",
  trusted_work_device: "devices.workFlag",
};

const WIFI_SECURITY_LABEL_KEYS: Record<string, string> = {
  OPEN: "controls.wifiSecurityOpen",
  WPA2: "controls.wifiSecurityWPA2",
  WPA3: "controls.wifiSecurityWPA3",
};

function getZoneName(zoneId: ZoneId, t: TFunction): string {
  const key = ZONE_LABEL_KEYS[zoneId];
  return key ? t(key) : zoneId;
}

function getRiskFlagLabel(flag: RiskFlag, t: TFunction): string {
  const key = RISK_FLAG_LABEL_KEYS[flag];
  return key ? t(key) : flag.replace(/_/g, " ");
}

function getDeviceTypeLabel(type: string, t: TFunction): string {
  return t(`devices.${type}`, { defaultValue: type });
}

function getWifiSecurityLabel(value: string | undefined, t: TFunction): string {
  if (!value) return "";
  const key = WIFI_SECURITY_LABEL_KEYS[value];
  return key ? t(key) : value;
}

function getEnvironmentLabel(environment: string, t: TFunction): string {
  return t(`environmentTypes.${environment}`, { defaultValue: environment });
}

function getRiskLevel(score: number, t: TFunction): string {
  if (score <= 20) return t("riskMeter.low");
  if (score <= 40) return t("riskMeter.medium");
  if (score <= 60) return t("riskMeter.high");
  return t("riskMeter.critical");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function exportAsHtml(data: ExportData, options: ExportHtmlOptions): void {
  const { t, locale, fileNamePrefix } = options;
  const esc = (value: string | number) => escapeHtml(String(value));
  const reportTitle = t("export.report.title");
  const documentTitle = t("export.report.documentTitle", {
    reportTitle,
    title: data.scenarioTitle,
  });
  const riskLevel = getRiskLevel(data.scoring.total, t);
  const environmentLabel = getEnvironmentLabel(data.environment, t);
  const exportedAt = new Date(data.exportedAt).toLocaleString(locale || "en");
  const safeScenarioTitle = esc(data.scenarioTitle);
  const safeEnvironmentLabel = esc(environmentLabel);
  const safeReportTitle = esc(reportTitle);
  const safeDocumentTitle = esc(documentTitle);
  const safeRiskLevel = esc(riskLevel);
  const safeExportedAt = esc(exportedAt);
  const wifiSecurityEnabled =
    data.controlStates.wifiSecurity !== undefined
      ? data.controlStates.wifiSecurity !== "OPEN"
      : false;
  const wifiSecurityLabel = getWifiSecurityLabel(data.controlStates.wifiSecurity, t);
  const resolvedFileNamePrefix = fileNamePrefix || "network-triage-report";

  const html = `<!DOCTYPE html>
<html lang="${locale || "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeDocumentTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f5f5f5;
      padding: 2rem;
    }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; color: #111; }
    h2 { font-size: 1.25rem; margin: 1.5rem 0 0.75rem; color: #333; border-bottom: 2px solid #e5e5e5; padding-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .score-section { display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap; }
    .score-card { flex: 1; min-width: 150px; padding: 1rem; border-radius: 6px; text-align: center; }
    .score-card.total { background: ${data.scoring.total <= 35 ? "#dcfce7" : data.scoring.total <= 60 ? "#fef3c7" : "#fee2e2"}; }
    .score-card.sub { background: #f3f4f6; }
    .score-value { font-size: 2rem; font-weight: bold; color: #111; }
    .score-label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; }
    .summary-item { background: #f9fafb; padding: 0.75rem; border-radius: 4px; }
    .summary-value { font-size: 1.25rem; font-weight: 600; }
    .summary-label { font-size: 0.75rem; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.875rem; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e5e5e5; }
    th { background: #f9fafb; font-weight: 600; }
    .badge { display: inline-block; padding: 0.125rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 500; }
    .badge.moved { background: #dbeafe; color: #1e40af; }
    .badge.risk { background: #fee2e2; color: #991b1b; }
    .control-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; }
    .control-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background: #f9fafb; border-radius: 4px; }
    .control-check { width: 1.25rem; height: 1.25rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
    .control-check.on { background: #dcfce7; color: #166534; }
    .control-check.off { background: #fee2e2; color: #991b1b; }
    .explanations { list-style: none; }
    .explanations li { padding: 0.5rem; background: #fef3c7; border-left: 3px solid #f59e0b; margin: 0.5rem 0; font-size: 0.875rem; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e5e5e5; font-size: 0.75rem; color: #999; text-align: center; }
    @media print { body { background: white; padding: 0; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <h1>${safeReportTitle}</h1>
    <p class="meta">
      <strong>${esc(t("export.report.metaScenario"))}:</strong> ${safeScenarioTitle} (${safeEnvironmentLabel})<br>
      <strong>${esc(t("export.report.metaGenerated"))}:</strong> ${safeExportedAt}
    </p>

    <h2>${esc(t("export.report.riskScore"))}</h2>
    <div class="score-section">
      <div class="score-card total">
        <div class="score-value">${esc(data.scoring.total)}</div>
        <div class="score-label">${safeRiskLevel}</div>
      </div>
      <div class="score-card sub">
        <div class="score-value">${esc(data.scoring.subscores.exposure)}</div>
        <div class="score-label">${esc(t("riskMeter.exposure"))}</div>
      </div>
      <div class="score-card sub">
        <div class="score-value">${esc(data.scoring.subscores.credentialAccount)}</div>
        <div class="score-label">${esc(t("riskMeter.credential"))}</div>
      </div>
      <div class="score-card sub">
        <div class="score-value">${esc(data.scoring.subscores.hygiene)}</div>
        <div class="score-label">${esc(t("riskMeter.hygiene"))}</div>
      </div>
    </div>

    <h2>${esc(t("export.report.summary"))}</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${esc(data.summary.totalDevices)}</div>
        <div class="summary-label">${esc(t("export.report.summaryTotalDevices"))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${esc(data.summary.devicesMoved)}</div>
        <div class="summary-label">${esc(t("export.report.summaryDevicesMoved"))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${esc(`${data.summary.controlsEnabled}/${data.summary.controlsTotal}`)}</div>
        <div class="summary-label">${esc(t("export.report.summaryControlsEnabled"))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${esc(data.summary.devicesInMainZone)}</div>
        <div class="summary-label">${esc(t("export.report.summaryInMainZone"))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${esc(data.summary.devicesInGuestZone)}</div>
        <div class="summary-label">${esc(t("export.report.summaryInGuestZone"))}</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${esc(data.summary.devicesInIoTZone)}</div>
        <div class="summary-label">${esc(t("export.report.summaryInIotZone"))}</div>
      </div>
    </div>

    <h2>${esc(t("export.report.securityControls"))}</h2>
    <div class="control-grid">
      <div class="control-item">
        <span class="control-check ${wifiSecurityEnabled ? "on" : "off"}">${esc(wifiSecurityEnabled ? t("export.report.on") : t("export.report.off"))}</span>
        <span>${esc(t("export.report.controlWithValue", { control: t("controls.wifiSecurity"), value: wifiSecurityLabel || "-" }))}</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.strongWifiPassword ? "on" : "off"}">${esc(data.controlStates.strongWifiPassword ? t("export.report.on") : t("export.report.off"))}</span>
        <span>${esc(t("controls.strongWifiPassword"))}</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.guestNetworkEnabled ? "on" : "off"}">${esc(data.controlStates.guestNetworkEnabled ? t("export.report.on") : t("export.report.off"))}</span>
        <span>${esc(t("controls.guestNetworkEnabled"))}</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.iotNetworkEnabled ? "on" : "off"}">${esc(data.controlStates.iotNetworkEnabled ? t("export.report.on") : t("export.report.off"))}</span>
        <span>${esc(t("controls.iotNetworkEnabled"))}</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.mfaEnabled ? "on" : "off"}">${esc(data.controlStates.mfaEnabled ? t("export.report.on") : t("export.report.off"))}</span>
        <span>${esc(t("controls.mfaEnabled"))}</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.autoUpdatesEnabled ? "on" : "off"}">${esc(data.controlStates.autoUpdatesEnabled ? t("export.report.on") : t("export.report.off"))}</span>
        <span>${esc(t("controls.autoUpdatesEnabled"))}</span>
      </div>
    </div>

    <h2>${esc(t("export.report.devicePlacements"))}</h2>
    <table>
      <thead>
        <tr>
          <th>${esc(t("export.report.tableDevice"))}</th>
          <th>${esc(t("export.report.tableType"))}</th>
          <th>${esc(t("export.report.tableZone"))}</th>
          <th>${esc(t("export.report.tableStatus"))}</th>
        </tr>
      </thead>
      <tbody>
        ${data.devicePlacements
          .map(
            (d) => `
        <tr>
          <td>${esc(d.deviceName)}</td>
          <td>${esc(getDeviceTypeLabel(d.deviceType, t))}</td>
          <td>${esc(getZoneName(d.currentZone, t))}</td>
          <td>
            ${d.wasMoved ? `<span class="badge moved">${esc(t("export.report.movedFrom", { zone: getZoneName(d.originalZone, t) }))}</span>` : ""}
            ${d.riskFlags.map((f) => `<span class="badge risk">${esc(getRiskFlagLabel(f as RiskFlag, t))}</span>`).join(" ")}
          </td>
        </tr>
        `
          )
          .join("")}
      </tbody>
    </table>

    ${
      data.scoring.explanations.length > 0
        ? `
    <h2>${esc(t("export.report.riskFactors"))}</h2>
    <ul class="explanations">
      ${data.scoring.explanations
        .slice(0, 10)
        .map((e) => `<li>${esc(e)}</li>`)
        .join("")}
    </ul>
    `
        : ""
    }

    <div class="footer">
      <p>${esc(t("export.report.footer", { appTitle: t("app.title") }))}</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `${resolvedFileNamePrefix}-${data.scenarioId}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
