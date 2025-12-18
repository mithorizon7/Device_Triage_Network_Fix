# Device Triage + Network Fix-It Planner

## Overview
An interactive educational security tool that teaches network segmentation and security controls through hands-on practice. Users drag-and-drop devices between trust zones and apply security controls to see real-time risk scoring with transparent explanations.

## Purpose
- Teach network segmentation concepts (Main, Guest, IoT, Investigate zones)
- Demonstrate why IoT devices shouldn't share a flat network with primary computers
- Show high-impact security controls in a practical, transferable way
- Provide deterministic, transparent risk scoring with plain-English explanations

## Current State
- Fully functional MVP with three pre-built scenarios
- Real-time scoring engine with configurable rules (unit-tested)
- Drag-and-drop interface with keyboard accessibility
- Screen-reader friendly list view toggle for accessibility
- Win conditions card showing target score and required controls
- Real-time score change notifications explaining risk delta
- Dark/light mode support
- Scenario authoring mode for custom scenarios
- Progress tracking with 7 achievement badges
- Guided tutorial for first-time users
- Export functionality (HTML reports and JSON data)
- Synergy visualization showing control combinations

## Project Architecture

### Frontend (React + TypeScript + Tailwind)
```
client/src/
├── pages/
│   ├── home.tsx              # Main application page
│   └── author.tsx            # Scenario authoring page
├── components/
│   ├── DeviceCard.tsx        # Draggable device card with zone selector
│   ├── ZoneDropTarget.tsx    # Drop zone for device categorization
│   ├── RiskMeter.tsx         # Visual risk score display
│   ├── ControlsDrawer.tsx    # Security controls toggles
│   ├── ExplainScorePanel.tsx # Score explanation panel
│   ├── ScenarioSelector.tsx  # Scenario dropdown
│   ├── ThemeToggle.tsx       # Dark/light mode toggle
│   ├── BadgesPanel.tsx       # Progress badges display
│   ├── TutorialOverlay.tsx   # Guided tutorial system
│   ├── ExportPanel.tsx       # Report export buttons
│   ├── SynergyVisualization.tsx # Control synergy display
│   ├── DeviceListView.tsx    # Screen-reader accessible list view
│   └── WinConditionsCard.tsx # Win conditions display
├── lib/
│   ├── scoringEngine.ts      # Client-side scoring calculation
│   ├── scoringEngine.test.ts # Unit tests for scoring engine
│   ├── deviceIcons.tsx       # Device type icon mapping
│   ├── zones.ts              # Zone configuration
│   ├── customScenarios.ts    # Custom scenario localStorage management
│   ├── progressTracking.ts   # Badge and progress system
│   ├── tutorialSteps.ts      # Tutorial content definitions
│   ├── exportUtils.ts        # Export report generation
│   └── queryClient.ts        # TanStack Query setup
```

### Backend (Express + TypeScript)
```
server/
├── routes.ts                 # API endpoints for scenarios/rules
├── scenarios/
│   ├── scoringRules.json     # Configurable scoring rules
│   ├── family_iot_sprawl_v1.json
│   ├── small_office_v1.json
│   └── hotel_public_v1.json
```

### Shared Types
```
shared/
└── schema.ts                 # Zod schemas and TypeScript types
```

## Key Features

### Three Scenarios
1. **Family IoT Sprawl** - Home network with 14 devices including IoT sprawl
2. **Small Office** - Business environment with work devices and visitors
3. **Hotel/Public Wi-Fi** - Travel scenario with shared network risks

### Four Trust Zones
- **Main Network** - Trusted personal devices with full access
- **Guest Network** - Visitor devices with internet-only access
- **IoT Network** - Smart devices isolated from main network
- **Investigate** - Unknown or suspicious devices for review

### Security Controls
- Wi-Fi Security (Open/WPA2/WPA3)
- Strong Wi-Fi Password
- Guest Network Enabled
- IoT Network Enabled
- MFA on Device Accounts
- Auto Updates
- Default Passwords Addressed

