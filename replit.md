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
- Real-time scoring engine with configurable rules
- Drag-and-drop interface with keyboard accessibility
- Dark/light mode support

## Project Architecture

### Frontend (React + TypeScript + Tailwind)
```
client/src/
├── pages/
│   └── home.tsx              # Main application page
├── components/
│   ├── DeviceCard.tsx        # Draggable device card with zone selector
│   ├── ZoneDropTarget.tsx    # Drop zone for device categorization
│   ├── RiskMeter.tsx         # Visual risk score display
│   ├── ControlsDrawer.tsx    # Security controls toggles
│   ├── ExplainScorePanel.tsx # Score explanation panel
│   ├── ScenarioSelector.tsx  # Scenario dropdown
│   └── ThemeToggle.tsx       # Dark/light mode toggle
├── lib/
│   ├── scoringEngine.ts      # Client-side scoring calculation
│   ├── deviceIcons.tsx       # Device type icon mapping
│   ├── zones.ts              # Zone configuration
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

## Recent Changes
- 2024-12-16: Initial MVP implementation with all three scenarios, drag-drop UI, and scoring engine
