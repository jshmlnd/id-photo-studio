---
name: ID Photo Studio
description: A private, print-precise ID photo tool finished as a dark cult-ui workbench.
colors:
  background: "#0a0a0a"
  foreground: "#f5f5f5"
  card: "#171717"
  secondary: "#1f1f1f"
  muted: "#262626"
  muted-foreground: "#a3a3a3"
  border: "#2a2a2a"
  primary: "#f5f5f5"
  primary-foreground: "#0a0a0a"
  accent: "#6366f1"
  accent-foreground: "#ffffff"
  ring: "#818cf8"
  warning: "#fbbf24"
  destructive: "#f87171"
  print-paper: "#ffffff"
  print-ink: "#17150f"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.11
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
  hint:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.67
    fontFeature: "tnum"
rounded:
  print: "3px"
  button-sm: "6px"
  control: "10px"
  input: "12px"
  segmented: "14px"
  stage: "16px"
  dock: "18px"
  card: "20px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "10px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  button-minimal:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.hint}"
    rounded: "{rounded.button-sm}"
    padding: "4px 16px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.card}"
    padding: "24px"
  segmented:
    backgroundColor: "{colors.background}"
    textColor: "{colors.muted-foreground}"
    rounded: "{rounded.segmented}"
    padding: "4px"
  segmented-option-on:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.accent-foreground}"
    rounded: "{rounded.control}"
    padding: "10px 12px"
  switch-on:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    width: "44px"
    height: "24px"
  input:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.input}"
    padding: "12px 16px"
---

# Design System: ID Photo Studio

## Overview

**Creative North Star: "The Quiet Darkroom Bench"**

A dark, dense, single-purpose tool at cult-ui showcase finish. The page is the editor: a slim header, a short headline, then two machined cards (crop stage left, print settings right) on a near-black ground. Surfaces are built from stacked hairline borders and soft gradients rather than color, so the portrait, which is the only colorful thing on screen, carries the eye.

The world is dark-only. `.dark` sits on `<html>` and the cult-ui components key their look off it; there is no light theme to maintain. One indigo accent does all the signalling, the white texture button is the single call to action, and every measurement reads in Geist Mono with tabular figures. It refuses both the light government-form look and the neon-glow AI-tool look.