### Scoring System
- Three sub-scores: Exposure, Credential/Account, Hygiene
- Weighted total risk (0-100)
- Configurable via `scoringRules.json`
- Transparent "Explain My Score" panel

### Synergy System
- IoT Isolation (IoT network + proper device placement)
- Guest Segmentation (Guest network + visitor placement)
- Threat Quarantine (Unknown devices in Investigate zone)
- Defense in Depth (WPA3 + Strong Password + MFA)
- Active Maintenance (Auto Updates + Changed Passwords)

### Progress Tracking
7 achievement badges:
- First Steps - Complete your first scenario
- IoT Wrangler - Properly isolate IoT devices
- Zone Master - Complete all three built-in scenarios
- Perfect Score - Achieve a risk score of 10 or below
- Speed Demon - Complete a scenario in under 2 minutes
- Security Expert - Complete 5 different scenarios
- Scenario Author - Create a custom scenario

## API Endpoints
- `GET /api/scenarios` - List all scenarios (id, title, environment type)
- `GET /api/scenarios/:id` - Get full scenario by ID
- `GET /api/scoring-rules` - Get scoring rules configuration

## Security & Privacy
- No external API calls
- No telemetry or analytics
- All data is fictional (RFC 5737 IPs, fake MAC addresses)
- Completely offline-safe
- Deterministic scoring (same inputs = same outputs)

## Internationalization (i18n)

### Architecture
- **Source locale**: English (en.json) - canonical keyset
- **Target locales**: Latvian (lv), Russian (ru)
- **Fallback chain**: user preference → browser locale → locale-specific fallbacks
  - Latvian (lv): falls back to English
  - Russian (ru): falls back to English, then Latvian
  - Unknown: falls back to Latvian, then English
- **Library**: react-i18next with ICU message format (i18next-icu)
- **Loading strategy**: Bundled (all locales loaded at startup for offline support)

### Key Conventions
Keys follow the pattern: `{namespace}.{screen/component}.{element}.{state}`
- `header.tutorial` - Tutorial button in header
- `zones.main.label` - Main zone label
- `controls.wifiSecurity` - Wi-Fi security control
- `notifications.badgeEarned` - Badge earned notification
- `deviceLabels.{scenarioId}.{deviceId}` - Device label translations for built-in scenarios

### Files
- `client/src/locales/{en,lv,ru}.json` - Translation files (302 keys each)
- `client/src/lib/i18n.ts` - i18next configuration with ICU support and getDeviceDisplayLabel() helper
- `scripts/i18n-validate.js` - Validation script
- `docs/i18n-glossary.md` - Terminology glossary for translators

### Tooling
- **Validate**: `node scripts/i18n-validate.js`
  - Fails on missing keys, empty values, invalid ICU syntax
  - Warns on placeholder mismatches between locales
- **Dev mode**: Missing keys display as `[MISSING:key]` in UI and console

### Features
- Language switcher in header (flag icons with dropdown)
- Language preference persisted in localStorage (key: `deviceTriage_language`)
- Locale-aware formatting via `formatNumber()` and `formatDate()` helpers
- ICU plural support (Russian 4-form, Latvian 2-form, English 2-form)
- Author page fully internationalized with scenario creation/editing workflow

## User Preferences
- Dark/light mode persisted in localStorage
- Tutorial completion persisted in localStorage
- Progress and badges persisted in localStorage
- Custom scenarios persisted in localStorage
- Language preference persisted in localStorage (key: `deviceTriage_language`)

