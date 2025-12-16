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

## User Preferences
- Dark/light mode persisted in localStorage
- Tutorial completion persisted in localStorage
- Progress and badges persisted in localStorage
- Custom scenarios persisted in localStorage

## Recent Changes
- 2024-12-16: Added 18 unit tests for scoring engine ensuring deterministic behavior
- 2024-12-16: Added screen-reader friendly list view toggle (grid/list) with localStorage persistence
- 2024-12-16: Added WinConditionsCard showing target score and required controls with visual progress
- 2024-12-16: Added real-time score change notifications explaining risk delta
- 2024-12-16: Fixed tutorial reset flow - Reset button now clears tutorial completion, allowing tutorial to auto-start again
- 2024-12-16: Removed misleading bonus point values from synergy visualization, now shows "X/5 active" count
- 2024-12-16: Fixed export controls counting to properly handle Wi-Fi security as separate from boolean toggles
- 2024-12-16: Added synergy visualization, export functionality, tutorial mode, badges, and scenario authoring
- 2024-12-16: Initial MVP implementation with all three scenarios, drag-drop UI, and scoring engine
