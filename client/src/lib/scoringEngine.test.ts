import { describe, it, expect } from "vitest";
import { calculateScore, type ScoringRules } from "./scoringEngine";

type DeviceType = "router" | "laptop" | "phone" | "tablet" | "tv" | "speaker" | "thermostat" | "camera" | "printer" | "iot" | "unknown";
type RiskFlag = "unknown_device" | "iot_device" | "visitor_device" | "trusted_work_device";
type ZoneId = "main" | "guest" | "iot" | "investigate";

interface Device {
  id: string;
  type: DeviceType;
  label: string;
  networkId: string;
  ip?: string;
  localId?: string;
  riskFlags: RiskFlag[];
}

interface Controls {
  wifiSecurity: "OPEN" | "WPA2" | "WPA3";
  strongWifiPassword: boolean;
  guestNetworkEnabled: boolean;
  iotNetworkEnabled: boolean;
  mfaEnabled: boolean;
  autoUpdatesEnabled: boolean;
  defaultPasswordsAddressed: boolean;
}

const testRules: ScoringRules = {
  version: "1.0",
  scoreModel: {
    subscores: ["exposure", "credentialAccount", "hygiene"],
    weights: {
      exposure: 0.5,
      credentialAccount: 0.3,
      hygiene: 0.2
    },
    caps: {
      exposure: { min: 0, max: 100 },
      credentialAccount: { min: 0, max: 100 },
      hygiene: { min: 0, max: 100 },
      total: { min: 0, max: 100 }
    }
  },
  defaults: {
    baseline: {
      exposure: 25,
      credentialAccount: 15,
      hygiene: 15
    },
    allowedZones: ["main", "guest", "iot", "investigate"]
  },
  zoneRules: [
    {
      id: "unknown_not_in_investigate",
      when: { deviceHasFlag: "unknown_device", zoneNot: "investigate" },
      add: { exposure: 35 },
      explain: "Unknown device is not quarantined for investigation."
    },
    {
      id: "unknown_in_investigate",
      when: { deviceHasFlag: "unknown_device", zoneIs: "investigate" },
      add: { exposure: -15 },
      explain: "Unknown device quarantined for investigation reduces immediate exposure."
    },
    {
      id: "iot_on_main",
      when: { deviceHasFlag: "iot_device", zoneIs: "main" },
      add: { exposure: 12 },
      explain: "IoT device placed on main network increases blast radius."
    },
    {
      id: "visitor_on_main",
      when: { deviceHasFlag: "visitor_device", zoneIs: "main" },
      add: { exposure: 10 },
      explain: "Visitor device on main network increases exposure."
    }
  ],
  controlRules: [
    {
      id: "wifi_security_open",
      when: { controlIs: "wifiSecurity", valueIs: "OPEN" },
      add: { exposure: 25, hygiene: 10 },
      explain: "Open Wi-Fi removes link-layer protection."
    },
    {
      id: "wifi_security_wpa3",
      when: { controlIs: "wifiSecurity", valueIs: "WPA3" },
      add: { exposure: -2 },
      explain: "WPA3 provides stronger Wi-Fi protections."
    },
    {
      id: "strong_wifi_password_on",
      when: { controlIs: "strongWifiPassword", valueIs: true },
      add: { hygiene: -10 },
      explain: "Strong Wi-Fi password reduces opportunistic access."
    },
    {
      id: "strong_wifi_password_off",
      when: { controlIs: "strongWifiPassword", valueIs: false },
      add: { hygiene: 10 },
      explain: "Weak Wi-Fi passwords increase risk."
    },
    {
      id: "mfa_on",
      when: { controlIs: "mfaEnabled", valueIs: true },
      add: { credentialAccount: -12 },
      explain: "MFA reduces account takeover risk."
    },
    {
      id: "mfa_off",
      when: { controlIs: "mfaEnabled", valueIs: false },
      add: { credentialAccount: 12 },
      explain: "No MFA increases account takeover risk."
    }
  ],
  synergyRules: [
    {
      id: "iot_isolation_bonus",
      when: {
        all: [
          { controlIs: "iotNetworkEnabled", valueIs: true },
          { pctOfDevicesWithFlagInZoneAtLeast: { flag: "iot_device", zone: "iot", pct: 0.7 } }
        ]
      },
      add: { exposure: -10 },
      explain: "Most IoT devices isolated into IoT zone reduces blast radius."
    },
    {
      id: "guest_network_used_bonus",
      when: {
        all: [
          { controlIs: "guestNetworkEnabled", valueIs: true },
          { countDevicesWithFlagInZoneAtLeast: { flag: "visitor_device", zone: "guest", count: 1 } }
        ]
      },
      add: { exposure: -6 },
      explain: "Visitor devices on guest network reduces main exposure."
    }
  ],
  explainPanel: {
    maxItems: 8,
    sortOrder: "largestAbsoluteImpactFirst",
    include: ["baseline", "zoneRules", "controlRules", "synergyRules"]
  }
};