## Recent Changes
- 2024-12-18: Added comprehensive educational tooltip system with 25+ unique tooltips across all components
- 2024-12-18: Device type icons now display educational tooltips explaining risk profiles (laptop, phone, IoT, smart home, etc.)
- 2024-12-18: Risk flag badges show tooltips explaining their security significance (Unknown, IoT, Visitor, Work devices)
- 2024-12-18: Wi-Fi security options (Open, WPA2, WPA3) have tooltips comparing encryption standards
- 2024-12-18: All 7 security controls display tooltips explaining what each does and why it matters
- 2024-12-18: Zone icons show tooltips explaining segmentation purposes (Main, Guest, IoT, Investigate)
- 2024-12-18: All tooltips fully translated in all 3 languages (English, Latvian, Russian)
- 2024-12-17: Added device label translations for all 34 devices across 3 built-in scenarios (302 total keys)
- 2024-12-17: Created shared getDeviceDisplayLabel() helper in i18n.ts for consistent translation lookup with fallback for custom scenarios
- 2024-12-17: Added spotlight effect to tutorial - highlights target elements with dark overlay cutout and smooth transitions
- 2024-12-17: Enhanced tutorial accessibility - focus management, ARIA roles, viewport clamping for spotlight
- 2024-12-16: Completed full i18n for tutorial steps (12 steps with titles and content in all 3 languages)
- 2024-12-16: Added translated learning objectives for all 3 built-in scenarios (9 objectives per language)
- 2024-12-16: Translated scenario titles in selector dropdown for built-in scenarios
- 2024-12-16: Translated device type labels in list view with proper fallbacks for custom scenarios
- 2024-12-16: Fixed zone selector dropdown in DeviceCard to properly translate zone labels using i18n
- 2024-12-16: Fixed tutorial overlay to properly dismiss on Escape key or backdrop click
- 2024-12-16: Added robust localStorage error handling with try-catch across all read/write operations
- 2024-12-16: Fixed badge notification to properly translate badge names and descriptions
- 2024-12-16: Implemented security_expert badge (awarded after completing 5 different scenarios)
- 2024-12-16: Added footer disclaimer translation to all three locales (235 total keys)
- 2024-12-16: Removed unused zones import from exportUtils.ts
- 2024-12-16: Completed principal engineer code review fixes - 6 issues resolved
- 2024-12-16: Fully internationalized BadgesPanel, BadgeNotification, CompletionBanner components
- 2024-12-16: Added 7 new translation keys for badges system (234 total keys across all locales)
- 2024-12-16: Optimized server-side loadScenarioById to read single file instead of all scenarios
- 2024-12-16: Fixed badge key casing (zoneMaster vs zonemaster) and added persistent badge
- 2024-12-16: Enhanced i18n with fallback chain (lv → en), dev mode missing key detection, and glossary
- 2024-12-16: Added i18n validation script (scripts/i18n-validate.js) for key parity and ICU syntax checking
- 2024-12-16: Fully internationalized author.tsx scenario authoring page with 35+ new translation keys
- 2024-12-16: Completed full i18n implementation with proper ICU interpolation for all aria-labels
- 2024-12-16: Added full i18n support with English, Latvian, and Russian translations using react-i18next
- 2024-12-16: Added language switcher with flag icons to header
- 2024-12-16: Translated all core gameplay components: RiskMeter, ControlsDrawer, WinConditionsCard, zones, DeviceListView, ZoneDropTarget
- 2024-12-16: Added 18 unit tests for scoring engine ensuring deterministic behavior
- 2024-12-16: Added screen-reader friendly list view toggle (grid/list) with localStorage persistence
- 2024-12-16: Added WinConditionsCard showing target score and required controls with visual progress
- 2024-12-16: Added real-time score change notifications explaining risk delta
- 2024-12-16: Fixed tutorial reset flow - Reset button now clears tutorial completion, allowing tutorial to auto-start again
- 2024-12-16: Removed misleading bonus point values from synergy visualization, now shows "X/5 active" count
- 2024-12-16: Fixed export controls counting to properly handle Wi-Fi security as separate from boolean toggles
- 2024-12-16: Added synergy visualization, export functionality, tutorial mode, badges, and scenario authoring
- 2024-12-16: Initial MVP implementation with all three scenarios, drag-drop UI, and scoring engine
