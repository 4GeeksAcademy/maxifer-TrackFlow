---
name: Logistics Operations Console
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c3c6d7'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8d90a0'
  outline-variant: '#434655'
  surface-tint: '#b4c5ff'
  primary: '#b4c5ff'
  on-primary: '#002a78'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#0053db'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-md:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  code-dense:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
    letterSpacing: 0.02em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-dense: 0.5rem
  margin: 1.5rem
  margin-sm: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers an industrial, high-precision backoffice interface tailored for real-time logistics management, dispatch routing, and fulfillment tracking. Built on a dark, high-contrast operational aesthetic, the system prioritizes instantaneous legibility, information density, and low visual fatigue during extended shift work. 

The aesthetic is corporate and modern, leaning into technical minimalism: tight data grids, razor-sharp structural delineation, and intentional semantic signaling. Chrome and ornamental treatments are eliminated in favor of functional hierarchy, explicit data grouping, and high-visibility status indicators.

## Colors

The palette is engineered specifically for deep dark mode environments where operational alerts and route statuses require rapid visual parsing without dazzling the operator.

- **Canvas & Structural Layers**: `#0f172a` anchors the primary viewport canvas, while `#111827` elevates cards, sidebars, modular panels, and operational data tables. Subtle architectural borders use `#1e293b` for ambient divisions and `#334155` for high-priority card separators and inputs.
- **Typographic Hierarchy**: Primary operational values, codes, and headers use `#f8fafc` for stark contrast. Secondary metrics, metadata, timestamps, and column headers use `#94a3b8`. Disabled states and subdued indicators rely on `#64748b`.
- **Operational Accent**: `#2563eb` drives active action states, primary navigation markers, and interactive row highlights, supported by an operational light-blue tint (`#38bdf8`) for focused states, links, and selected tracking IDs.
- **Semantic Status Signals**:
  - Positive/Delivered/Confirmed: `#10b981` (emerald-500) paired with low-opacity emerald backing.
  - Warning/In-Transit/Delayed: `#f59e0b` (amber-500) paired with warm amber tint.
  - Critical/Failed/Exception: `#fb7185` (rose-400) for high-urgency stop conditions.

## Typography

Typography relies on Inter across all touchpoints to preserve uniform optical balance and strict character proportioning. 

- **Tabular Figures & Numeric Alignment**: Numerical data (tracking numbers, timestamps, weights, coordinates) must enforce font feature settings `tnum` (tabular figures) and `cv05` to prevent layout shift during live telemetry updates.
- **Labels & Micro-data**: Table column headers and operational badges leverage uppercase or small semi-bold labels with slightly expanded tracking (`+0.04em`) to ensure legibility against dark slate surfaces.
- **Header Scaling**: Given the dense backoffice context, headline scales are constrained. Primary page titles remain compact (`1.75rem` desktop), preventing canvas waste and prioritizing dashboard density.

## Layout & Spacing

The layout model is a flexible, highly compact fluid multi-pane workspace capable of maximizing 1080p, 1440p, and ultra-wide logistics control room screens.

- **Grid Architecture**: Standard 12-column layout for dashboard overview screens, with an alternate full-width edge-to-edge docking model for split-view map and telemetry routing panels.
- **Rhythm**: Compact 4px base increment. Data rows utilize condensed heights (`36px` to `40px`), padding defaults to `space-sm` (8px) or `space-md` (12px), keeping high-volume order lists visible above the fold.
- **Responsiveness & Reflow**:
  - **Desktop (>= 1280px)**: Persistent collapsible left sidebar (64px icon rail to 240px expanded navigation), multi-column logistics flow, parallel side-drawer inspect panels.
  - **Tablet (768px - 1279px)**: Collapsed icon rail, responsive table columns with toggleable metadata fields, 16px section margins.
  - **Mobile (< 768px)**: Stacked operational cards replace multi-cell data tables; filter bars convert into a full-height bottom-sheet filter panel.

## Elevation & Depth

Depth is established primarily through tonal stratification and precise border contours rather than blurred dropshadows, ensuring zero mud in dark viewing environments.

