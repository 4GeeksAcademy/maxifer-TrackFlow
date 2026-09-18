---
name: Executive Logistics Telemetry
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3e4943'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6e7a73'
  outline-variant: '#bdc9c1'
  surface-tint: '#006c4e'
  primary: '#005d42'
  on-primary: '#ffffff'
  primary-container: '#047857'
  on-primary-container: '#9ffdd3'
  inverse-primary: '#7bd8b1'
  secondary: '#006398'
  on-secondary: '#ffffff'
  secondary-container: '#5bb8fe'
  on-secondary-container: '#00476e'
  tertiary: '#7d4200'
  on-tertiary: '#ffffff'
  tertiary-container: '#a05600'
  on-tertiary-container: '#ffe5d3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#97f5cc'
  primary-fixed-dim: '#7bd8b1'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#00513a'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Manrope
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.005em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-xs:
    fontFamily: Hanken Grotesk
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system establishes a high-precision, executive-grade operational console. Tailored for mission-critical logistics tracking, fleet orchestrations, and backoffice telemetry, the system blends functional density with refined restraint. The aesthetic language merges Modern Corporate utility with subtle Swiss-inspired precision: unyielding clarity, exacting spatial balance, and a commanding visual hierarchy designed to alleviate cognitive fatigue during extended operational monitoring.

Interactions evoke an atmosphere of deterministic control, institutional reliability, and effortless velocity. Surfaces are rendered with structural clarity, deploying high-contrast typography, crisp containment lines, and deep emerald accents that indicate nominal system states and decisive call-to-actions.

## Colors

The palette establishes high semantic contrast across telemetry streams:

- **Primary (`#047857` / `#059669`):** Deep executive emerald. Used for primary execution targets, validated operational states, confirmed routing paths, and key key-performance indicators.
- **Secondary (`#0284c7`):** Precision technical cerulean. Dedicated to informational diagnostics, link pivots, contextual flyouts, and active telemetry filters.
- **Tertiary / Warning (`#d97706`):** Balanced amber. Reserved for transit delays, telemetry timeouts, pending human reviews, and threshold warnings.
- **Critical / Error (`#e11d48`):** High-alert rose. Applied strictly to exception states, routing failures, stalled dispatches, and emergency intervention triggers.
- **Neutral Core (`#0f172a`):** Deep cool slate. Supplies authoritative optical mass for primary data points and headings, cascading down to `#64748b` for descriptive meta-labels and `#94a3b8` for passive scaffolding.
- **Canvas & Containers:** Base canvas sits on `#f8fafc`, nesting work surfaces on `#ffffff` with structural dividers fixed at `#e2e8f0`.

## Typography

The typographic hierarchy coordinates structural geometric headers via Manrope with the dense, horizontal scanning performance of Hanken Grotesk. 

- **Headlines & Display:** Manrope delivers calibrated geometric letterforms with optical kerning for summaries, metric indicators, and section anchors. It provides an immediate executive cadence without sacrificing screen real estate.
- **Body & Data Dense Worksurfaces:** Hanken Grotesk provides a uniform rhythm for dense payload tables, log lines, route lists, and form sets. Numeric data points must enforce tabular figures (`font-variant-numeric: tabular-nums`) across all grid matrices to ensure immediate column comparison.

## Layout & Spacing

The operational interface is architected around a dense, 12-column fluid grid system engineered for real-time tracking workspaces:

- **Desktop (1280px+):** 12 columns with dynamic full-bleed operational views, fixed 1.5rem (`gutter-lg`) gutters, and structured 2rem (`margin-lg`) canvas bounds. Secondary filter toolbars and command sidebars lock to structural widths (280px to 360px), allowing telemetry panels to scale responsively.
- **Tablet (768px - 1279px):** 8-column layout. Sidebars collapse to icon bars or layered drawer overlays. Gutter drops to 1.5rem (`gutter-md`) with 1.5rem margins.
- **Mobile (< 768px):** 4 columns. Gutter and margin scale down to 1rem. Data grids transition into linear tracking cards with vertical operational feeds.

