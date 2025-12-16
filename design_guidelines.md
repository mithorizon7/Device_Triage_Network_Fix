# Design Guidelines: Device Triage + Network Fix-It Planner

## Design Approach

**System-Based Approach**: Material Design 3 principles adapted for educational clarity
- Prioritizes functional hierarchy over decorative elements
- Mission-control aesthetic: professional, calm, authoritative
- Information density balanced with breathing room for learning comprehension

## Typography

**Font Stack**: Inter (via Google Fonts CDN)
- Headings: 600 weight, sizes 24px (h1), 18px (h2), 16px (h3)
- Body: 400 weight, 14px for UI elements, 15px for explanatory text
- Code/Technical: 'JetBrains Mono' 400 weight, 13px for IP addresses, device IDs
- Line height: 1.5 for body, 1.2 for headings

## Layout System

**Spacing Primitives**: Use Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4 (cards), p-6 (panels), p-8 (main containers)
- Gaps: gap-4 (card grids), gap-6 (major sections)
- Margins: mb-4 (stacked elements), mb-8 (section separators)

**Grid Structure**:
- Two-pane layout: 40/60 split (device roster left, zones right)
- Responsive breakpoint: Stack to single column below 1024px
- Max-width: 1600px centered container

## Component Library

### Device Cards
- Compact rectangular cards (240px × 80px)
- Device icon (32px) left-aligned with 12px padding
- Device label + IP address stacked, right of icon
- Risk flag badges as small colored pills (top-right corner)
- Subtle shadow: `shadow-sm`, lift on hover: `shadow-md`
- Cursor: grab when hovering, grabbing when dragging

### Zone Drop Targets
- Large rectangular zones (min-height: 400px, full-width within pane)
- Dashed border (2px) in neutral gray when empty
- Solid border with accent color when drag-over state
- Zone label as header (16px semibold)
- Device cards arrange in grid: `grid-cols-2` within zone
- Visual feedback: subtle background color shift on valid drop

### Risk Meter
- Horizontal bar chart (full-width, 80px height)
- Three segmented sections: Exposure (red tones), Credential (amber tones), Hygiene (blue tones)
- Animated width transitions (300ms ease)
- Total score displayed prominently (48px, tabular numbers)
- Score interpretation text below meter: "Low Risk" / "Moderate" / "High" / "Critical"

### Controls Drawer
- Vertical list of toggle switches with labels
- Each control: Icon (24px) + Label + Description (gray, 13px) + Toggle
- Grouped by category with subtle dividers
- Active states clearly indicated with checkmarks and color shifts

### Explain Score Panel
- Accordion-style expandable section below risk meter
- Line items showing: Rule description + Delta value (+/- with color coding)
- Top 8 contributors listed, sorted by absolute impact
- Collapse/expand animation (200ms)

### Scenario Selector
- Dropdown at top-left (min-width: 280px)
- Shows scenario title + brief description on expand
- Current scenario indicated with checkmark icon

## Icons

**Library**: Material Icons (via CDN)
- Device types: `laptop`, `phone_iphone`, `videocam`, `speaker`, `print`, `router`, `tv`, `thermostat`, `devices_other`
- UI actions: `drag_indicator`, `info`, `check_circle`, `warning`, `help_outline`
- Consistent 24px size throughout, scale to 32px for device cards

## Accessibility

- Keyboard navigation: Tab through all interactive elements
- ARIA labels: All drag targets, controls, zone assignments
- Alternative list mode: Dropdown menus for zone assignment (accessible fallback)
- Screen reader announcements: Score changes, successful drops, control toggles
- Focus indicators: 2px solid outline with 2px offset
- Color independence: Icons + text labels (never color alone)

## Animations

**Minimal and purposeful only**:
- Card snap-to-zone: 250ms ease-out translation
- Risk meter updates: 300ms ease-in-out width transition  
- Control toggle: 150ms ease switch animation
- Zone highlight on drag-over: instant (no animation)
- Explain panel expand/collapse: 200ms height transition

## Images

**No hero images or decorative graphics**
- This is a utility application focused on function
- Device iconography uses icon fonts only
- Network diagrams are CSS-rendered shapes if needed for explanation panels

## Visual Hierarchy

**Three-level information structure**:
1. **Primary**: Risk meter + total score (immediate attention)
2. **Secondary**: Device placement in zones (learning workspace)
3. **Tertiary**: Controls drawer, scenario selector, explain panel (supporting context)

**Contrast Strategy**:
- High contrast for interactive elements (buttons, toggles, draggable cards)
- Medium contrast for zone boundaries and static labels  
- Low contrast for secondary metadata (IPs, device IDs)