**Key Characteristics:**
- Near-black ground (#0a0a0a) with layered texture cards of nested hairline borders.
- One indigo accent for selection, focus, the crop guide, the switch-on state and the dropzone rim.
- White texture primary button as the one call to action.
- Geist for all text, Geist Mono only for measurements.
- Recessed wells for inputs and raised gradient bubbles for selected state.
- One authored motion: the portrait settles from blur to sharp.

## Colors

A neutral grayscale ramp with a single cool indigo voice and an amber warning; color lives in the photo, not the chrome.

### Primary
- **Bench White** (`primary`): the texture primary button face (a near-white top-to-bottom gradient, neutral-200 to neutral-50) with Bench Black text. Used once per screen, for Download.

### Secondary
- **Darkroom Indigo** (`accent`): the switch-on track, text selection fill, and the base of the dropzone rim trail.
- **Indigo Ring** (`ring`): focus outlines (2px, 2px offset), input caret, focused input border at 60%, and the face oval of the crop guide. The lighter indigo-300 (#a5b4fc) tints the header's privacy shield icon.

### Tertiary
- **Signal Amber** (`warning`): the error callout only: icon at full strength, border at 20%, fill at 6%, text in amber-100.

### Neutral
- **Bench Black** (`background`): page ground, recessed wells, slider track.
- **Card Graphite** (`card`) to **Secondary Graphite** (`secondary`): the texture card's inner gradient (card at 70% to secondary at 50%).
- **Muted Graphite** (`muted`): unselected toggles and minimal button bodies.
- **Hairline** (`border`): base border tone; most dividers are `white/6%` over the ground.
- **Ash** (`muted-foreground`): descriptions, hints, mono readouts.
- **Paper White** (`foreground`): headings and labels (neutral-50 to neutral-100 in use).
- **Print Paper / Print Ink** (`print-paper`, `print-ink`): the exported PNG only: white ground and warm-black name-strip text and cut guides. Never used in the interface.

### Named Rules
**The One Indigo Rule.** Indigo means "selected, focused or aimed". It never fills a card, a heading or a call to action; if something indigo is not interactive state or the crop guide, it is wrong.

**The Color Is The Photo Rule.** The chrome stays grayscale so the portrait is the only saturated object in the viewport.

## Typography

**Display Font:** Geist (with ui-sans-serif, system-ui)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono (with ui-monospace, SFMono-Regular)

**Character:** One neutral grotesk across every role, weighted 400 to 600, tightened only at display size; the mono is a measuring instrument, not a voice.

### Hierarchy
- **Display** (600, 1.875rem mobile to 2.25rem from 640px, tracking -0.03em, balanced): the single page headline.
- **Title** (600, 1rem): card titles ("Photo", "Print settings"). The wordmark uses 15px semibold with tight tracking.
- **Body** (400, 1rem, 1.75 line-height): the one-line promise under the headline, max ~56rem.
- **Label** (500, 0.875rem): field labels, segmented options, preview caption.
- **Hint** (400, 0.75rem): field hints and card descriptions in Ash.
- **Mono** (400, 0.75rem, tabular): pixel dimensions, dpi, zoom percent, character count.

### Named Rules
**The Mono Measures Rule.** Geist Mono appears only where a number is a measurement (px, dpi, %, n/40). Prose and labels never use it.

## Layout

A centered container (max 1280px) with 16px side gutters, 32px from 640px. Header is 64px tall, bordered below with a white/6% hairline; footer mirrors it above.

Below 1024px everything stacks in one column. From 1024px the main area becomes a two-column grid: a fluid crop-stage card and a fixed 400px settings rail, 20px apart, top-aligned.

The crop stage is a square capped to `min(620px, max(320px, 100svh - 380px))` so stage and zoom row fit the first laptop viewport. Inside the rail, fields stack at 20px; label to control is 10px. The preview and Download button sit in a sticky dock pinned 12px above the viewport bottom while the rail scrolls; `scroll-padding-bottom: 15rem` keeps keyboard focus clear of it. The page minimum width is 320px.

## Elevation & Depth

Depth is built from layered hairlines and soft, downward-only shadows on a dark ground; nothing glows at rest. Three registers: **raised** (cards, selected bubbles, slider thumb, logo tile, all gradient-lit from above with a 1px top inner highlight), **recessed** (wells: inset dark shadow plus a 1px light bottom lip), and **lifted** (the white print preview and the sticky dock's upward shadow).

### Shadow Vocabulary
- **Well** (`inset 0 1px 3px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.05)`): segmented tracks, inputs, the crop stage, the preview tray.
- **Raised bubble** (`inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.5)`): selected segment, logo tile.
- **Thumb** (`0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(0,0,0,0.15)`): slider and switch knobs on a white-to-neutral-200 gradient.
- **Print lift** (`0 10px 24px rgba(0,0,0,0.6)`): the white preview canvas, so it reads as paper.
- **Dock** (`0 -10px 24px rgba(10,10,10,0.55)`): the sticky preview and Download group, casting upward over scrolled content.

### Named Rules
**The Soft Light Rule.** All shadows are blurred and vertical, lit from above. No hard offset shadows, no colored glows at rest; the indigo rim on the dropzone appears only while the dropzone is hovered, focused or dragged over.

## Shapes

Rounded, machined corners from 10px to 20px, always concentric: the texture card steps its radius down 1px per nested border (20px outer to 16px inner). Wells are rounder than what sits in them (segmented track 14px around 10px options; dock 18px around a 16px tray). Pills (9999px) are reserved for the switch, slider and scrollbar. The print preview keeps a near-square 3px corner because it represents paper. The crop guide is the only geometry on the stage: an inset 8% frame, a face oval, and a chin line.

## Components

### Buttons
Tactile and machined: cult-ui texture buttons, an outer bevel ring around a gradient face.
- **Shape:** outer 12px / inner 10px (large); outer 6px / inner 4px (small).
- **Primary:** Bench White gradient face, 2px black outer ring, black text at 80%, 600 weight, download icon. Full width at the foot of the dock. Disabled at 40% opacity with a not-allowed cursor.
- **Minimal:** graphite face (neutral-800 to neutral-700/50) inside a neutral-600/80 ring, 12px text with a 14px icon. Used for Replace and Reset.
- **Hover / Focus:** faces lighten one step over 300ms ease-in-out; focus is the global 2px Indigo Ring outline.

### Segmented control
- **Style:** a Well track (14px radius, 4px padding) holding equal-width options.
- **State:** unselected options are Ash text, brightening on hover; the selected option gets a raised neutral-700 to neutral-800 bubble with a white/10% border and white text. The bubble slides between options on a spring (bounce 0.19, 0.4s). Exposed as `aria-pressed` buttons in a labelled group.

### Switch
- **Style:** 44 x 24px pill; off is a recessed neutral-800 well, on is Darkroom Indigo with a light inset. White gradient knob slides 20px over 200ms ease-out.

### Cards / Containers
- **Corner Style:** 20px outer, stepping to 16px.
- **Background:** card-to-secondary gradient inside four nested hairline borders (Hairline at 30%, then neutral-900/80, neutral-950, neutral-900/70, neutral-700/50).
- **Shadow Strategy:** none outside; depth is the nested borders.
- **Internal Padding:** 20px, 24px from 640px; headers carry title + description, separated sections use the texture separator (a black top / neutral-700 bottom double hairline).

### Inputs / Fields
- **Style:** Well background, white/6% border, 12px radius, 12px 16px padding, 15px medium text with wide tracking; the name field uppercases as you type and shows a mono n/40 counter.
- **Focus:** border shifts to Indigo Ring at 60%, plus the global focus outline.
- **Zoom slider:** 6px recessed track, 18px raised white thumb, `ew-resize` cursor; the row dims to 40% until a photo exists.

### Navigation
- **Style:** a 64px header with the wordmark (raised 36px logo tile with the scan-face icon, then 15px semibold name) and a privacy note in Ash with an indigo-300 shield; the note shortens to "On-device" below 640px. No other navigation.

### Crop stage (signature)
A square Well (16px radius) holding the portrait. Empty, it hosts the Halo dropzone inset 8px: a card-gradient panel whose rim trail glows Darkroom Indigo while hovered, focused or dragged over. Loaded, the portrait plays the **settle** entrance (opacity 0, blur 14px, scale 1.06 to sharp over 0.7s, `cubic-bezier(0.16, 1, 0.3, 1)`; removed under reduced motion), and the crop guide overlays it: a white/70% frame inset 8%, an Indigo Ring face oval, and a white/70% chin line, each with a dark hairline so it reads on light and dark photos. Drag or arrow keys (2%, 6% with Shift) reposition.

### Preview dock (signature)
A sticky #1b1b1b dock holding a Well tray with the live white print preview and its readout (caption, then mono `W x H px` / `PNG at N dpi`), followed by the Download button. The pixel figures are RollingNumber digits that spring (mass 0.8, stiffness 75, damping 15) to new values when size, format, paper or dpi changes. Empty, the tray shows a dashed white/15% placeholder.

### Print sheet (product output)
The exported PNG is product truth, rendered by the same functions for preview and export.
- **Single photo:** a square of `size x dpi` px on Print Paper. With the name strip on, the bottom 16% is a white band with the name centered in 700-weight Arial at half the band height, Print Ink, fitted to 92% width.
- **4-up sheet:** four identical photos packed 2 x 2 from the page's top-left: 0.2in (5mm) margin, 0.08in (~2mm) cut gap. Cut guides are hairlines along the two gap midlines spanning the block, inside the white gap channels only: stroke `max(1, round(dpi / 100))` px, Print Ink at 55%. No other marks or labels. Paper is A4 (8.27 x 11.69in) or US Letter (8.5 x 11in).
- **Preview vs. export:** `PREVIEW_DPI = 150`; the on-screen preview renders at that capped dpi so a 600 dpi A4 sheet never re-renders per keystroke. Export renders at the chosen 300 or 600 dpi.
- **Quality path:** stepped halving downscale with high-quality smoothing, then a slight contrast sharpen (`contrast(103.5%) saturate(104%)`). This is a shortcut: there is no true unsharp mask; upgrade if print samples come back soft.

## Do's and Don'ts

### Do:
- **Do** keep the ground at Bench Black (#0a0a0a) and build depth from nested hairlines, wells and raised gradients.
- **Do** spend indigo only on selection, focus, the crop guide, the switch-on state and the dropzone rim.
- **Do** keep the white texture primary button as the one call to action per screen.
- **Do** set every measurement in Geist Mono with tabular figures.
- **Do** keep radii concentric: an outer container is rounder than what it holds.
- **Do** honor reduced motion: the settle entrance is removed, never shortened.

### Don't:
- **Don't** add a light theme or a second accent hue; amber is for warnings only.
- **Don't** use hard offset shadows or colored glows at rest; the indigo rim exists only while the dropzone is hovered, focused or dragged over.
- **Don't** put Geist Mono on prose, labels or headings.
- **Don't** use Print Ink or Print Paper in the interface; they belong to the exported PNG.
- **Don't** add authored motion beyond the settle entrance, the segmented bubble and the rolling readout.
