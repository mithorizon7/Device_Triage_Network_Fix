import type { Scenario, Controls, ZoneId, ScoreResult } from "@shared/schema";

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

export function generateExportData(
  scenario: Scenario,
  deviceZones: Record<string, ZoneId>,
  controls: Controls,
  scoreResult: ScoreResult,
  formatExplanation?: (explanation: ScoreResult["explanations"][number]) => string
): ExportData {
  const devicePlacements = scenario.devices.map(device => ({
    deviceId: device.id,
    deviceName: device.label,
    deviceType: device.type,
    originalZone: device.networkId as ZoneId,
    currentZone: deviceZones[device.id] || device.networkId as ZoneId,
    wasMoved: deviceZones[device.id] !== device.networkId,
    riskFlags: device.riskFlags
  }));

  const zoneCounts = {
    main: 0,
    guest: 0,
    iot: 0
  };

  devicePlacements.forEach(d => {
    if (d.currentZone in zoneCounts) {
      zoneCounts[d.currentZone]++;
    }
  });

  const devicesMoved = devicePlacements.filter(d => d.wasMoved).length;
  
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
    scenarioTitle: scenario.title,
    environment: scenario.environment.type,
    devicePlacements,
    controlStates: controls,
    scoring: {
      total: Math.round(scoreResult.total * 10) / 10,
      subscores: {
        exposure: Math.round(scoreResult.subscores.exposure * 10) / 10,
        credentialAccount: Math.round(scoreResult.subscores.credentialAccount * 10) / 10,
        hygiene: Math.round(scoreResult.subscores.hygiene * 10) / 10
      },
      explanations: formatExplanation
        ? scoreResult.explanations.map(formatExplanation)
        : scoreResult.explanations.map(e => e.explain)
    },
    summary: {
      totalDevices: scenario.devices.length,
      devicesInMainZone: zoneCounts.main,
      devicesInGuestZone: zoneCounts.guest,
      devicesInIoTZone: zoneCounts.iot,
      devicesMoved,
      controlsEnabled,
      controlsTotal
    }
  };
}

export function exportAsJson(data: ExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `network-triage-${data.scenarioId}-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const ZONE_NAMES: Record<ZoneId, string> = {
  main: "Main Network",
  guest: "Guest Network",
  iot: "IoT Network"
};

function getZoneName(zoneId: ZoneId): string {
  return ZONE_NAMES[zoneId] || zoneId;
}

function getRiskLevel(score: number): string {
  if (score <= 20) return "Low Risk";
  if (score <= 40) return "Moderate Risk";
  if (score <= 60) return "High Risk";
  return "Critical Risk";
}

export function exportAsHtml(data: ExportData): void {
  const riskLevel = getRiskLevel(data.scoring.total);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Network Triage Report - ${data.scenarioTitle}</title>
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
    .score-card.total { background: ${data.scoring.total <= 35 ? '#dcfce7' : data.scoring.total <= 60 ? '#fef3c7' : '#fee2e2'}; }
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
    <h1>Network Triage Report</h1>
    <p class="meta">
      <strong>Scenario:</strong> ${data.scenarioTitle} (${data.environment})<br>
      <strong>Generated:</strong> ${new Date(data.exportedAt).toLocaleString()}
    </p>

    <h2>Risk Score</h2>
    <div class="score-section">
      <div class="score-card total">
        <div class="score-value">${data.scoring.total}</div>
        <div class="score-label">${riskLevel}</div>
      </div>
      <div class="score-card sub">
        <div class="score-value">${data.scoring.subscores.exposure}</div>
        <div class="score-label">Exposure</div>
      </div>
      <div class="score-card sub">
        <div class="score-value">${data.scoring.subscores.credentialAccount}</div>
        <div class="score-label">Credential</div>
      </div>
      <div class="score-card sub">
        <div class="score-value">${data.scoring.subscores.hygiene}</div>
        <div class="score-label">Hygiene</div>
      </div>
    </div>

    <h2>Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-value">${data.summary.totalDevices}</div>
        <div class="summary-label">Total Devices</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.devicesMoved}</div>
        <div class="summary-label">Devices Moved</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.controlsEnabled}/${data.summary.controlsTotal}</div>
        <div class="summary-label">Controls Enabled</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.devicesInMainZone}</div>
        <div class="summary-label">In Main Zone</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.devicesInGuestZone}</div>
        <div class="summary-label">In Guest Zone</div>
      </div>
      <div class="summary-item">
        <div class="summary-value">${data.summary.devicesInIoTZone}</div>
        <div class="summary-label">In IoT Zone</div>
      </div>
    </div>

    <h2>Security Controls</h2>
    <div class="control-grid">
      <div class="control-item">
        <span class="control-check ${data.controlStates.wifiSecurity !== 'OPEN' ? 'on' : 'off'}">${data.controlStates.wifiSecurity !== 'OPEN' ? 'Y' : 'X'}</span>
        <span>Wi-Fi Security: ${data.controlStates.wifiSecurity}</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.strongWifiPassword ? 'on' : 'off'}">${data.controlStates.strongWifiPassword ? 'Y' : 'X'}</span>
        <span>Strong Password</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.guestNetworkEnabled ? 'on' : 'off'}">${data.controlStates.guestNetworkEnabled ? 'Y' : 'X'}</span>
        <span>Guest Network</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.iotNetworkEnabled ? 'on' : 'off'}">${data.controlStates.iotNetworkEnabled ? 'Y' : 'X'}</span>
        <span>IoT Network</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.mfaEnabled ? 'on' : 'off'}">${data.controlStates.mfaEnabled ? 'Y' : 'X'}</span>
        <span>MFA Enabled</span>
      </div>
      <div class="control-item">
        <span class="control-check ${data.controlStates.autoUpdatesEnabled ? 'on' : 'off'}">${data.controlStates.autoUpdatesEnabled ? 'Y' : 'X'}</span>
        <span>Auto Updates</span>
      </div>
    </div>

    <h2>Device Placements</h2>
    <table>
      <thead>
        <tr>
          <th>Device</th>
          <th>Type</th>
          <th>Zone</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${data.devicePlacements.map(d => `
        <tr>
          <td>${d.deviceName}</td>
          <td>${d.deviceType}</td>
          <td>${getZoneName(d.currentZone)}</td>
          <td>
            ${d.wasMoved ? `<span class="badge moved">Moved from ${getZoneName(d.originalZone)}</span>` : ''}
            ${d.riskFlags.map(f => `<span class="badge risk">${f.replace(/_/g, ' ')}</span>`).join(' ')}
          </td>
        </tr>
        `).join('')}
      </tbody>
    </table>

    ${data.scoring.explanations.length > 0 ? `
    <h2>Risk Factors</h2>
    <ul class="explanations">
      ${data.scoring.explanations.slice(0, 10).map(e => `<li>${e}</li>`).join('')}
    </ul>
    ` : ''}

    <div class="footer">
      <p>Generated by Device Triage Planner. All data is fictional for training purposes.</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `network-triage-report-${data.scenarioId}-${Date.now()}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
