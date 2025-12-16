import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  getCustomScenarios, 
  saveCustomScenario, 
  deleteCustomScenario,
  exportScenarioAsJson,
  createEmptyScenario
} from "@/lib/customScenarios";
import { getDeviceIcon } from "@/lib/deviceIcons";
import { recordCustomScenarioCreated } from "@/lib/progressTracking";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, Plus, Trash2, Download, Upload, Save, 
  Target, FileText, Pencil, Copy
} from "lucide-react";
import type { Scenario, Device, DeviceType, RiskFlag } from "@shared/schema";

const deviceTypes: DeviceType[] = [
  "router", "laptop", "phone", "tablet", "tv", "speaker", 
  "thermostat", "camera", "printer", "iot", "unknown"
];

const riskFlags: RiskFlag[] = [
  "unknown_device", "iot_device", "visitor_device", "trusted_work_device"
];

const environmentTypes = ["home", "office", "hotel", "school", "cafe", "other"];

function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function generateIp(index: number): string {
  return `192.168.1.${10 + index}`;
}

function generateMac(index: number): string {
  const hex = (index + 1).toString(16).padStart(2, "0").toUpperCase();
  return `AA:BB:CC:DD:EE:${hex}`;
}

export default function AuthorPage() {
  const [, setLocation] = useLocation();
  const [customScenarios, setCustomScenarios] = useState<Scenario[]>(getCustomScenarios());
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateNew = useCallback(() => {
    setEditingScenario(createEmptyScenario());
  }, []);

  const handleEdit = useCallback((scenario: Scenario) => {
    setEditingScenario({ ...scenario });
  }, []);

  const handleDuplicate = useCallback((scenario: Scenario) => {
    const duplicate = {
      ...scenario,
      id: `${scenario.id}_copy_${Date.now()}`,
      title: `${scenario.title} (Copy)`
    };
    saveCustomScenario(duplicate);
    setCustomScenarios(getCustomScenarios());
  }, []);

  const handleDelete = useCallback((scenarioId: string) => {
    deleteCustomScenario(scenarioId);
    setCustomScenarios(getCustomScenarios());
  }, []);

  const handleSave = useCallback(() => {
    if (editingScenario) {
      const isNew = !customScenarios.some(s => s.id === editingScenario.id);
      saveCustomScenario(editingScenario);
      setCustomScenarios(getCustomScenarios());
      setEditingScenario(null);
      
      if (isNew) {
        const badge = recordCustomScenarioCreated();
        if (badge) {
          toast({
            title: "Badge Earned!",
            description: `${badge.name}: ${badge.description}`,
          });
        }
      }
    }
  }, [editingScenario, customScenarios, toast]);

  const handleCancel = useCallback(() => {
    setEditingScenario(null);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const scenario = JSON.parse(content) as Scenario;
        if (!scenario.id || !scenario.title || !scenario.devices) {
          throw new Error("Invalid scenario format");
        }
        scenario.id = `imported_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
        saveCustomScenario(scenario);
        setCustomScenarios(getCustomScenarios());
        setImportError(null);
      } catch {
        setImportError("Failed to import scenario. Please check the file format.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, []);

  const updateScenarioField = useCallback(<K extends keyof Scenario>(field: K, value: Scenario[K]) => {
    setEditingScenario(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const addDevice = useCallback(() => {
    if (!editingScenario) return;
    const newIndex = editingScenario.devices.length;
    const newDevice: Device = {
      id: generateDeviceId(),
      type: "laptop",
      label: `Device ${newIndex + 1}`,
      networkId: "main",
      ip: generateIp(newIndex),
      localId: generateMac(newIndex),
      riskFlags: []
    };
    updateScenarioField("devices", [...editingScenario.devices, newDevice]);
  }, [editingScenario, updateScenarioField]);

  const updateDevice = useCallback((deviceId: string, updates: Partial<Device>) => {
    if (!editingScenario) return;
    const updatedDevices = editingScenario.devices.map(d => 
      d.id === deviceId ? { ...d, ...updates } : d
    );
    updateScenarioField("devices", updatedDevices);
  }, [editingScenario, updateScenarioField]);

  const removeDevice = useCallback((deviceId: string) => {
    if (!editingScenario) return;
    updateScenarioField("devices", editingScenario.devices.filter(d => d.id !== deviceId));
  }, [editingScenario, updateScenarioField]);

  const toggleDeviceFlag = useCallback((deviceId: string, flag: RiskFlag) => {
    if (!editingScenario) return;
    const device = editingScenario.devices.find(d => d.id === deviceId);
    if (!device) return;
    
    const hasFlag = device.riskFlags.includes(flag);
    const newFlags = hasFlag 
      ? device.riskFlags.filter(f => f !== flag)
      : [...device.riskFlags, flag];
    updateDevice(deviceId, { riskFlags: newFlags });
  }, [editingScenario, updateDevice]);

  const updateLearningObjective = useCallback((index: number, value: string) => {
    if (!editingScenario) return;
    const objectives = [...(editingScenario.learningObjectives || [])];
    objectives[index] = value;
    updateScenarioField("learningObjectives", objectives);
  }, [editingScenario, updateScenarioField]);

  const addLearningObjective = useCallback(() => {
    if (!editingScenario) return;
    const objectives = [...(editingScenario.learningObjectives || []), ""];
    updateScenarioField("learningObjectives", objectives);
  }, [editingScenario, updateScenarioField]);

  const removeLearningObjective = useCallback((index: number) => {
    if (!editingScenario) return;
    const objectives = (editingScenario.learningObjectives || []).filter((_, i) => i !== index);
    updateScenarioField("learningObjectives", objectives);
  }, [editingScenario, updateScenarioField]);

  if (editingScenario) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleCancel} data-testid="button-back-to-list">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Pencil className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-lg font-semibold">Edit Scenario</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel} data-testid="button-cancel">
                Cancel
              </Button>
              <Button onClick={handleSave} data-testid="button-save">
                <Save className="h-4 w-4 mr-2" />
                Save Scenario
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Scenario Title</Label>
                  <Input
                    id="title"
                    value={editingScenario.title}
                    onChange={(e) => updateScenarioField("title", e.target.value)}
                    placeholder="e.g., Home Network Security Challenge"
                    data-testid="input-scenario-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environment-type">Environment Type</Label>
                  <Select 
                    value={editingScenario.environment.type} 
                    onValueChange={(value) => updateScenarioField("environment", { ...editingScenario.environment, type: value })}
                  >
                    <SelectTrigger data-testid="select-environment-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {environmentTypes.map(type => (
                        <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Scenario Notes</Label>
                <Textarea
                  id="notes"
                  value={editingScenario.environment.notes || ""}
                  onChange={(e) => updateScenarioField("environment", { ...editingScenario.environment, notes: e.target.value })}
                  placeholder="Brief description or context for learners..."
                  className="resize-none"
                  rows={2}
                  data-testid="textarea-notes"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Devices ({editingScenario.devices.length})</CardTitle>
              <Button variant="outline" size="sm" onClick={addDevice} data-testid="button-add-device">
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </CardHeader>
            <CardContent>
              {editingScenario.devices.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No devices yet. Click "Add Device" to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {editingScenario.devices.map((device, index) => {
                    const DeviceIcon = getDeviceIcon(device.type);
                    return (
                      <div 
                        key={device.id} 
                        className="flex flex-wrap items-start gap-3 p-3 border rounded-lg bg-muted/30"
                        data-testid={`device-row-${device.id}`}
                      >
                        <div className="flex-shrink-0 p-2 bg-muted rounded-md">
                          <DeviceIcon className="h-5 w-5" />
                        </div>
                        
                        <div className="flex-1 min-w-[200px] space-y-2">
                          <div className="flex gap-2">
                            <Input
                              value={device.label}
                              onChange={(e) => updateDevice(device.id, { label: e.target.value })}
                              placeholder="Device name"
                              className="flex-1"
                              data-testid={`input-device-label-${index}`}
                            />
                            <Select 
                              value={device.type} 
                              onValueChange={(value: DeviceType) => updateDevice(device.id, { type: value })}
                            >
                              <SelectTrigger className="w-[130px]" data-testid={`select-device-type-${index}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {deviceTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {riskFlags.map(flag => (
                              <label 
                                key={flag} 
                                className="flex items-center gap-1.5 text-xs cursor-pointer"
                              >
                                <Checkbox
                                  checked={device.riskFlags.includes(flag)}
                                  onCheckedChange={() => toggleDeviceFlag(device.id, flag)}
                                  data-testid={`checkbox-flag-${device.id}-${flag}`}
                                />
                                <span className="text-muted-foreground">{flag.replace(/_/g, " ")}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Input
                            value={device.ip || ""}
                            onChange={(e) => updateDevice(device.id, { ip: e.target.value })}
                            placeholder="IP Address"
                            className="w-[140px] font-mono text-xs"
                            data-testid={`input-device-ip-${index}`}
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeDevice(device.id)}
                            data-testid={`button-remove-device-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">Learning Objectives</CardTitle>
              <Button variant="outline" size="sm" onClick={addLearningObjective} data-testid="button-add-objective">
                <Plus className="h-4 w-4 mr-2" />
                Add Objective
              </Button>
            </CardHeader>
            <CardContent>
              {(editingScenario.learningObjectives?.length || 0) === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p>No learning objectives yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {editingScenario.learningObjectives?.map((objective, index) => (
                    <div key={index} className="flex gap-2">
                      <span className="flex-shrink-0 w-6 h-9 flex items-center justify-center text-sm text-muted-foreground">
                        {index + 1}.
                      </span>
                      <Input
                        value={objective}
                        onChange={(e) => updateLearningObjective(index, e.target.value)}
                        placeholder="Learning objective..."
                        data-testid={`input-objective-${index}`}
                      />
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeLearningObjective(index)}
                        data-testid={`button-remove-objective-${index}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Initial Controls State</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Wi-Fi Security</Label>
                  <Select 
                    value={editingScenario.initialControls.wifiSecurity}
                    onValueChange={(value: "OPEN" | "WPA2" | "WPA3") => 
                      updateScenarioField("initialControls", { ...editingScenario.initialControls, wifiSecurity: value })
                    }
                  >
                    <SelectTrigger data-testid="select-wifi-security">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="WPA2">WPA2</SelectItem>
                      <SelectItem value="WPA3">WPA3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {[
                  { key: "strongWifiPassword", label: "Strong Wi-Fi Password" },
                  { key: "guestNetworkEnabled", label: "Guest Network Enabled" },
                  { key: "iotNetworkEnabled", label: "IoT Network Enabled" },
                  { key: "mfaEnabled", label: "MFA Enabled" },
                  { key: "autoUpdatesEnabled", label: "Auto Updates" },
                  { key: "defaultPasswordsAddressed", label: "Default Passwords Addressed" }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={editingScenario.initialControls[key as keyof typeof editingScenario.initialControls] as boolean}
                      onCheckedChange={(checked) => 
                        updateScenarioField("initialControls", { 
                          ...editingScenario.initialControls, 
                          [key]: checked 
                        })
                      }
                      data-testid={`checkbox-control-${key}`}
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Win Conditions (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="max-risk">Maximum Total Risk Score</Label>
                  <Input
                    id="max-risk"
                    type="number"
                    min="0"
                    max="100"
                    value={editingScenario.suggestedWinConditions?.maxTotalRisk ?? 35}
                    onChange={(e) => updateScenarioField("suggestedWinConditions", {
                      ...editingScenario.suggestedWinConditions,
                      maxTotalRisk: parseInt(e.target.value) || 35
                    })}
                    className="w-[120px]"
                    data-testid="input-max-risk"
                  />
                  <p className="text-xs text-muted-foreground">Learner achieves completion when total risk drops below this value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="button-back-home">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Scenario Authoring</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer" data-testid="button-import">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input type="file" accept=".json" className="hidden" onChange={handleImport} />
              </label>
            </Button>
            <Button onClick={handleCreateNew} data-testid="button-create-new">
              <Plus className="h-4 w-4 mr-2" />
              New Scenario
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {importError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            {importError}
            <Button variant="ghost" size="sm" className="ml-2" onClick={() => setImportError(null)}>
              Dismiss
            </Button>
          </div>
        )}

        {customScenarios.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h2 className="text-lg font-medium mb-2">No Custom Scenarios Yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your own scenarios for learners or import existing JSON files.
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Import JSON
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </Button>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customScenarios.map((scenario) => (
              <Card key={scenario.id} className="hover-elevate" data-testid={`card-scenario-${scenario.id}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{scenario.title}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {scenario.environment.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {scenario.devices.length} devices
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(scenario)} data-testid={`button-edit-${scenario.id}`}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(scenario)} data-testid={`button-duplicate-${scenario.id}`}>
                      <Copy className="h-3 w-3 mr-1" />
                      Duplicate
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => exportScenarioAsJson(scenario)} data-testid={`button-export-${scenario.id}`}>
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(scenario.id)} data-testid={`button-delete-${scenario.id}`}>
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