const createDevice = (overrides: Partial<Device>): Device => ({
  id: "test_device",
  type: "laptop",
  label: "Test Device",
  networkId: "main",
  ip: "192.168.1.10",
  localId: "AA:AA:AA:AA:AA:01",
  riskFlags: [],
  ...overrides
});

const createControls = (overrides: Partial<Controls>): Controls => ({
  wifiSecurity: "WPA2",
  strongWifiPassword: false,
  guestNetworkEnabled: false,
  iotNetworkEnabled: false,
  mfaEnabled: false,
  autoUpdatesEnabled: false,
  defaultPasswordsAddressed: false,
  ...overrides
});

describe("Scoring Engine", () => {
  describe("Baseline Scores", () => {
    it("should return baseline scores with no devices and default controls", () => {
      const devices: Device[] = [];
      const deviceZones: Record<string, ZoneId> = {};
      const controls = createControls({});

      const result = calculateScore(testRules, devices, deviceZones, controls);

      expect(result.subscores.exposure).toBeGreaterThanOrEqual(0);
      expect(result.subscores.credentialAccount).toBeGreaterThanOrEqual(0);
      expect(result.subscores.hygiene).toBeGreaterThanOrEqual(0);
      expect(result.explanations.some(e => e.ruleId === "baseline")).toBe(true);
    });

    it("should include baseline explanation", () => {
      const result = calculateScore(testRules, [], {}, createControls({}));
      const baselineExp = result.explanations.find(e => e.ruleId === "baseline");
      
      expect(baselineExp).toBeDefined();
      expect(baselineExp?.delta).toEqual({
        exposure: 25,
        credentialAccount: 15,
        hygiene: 15
      });
    });
  });

  describe("Control Rules", () => {
    it("should apply WPA3 security bonus", () => {
      const controls1 = createControls({ wifiSecurity: "WPA2" });
      const controls2 = createControls({ wifiSecurity: "WPA3" });

      const result1 = calculateScore(testRules, [], {}, controls1);
      const result2 = calculateScore(testRules, [], {}, controls2);

      expect(result2.subscores.exposure).toBeLessThan(result1.subscores.exposure);
    });

    it("should apply Open Wi-Fi penalty", () => {
      const controlsOpen = createControls({ wifiSecurity: "OPEN" });
      const controlsWpa2 = createControls({ wifiSecurity: "WPA2" });

      const resultOpen = calculateScore(testRules, [], {}, controlsOpen);
      const resultWpa2 = calculateScore(testRules, [], {}, controlsWpa2);

      expect(resultOpen.subscores.exposure).toBeGreaterThan(resultWpa2.subscores.exposure);
      expect(resultOpen.subscores.hygiene).toBeGreaterThan(resultWpa2.subscores.hygiene);
    });

    it("should apply strong password bonus", () => {
      const controlsWeak = createControls({ strongWifiPassword: false });
      const controlsStrong = createControls({ strongWifiPassword: true });

      const resultWeak = calculateScore(testRules, [], {}, controlsWeak);
      const resultStrong = calculateScore(testRules, [], {}, controlsStrong);

      expect(resultStrong.subscores.hygiene).toBeLessThan(resultWeak.subscores.hygiene);
    });

    it("should apply MFA bonus", () => {
      const controlsNoMfa = createControls({ mfaEnabled: false });
      const controlsMfa = createControls({ mfaEnabled: true });

      const resultNoMfa = calculateScore(testRules, [], {}, controlsNoMfa);
      const resultMfa = calculateScore(testRules, [], {}, controlsMfa);

      expect(resultMfa.subscores.credentialAccount).toBeLessThan(resultNoMfa.subscores.credentialAccount);
    });
  });

  describe("Zone Rules", () => {
    it("should penalize unknown device not in investigate zone", () => {
      const unknownDevice = createDevice({
        id: "unknown1",
        type: "unknown",
        riskFlags: ["unknown_device"]
      });
      const controls = createControls({});

      const resultMain = calculateScore(
        testRules,
        [unknownDevice],
        { unknown1: "main" },
        controls
      );
      
      const resultInvestigate = calculateScore(
        testRules,
        [unknownDevice],
        { unknown1: "investigate" },
        controls
      );

      expect(resultMain.subscores.exposure).toBeGreaterThan(resultInvestigate.subscores.exposure);
    });

    it("should penalize IoT device on main network", () => {
      const iotDevice = createDevice({
        id: "iot1",
        type: "tv",
        riskFlags: ["iot_device"]
      });
      const controls = createControls({});

      const resultMain = calculateScore(
        testRules,
        [iotDevice],
        { iot1: "main" },
        controls
      );
      
      const resultIot = calculateScore(
        testRules,
        [iotDevice],
        { iot1: "iot" },
        controls
      );

      expect(resultMain.subscores.exposure).toBeGreaterThan(resultIot.subscores.exposure);
    });

    it("should penalize visitor device on main network", () => {
      const visitorDevice = createDevice({
        id: "visitor1",
        type: "phone",
        riskFlags: ["visitor_device"]
      });
      const controls = createControls({});

      const resultMain = calculateScore(
        testRules,
        [visitorDevice],
        { visitor1: "main" },
        controls
      );
      
      const resultGuest = calculateScore(
        testRules,
        [visitorDevice],
        { visitor1: "guest" },
        controls
      );

      expect(resultMain.subscores.exposure).toBeGreaterThan(resultGuest.subscores.exposure);
    });
  });

  describe("Synergy Rules", () => {
    it("should apply IoT isolation bonus when 70%+ IoT devices in IoT zone", () => {
      const iotDevices = [
        createDevice({ id: "iot1", riskFlags: ["iot_device"] }),
        createDevice({ id: "iot2", riskFlags: ["iot_device"] }),
        createDevice({ id: "iot3", riskFlags: ["iot_device"] })
      ];
      const controls = createControls({ iotNetworkEnabled: true });

      const resultPartial = calculateScore(
        testRules,
        iotDevices,
        { iot1: "iot", iot2: "main", iot3: "main" },
        controls
      );

      const resultFull = calculateScore(
        testRules,
        iotDevices,
        { iot1: "iot", iot2: "iot", iot3: "iot" },
        controls
      );

      expect(resultFull.subscores.exposure).toBeLessThan(resultPartial.subscores.exposure);
      expect(resultFull.explanations.some(e => e.ruleId === "iot_isolation_bonus")).toBe(true);
    });

    it("should apply guest network bonus when visitor in guest zone", () => {
      const visitorDevice = createDevice({
        id: "visitor1",
        riskFlags: ["visitor_device"]
      });
      const controlsEnabled = createControls({ guestNetworkEnabled: true });
      const controlsDisabled = createControls({ guestNetworkEnabled: false });

      const resultWithBonus = calculateScore(
        testRules,
        [visitorDevice],
        { visitor1: "guest" },
        controlsEnabled
      );

      const resultWithoutBonus = calculateScore(
        testRules,
        [visitorDevice],
        { visitor1: "guest" },
        controlsDisabled
      );

      expect(resultWithBonus.subscores.exposure).toBeLessThan(resultWithoutBonus.subscores.exposure);
    });
  });

  describe("Score Capping", () => {
    it("should cap subscores at maximum 100", () => {
      const manyUnknownDevices = Array.from({ length: 10 }, (_, i) =>
        createDevice({
          id: `unknown${i}`,
          type: "unknown",
          riskFlags: ["unknown_device"]
        })
      );
      const deviceZones: Record<string, ZoneId> = {};
      manyUnknownDevices.forEach(d => { deviceZones[d.id] = "main"; });

      const controlsBad = createControls({ wifiSecurity: "OPEN" });

      const result = calculateScore(testRules, manyUnknownDevices, deviceZones, controlsBad);

      expect(result.subscores.exposure).toBeLessThanOrEqual(100);
      expect(result.subscores.credentialAccount).toBeLessThanOrEqual(100);
      expect(result.subscores.hygiene).toBeLessThanOrEqual(100);
      expect(result.total).toBeLessThanOrEqual(100);
    });

    it("should cap subscores at minimum 0", () => {
      const controls = createControls({
        wifiSecurity: "WPA3",
        strongWifiPassword: true,
        guestNetworkEnabled: true,
        iotNetworkEnabled: true,
        mfaEnabled: true,
        autoUpdatesEnabled: true,
        defaultPasswordsAddressed: true
      });

      const result = calculateScore(testRules, [], {}, controls);

      expect(result.subscores.exposure).toBeGreaterThanOrEqual(0);
      expect(result.subscores.credentialAccount).toBeGreaterThanOrEqual(0);
      expect(result.subscores.hygiene).toBeGreaterThanOrEqual(0);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Deterministic Behavior", () => {
    it("should produce identical results for identical inputs", () => {
      const devices = [
        createDevice({ id: "laptop1", riskFlags: [] }),
        createDevice({ id: "iot1", riskFlags: ["iot_device"] }),
        createDevice({ id: "visitor1", riskFlags: ["visitor_device"] })
      ];
      const deviceZones = { laptop1: "main" as ZoneId, iot1: "iot" as ZoneId, visitor1: "guest" as ZoneId };
      const controls = createControls({ mfaEnabled: true, strongWifiPassword: true });

      const result1 = calculateScore(testRules, devices, deviceZones, controls);
      const result2 = calculateScore(testRules, devices, deviceZones, controls);
      const result3 = calculateScore(testRules, devices, deviceZones, controls);

      expect(result1.total).toBe(result2.total);
      expect(result2.total).toBe(result3.total);
      expect(result1.subscores).toEqual(result2.subscores);
      expect(result2.subscores).toEqual(result3.subscores);
    });

    it("should produce consistent explanations for identical inputs", () => {
      const devices = [createDevice({ id: "iot1", riskFlags: ["iot_device"] })];
      const deviceZones = { iot1: "main" as ZoneId };
      const controls = createControls({});

      const result1 = calculateScore(testRules, devices, deviceZones, controls);
      const result2 = calculateScore(testRules, devices, deviceZones, controls);

      expect(result1.explanations.length).toBe(result2.explanations.length);
      result1.explanations.forEach((exp, i) => {
        expect(exp.ruleId).toBe(result2.explanations[i].ruleId);
        expect(exp.explain).toBe(result2.explanations[i].explain);
      });
    });
  });

  describe("Weighted Total Calculation", () => {
    it("should calculate weighted total correctly", () => {
      const result = calculateScore(testRules, [], {}, createControls({}));

      const expectedTotal = 
        result.subscores.exposure * 0.5 +
        result.subscores.credentialAccount * 0.3 +
        result.subscores.hygiene * 0.2;

      expect(result.total).toBeCloseTo(expectedTotal, 1);
    });
  });

  describe("Explanations", () => {
    it("should filter out zero-impact rules from explanations", () => {
      const result = calculateScore(testRules, [], {}, createControls({}));

      result.explanations.forEach(exp => {
        if (exp.ruleId !== "baseline") {
          const totalDelta = Object.values(exp.delta).reduce((sum, val) => sum + val, 0);
          expect(totalDelta).not.toBe(0);
        }
      });
    });

    it("should include device label in zone rule explanations", () => {
      const iotDevice = createDevice({
        id: "smart_tv",
        label: "Smart TV",
        riskFlags: ["iot_device"]
      });

      const result = calculateScore(
        testRules,
        [iotDevice],
        { smart_tv: "main" },
        createControls({})
      );

      const iotExplanation = result.explanations.find(e => 
        e.ruleId.includes("iot_on_main") && e.ruleId.includes("smart_tv")
      );

      expect(iotExplanation).toBeDefined();
      expect(iotExplanation?.explain).toContain("Smart TV");
    });
  });
});