Element spacing strictly obeys an 8pt conceptual baseline with 4pt micro-adjustments (`space-xs` to `space-xl`) for micro-labels, inline metric badges, and operational action groups.

## Elevation & Depth

Visual hierarchy leverages crisp boundary containment complemented by soft, diffused slate-tinted ambient shadows. The interface avoids dramatic theatrical elevations in favor of clean separation optimized for multi-window backoffice workflows:

- **Level 0 (Base Canvas):** Background tone `#f8fafc`. Completely flat with no shadow. Houses low-priority systemic layout infrastructure.
- **Level 1 (Card & Module Layer):** Pure white `#ffffff` surface, bounded by a continuous 1px stroke of `#e2e8f0`. Shadow is light and ambient: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Hover Targets & Active Workspaces):** Applied to active row interactions, open filter chips, and selected tracking cards: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Flyouts, Popovers & Contextual Telemetry):** Elevated operational actions, date range pickers, and context menus: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)` combined with a 1px `#cbd5e1` edge definition.
- **Level 4 (Modal Overlays & Alert Interrupts):** System diagnostics and critical override modals: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` over a `#0f172a` backdrop opacity at 35%.

## Shapes

The interface implements a refined `roundedness: 2` geometry, anchoring components with an exact balance of modern software approachability and industrial backoffice rigor:

- **Base Radius (`0.5rem` / `8px`):** Standard surface containment for operational cards, data grids, modal viewports, input containers, and large action buttons.
- **Inner Micro Radius (`0.375rem` / `6px`):** Inner elements such as table badges, chip containers, and nested segment controls inherit an optical step down to preserve concentric harmony inside parent cards.
- **Large Radius (`1rem` / `16px`):** Used for elevated flyout panels and global dashboard telemetry widgets.
- **Pill Variant (`9999px`):** Reserved exclusively for dynamic status pips, operational tags (e.g., "In-Transit", "Departed"), and numeric notification count indicators.

## Components

### Buttons
- **Primary:** Filled `#047857` background with `#ffffff` text (Manrope, 600). Hover transitions to `#059669`; active down-state settles on `#065f46`. Focus state generates a 2px offset ring in `#047857`.
- **Secondary:** Surface `#ffffff` with a 1px boundary of `#cbd5e1`, typography in `#0f172a`. Hover applies `#f1f5f9` with border shift to `#94a3b8`.
- **Ghost/Tertiary:** No background stroke, `#64748b` text; hover reveals `#f1f5f9` with `#0f172a` text.

### Chips & Badges
- **Status Badges:** Compact horizontal units with a 6px status dot. Emerald (`#ecfdf5` background, `#047857` text), Warning (`#fffbeb` background, `#b45309` text), Error (`#fff1f2` background, `#be123c` text), Info (`#f0f9ff` background, `#0369a1` text).
- **Filter Chips:** Light slate surface `#f1f5f9` with `#475569` text, transitioning on selection to a `#047857` surface with pure white text and integrated dismiss icons.

### Form Inputs & Selectors
- **Input Fields:** `#ffffff` surface, 1px border in `#cbd5e1`, 0.5rem border radius. Text at `0.875rem` `#0f172a` with placeholder text in `#94a3b8`.
- **Active Focus:** Focus shifts border color to `#047857` with an exterior ring `box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.15)`.

### Lists & Data Tables
- **Telemetry Rows:** Alternating hover highlight using `#f8fafc`. Borders between rows strictly locked to 1px `#f1f5f9`. 
- **Headers:** Crisp uppercase micro-labels (Hanken Grotesk 700, `0.6875rem`, letter spacing 0.04em) in `#64748b` over `#f8fafc` background with a solid `#e2e8f0` bottom rule.

### Checkboxes & Radios
- **Selection Units:** 16px square (checkbox) or circle (radio) with `#cbd5e1` outline. On selection, background transitions to `#047857` with crisp white check/pip geometry.

### Cards & Telemetry Containers
- Flat pure white canvas (`#ffffff`), bounded by 1px `#e2e8f0` stroke, 0.5rem corner radius, displaying primary telemetry metrics in Manrope bold accompanied by secondary trend indicators.