- **Base Layer (Elevation 0)**: `#0f172a` canvas for global backdrops and underlying app scaffolding.
- **Surface Layer (Elevation 1)**: `#111827` containers, data grids, and filter bars, defined by a 1px solid border of `#1e293b`.
- **Floating & Overlay Layer (Elevation 2)**: Popovers, context menus, and active modal sheets utilize `#1e293b` backgrounds bounded by `#334155` strokes. Shadows are strictly functional: a subtle `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.4)` to lift interactive planes away from data density.
- **Focus & Selection**: Outlines do not rely on shadows; they use a crisp 2px solid `#38bdf8` or `#2563eb` offset ring.

## Shapes

The design system enforces a strict, disciplined curvature (`roundedness: 1`). 

- Standard interactive components (buttons, input fields, dropdown toggles, table rows) feature `4px` (`0.25rem`) corner radii.
- Structural panels, modals, and operational card wrappers feature `8px` (`0.5rem`) corner radii.
- Full pills are reserved solely for high-visibility operational status indicators and numeric counter badges to distinguish them immediately from structural rectangular inputs and data cells.

## Components

### Buttons
- **Primary**: `#2563eb` background, `#f8fafc` text, 4px radius, compact padding (8px vertical, 14px horizontal). Hover: `#1d4ed8`. Active: `#1e40af`. Focus: 2px ring `#38bdf8` with 2px offset in `#0f172a`.
- **Secondary / Outline**: Transparent background, 1px border `#334155`, text `#f8fafc`. Hover: `#1e293b` fill, border `#475569`.
- **Destructive / Exception**: Deep `#881337` background with `#fb7185` border and text.

### Status Badges & Chips
- **Geometry**: Compact height (20px to 22px), `rounded-full`, 6px horizontal padding.
- **Success (Delivered / Normal)**: 10% alpha emerald fill (`rgba(16, 185, 129, 0.12)`), 1px solid `rgba(16, 185, 129, 0.3)`, text `#34d399`.
- **Warning (In-Transit / Exception Pending)**: 10% alpha amber fill (`rgba(245, 158, 11, 0.12)`), 1px solid `rgba(245, 158, 11, 0.3)`, text `#fbbf24`.
- **Error (Failed / Route Canceled)**: 10% alpha rose fill (`rgba(251, 113, 133, 0.12)`), 1px solid `rgba(251, 113, 133, 0.3)`, text `#fb7185`.

### Dense Data Tables
- **Headers**: Height 32px, uppercase `label-sm`, background `#0f172a`, border-bottom 1px solid `#334155`, text `#94a3b8`.
- **Rows**: Fixed compact height (38px standard, 32px dense mode), border-bottom 1px solid `#1e293b`. Alternating hover state with `#1e293b` fill. Selected row state displays an `#2563eb` left edge indicator (2px width) with an elevated `#1e293b` tint.
- **Numbers & Monospace**: Tracking codes and manifest serials rendered using `code-dense` typography in `#f8fafc`.

### Form Inputs & Search Fields
- **Container**: Height 36px, background `#0f172a`, border 1px solid `#334155`, text `#f8fafc`, placeholder `#64748b`.
- **Focus**: Border `#38bdf8`, outline 2px solid `rgba(56, 189, 248, 0.2)`.
- **Trailing Add-ons**: Built-in keyboard shortcut hints (e.g., `⌘K`) rendered in `#64748b` on `#1e293b` chip wrappers.

### Checkboxes & Radios
- **Checkboxes**: 16x16px, 3px corner radius, background `#0f172a`, border 1px solid `#475569`. Checked state: `#2563eb` background with white checkmark icon.
- **Radio Buttons**: 16x16px circle, identical border logic. Selected state: `#2563eb` outer stroke with a solid centered `#f8fafc` dot.

### Operational Cards & Metric Tiles
- **Structure**: `#111827` background, 1px solid `#1e293b`, 12px interior padding.
- **KPI Display**: Small muted label (`#94a3b8`) stacked above large numeric output (`#f8fafc`), with right-aligned micro trend pill indicators.