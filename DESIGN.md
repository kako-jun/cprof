# DESIGN.md

cprof — Design System

## 1. Visual Theme & Atmosphere

Minimal dark technical interface. A professional color science tool that presents dense data with precision and clarity. The monospace-only typography and ultra-dark surfaces create a laboratory aesthetic — clinical, focused, and information-dense. The 3D color space viewer is the centerpiece; all UI exists to support it.

Inspirations: scientific instrument UIs, terminal-based data viewers, color grading software.

## 2. Color Palette & Roles

CSS custom properties defined in `globals.css`.

| Variable       | Value     | Usage                                |
| -------------- | --------- | ------------------------------------ |
| `--background` | `#0a0a0a` | Page background                      |
| `--foreground` | `#c8c8c8` | Primary text, interactive highlights |
| `--surface`    | `#111111` | Sidebar, secondary backgrounds       |
| `--surface-2`  | `#1a1a1a` | Tertiary backgrounds, gamut bars     |
| `--surface-3`  | `#222222` | Quaternary backgrounds               |
| `--border`     | `#2a2a2a` | Primary borders, dividers            |
| `--border-2`   | `#333333` | Secondary borders, range track       |
| `--muted`      | `#555555` | Disabled text, checkbox borders      |
| `--text-dim`   | `#666666` | Secondary labels, metadata           |
| `--text-label` | `#888888` | Tertiary text, hints                 |

### Inline Colors (Not Variables)

| Hex       | Usage                          |
| --------- | ------------------------------ |
| `#050505` | 3D canvas background           |
| `#0e0e0e` | Sidebar background             |
| `#1e1e1e` | Border dividers between panels |
| `#2e2e2e` | Default button borders         |
| `#444`    | Hover borders, focus rings     |
| `#aa8800` | Warning text (non-RGB profile) |
| `#1a1500` | Warning background             |
| `#332a00` | Warning border                 |
| `#cc4444` | Error text                     |
| `#1a0a0a` | Error background               |
| `#3a1a1a` | Error border                   |

### Chart Colors

- Wireframe default: white
- Comparison polygon: cyan
- Grid lines: `#333` (stroke 0.5)
- Axes: white (stroke 2)
- Spectral locus: gray dashed

## 3. Typography Rules

### Font Family

| Context | Family                                                                                   |
| ------- | ---------------------------------------------------------------------------------------- |
| All     | `"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, "Courier New", monospace` |

100% monospace. No sans-serif anywhere. Defined in `tailwind.config.ts` as `fontFamily.mono`.

### Type Scale

| Element         | Class/Size       | Notes                            |
| --------------- | ---------------- | -------------------------------- |
| Labels          | `text-[10px]`    | Section headers, stats, metadata |
| Body text       | `text-xs` (12px) | Buttons, inputs, standard UI     |
| Header wordmark | `text-sm` (14px) | "cprof" title                    |

No text larger than 14px. The UI is dense by design.

### Modifiers

- `uppercase` + `tracking-widest` (0.1em) — section headers
- `tracking-[0.2em]` — wordmark
- `.font-mono-data` — custom utility with `font-variant-numeric: tabular-nums` for aligned numbers

## 4. Component Stylings

### Buttons

```
px-2 py-1.5 text-xs font-mono
text-label border border-[#2e2e2e]
hover:border-[#444] hover:text-foreground
transition-colors
disabled:opacity-40
```

### File Upload (Drop Zone)

```
mx-3 mt-3 border border-dashed border-[#2e2e2e]
p-4 text-center cursor-pointer
hover:border-[#444] transition-colors
```

### Checkboxes (Custom CSS)

- Size: 12px x 12px
- Border: `1px solid var(--muted)`
- Checked: background `#555`, white checkmark via `::after` (rotated border trick, `scale(0.8)`)

### Range Sliders (Custom CSS)

- Track: 2px height, `var(--border-2)` background
- Thumb: 10px circle, `#888`, no border

### Select Dropdowns (Custom CSS)

- `appearance: none`
- Custom SVG arrow icon (`fill: #666`)
- Padding-right: 28px for icon space

### Text Inputs

```
px-3 py-2 text-xs font-mono
bg-[#0a0a0a] border border-[#2a2a2a]
text-label
focus:outline-none focus:border-[#444]
```

### Modals

- Overlay: `fixed inset-0 z-50 bg-black bg-opacity-70`
- Container: `bg-[#111] border border-[#2a2a2a] p-6 max-w-md`
- Close: `text-dim hover:text-foreground text-sm`

### Alert Boxes

- Warning: `bg-[#1a1500] border-[#332a00] text-[#aa8800]`
- Error: `bg-[#1a0a0a] border-[#3a1a1a] text-[#cc4444]`
- Info: `bg-[#0e0e0e] border-[#1e1e1e] text-dim`

### Gamut Coverage Bars

- Container: `h-1.5 bg-[#1a1a1a]`
- Fill: grayscale `rgb(20-70, 20-70, 20-70)` based on percentage
- Transition: `all 500ms`

## 5. Layout Principles

### Two-Column Layout

- Sidebar: `w-64` (256px) fixed, `bg-[#0e0e0e]`, scrollable
- Main: `flex-1`, contains 3D canvas + analysis panels
- Header: `px-5 py-3`, border-bottom `#1e1e1e`

### Spacing Scale

| Token       | Value          |
| ----------- | -------------- |
| Compact     | `gap-1` (4px)  |
| Standard    | `gap-2` (8px)  |
| Comfortable | `gap-3` (12px) |
| Large       | `gap-4` (16px) |

### Section Dividers

```
border-t border-[#1e1e1e] mx-3 mt-4
```

### Key Dimensions

- 3D canvas: `flex-1 min-h-[500px]`, `bg-[#050505]`
- Analysis panels: `max-h-[50vh]`, scrollable
- 2D charts: 300x300px SVG
- Scrollbar: 6px width

## 6. Depth & Elevation

### Z-Index

| Layer   | Z-Index | Element        |
| ------- | ------- | -------------- |
| Content | auto    | Main layout    |
| Modals  | 50      | Dialog overlay |

### Shadows

None on standard elements. Dark-on-dark eliminates the need for shadows.

- Modal overlay: `bg-opacity-70` (translucency, not shadow)

### Border Radius

No border radius anywhere. All elements are sharp rectangles. This is a technical tool, not a consumer app.

### Focus Ring (Global)

```css
*:focus-visible {
  outline: 1px solid #555;
  outline-offset: 1px;
}
```

## 7. Do's and Don'ts

### Do

- Use CSS variables for all colors
- Keep all text monospace (JetBrains Mono)
- Use `text-[10px]` for labels and metadata — density is a feature
- Use `tracking-widest` + `uppercase` for section headers
- Use `tabular-nums` for numerical data columns
- Keep borders at 1px, subtle (`#1e1e1e` to `#2e2e2e`)
- Style form controls flat (custom checkbox, slider, select)
- Use `transition-colors` for all hover states

### Don't

- Add sans-serif fonts. Everything is monospace
- Use text larger than 14px
- Add border-radius to any element
- Use colorful accent colors. Warnings are muted yellow (#aa8800), errors are muted red (#cc4444)
- Add box-shadows. Depth comes from background color layering
- Use gradients
- Add decorative elements or illustrations

### Transitions

| Context        | Duration | Notes                         |
| -------------- | -------- | ----------------------------- |
| Hover states   | 200ms    | `transition-colors` default   |
| Gamut bar fill | 500ms    | `transition-all duration-500` |

## 8. Responsive Behavior

### Breakpoints

| Name    | Value  | Layout               |
| ------- | ------ | -------------------- |
| Default | —      | 2D charts: 1 column  |
| md      | 768px  | 2D charts: 2 columns |
| lg      | 1024px | 2D charts: 3 columns |

Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

The sidebar and 3D canvas maintain fixed proportions at all widths.

### Scrollbar

Custom styled: 6px width, flat, `#555` thumb on `#111` track.

## 9. Agent Prompt Guide

### CSS Variable Quick Reference

```
--background:  #0a0a0a   (near-black page)
--foreground:  #c8c8c8   (light gray text)
--surface:     #111111   (sidebar, panels)
--surface-2:   #1a1a1a   (tertiary bg)
--border:      #2a2a2a   (primary borders)
--border-2:    #333333   (secondary borders)
--muted:       #555555   (disabled, checkbox)
--text-dim:    #666666   (secondary labels)
--text-label:  #888888   (tertiary text)
```

### When generating UI for this project

- JetBrains Mono everywhere. No sans-serif. This is non-negotiable
- Text tops out at 14px. 10px and 12px are the workhorses
- No border-radius. Sharp corners on everything
- No shadows. Depth from background color layering (#050505 → #0a0a0a → #111 → #1a1a1a → #222)
- No gradients. Flat solid colors only
- Sidebar is 256px fixed. Main content fills remaining space
- 2D charts are 300x300 SVG with white axes, gray grid, cyan data
- Three.js canvas has ultra-dark #050505 background
- Form controls are custom-styled flat (no browser chrome)
- Warnings use muted yellow (#aa8800), errors use muted red (#cc4444)
- Group hover: use Tailwind `group`/`group-hover:` for label+checkbox combos

### Gray Scale Emotion Reference

- **#c8c8c8 (foreground):** Active, readable, present
- **#888888 (text-label):** Supportive, contextual
- **#666666 (text-dim):** Background detail, metadata
- **#555555 (muted):** Disabled, structural
- **#333333 (border-2):** Infrastructure, barely visible
- **#1e1e1e:** Architectural division
- **#0a0a0a:** The void. Content emerges from here
