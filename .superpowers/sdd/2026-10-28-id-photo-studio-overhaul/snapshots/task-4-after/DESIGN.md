---
name: ID Photo Studio
description: A privacy-first, print-precise ID photo tool rendered as a Bauhaus foundation-course workshop.
colors:
  ink: "#17150f"
  paper: "#ffffff"
  active: "#d64533"
  structure: "#2b5aa7"
  alert: "#f0b429"
typography:
  display:
    fontFamily: "Jost, 'Century Gothic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "4.5rem"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Jost, 'Century Gothic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Jost, 'Century Gothic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Jost, 'Century Gothic', ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
rounded:
  none: "0px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "40px"
  xl: "56px"
components:
  button-primary:
    backgroundColor: "{colors.active}"
    textColor: "#ffffff"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "8px 16px"
  input-text:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
---

# Design System: ID Photo Studio

## Overview

**Creative North Star: "The Foundation-Course Workshop"**

The page is a Bauhaus foundation-course worktable set in type: a white ground ruled with a faint baseline grid, near-black ink for every word and hairline, and the three primaries rationed by role so color always means something. Red is a circle and means *the active state*; blue is a square and means *structure*; yellow is a triangle and means *attention*. Nothing is rounded, nothing is decorated — the composition (frame, circle, chin line, triangle) is the ornament, and it doubles as the product's actual crop guide.

The single-case voice (everything lowercase, Bayer-style geometric sans) keeps the page feeling like a printed course sheet, not an app. Depth is almost entirely refused: panels are flat white rectangles bound by 1px ink borders; the one shadow in the system belongs to the print preview, because it depicts a physical print lying on the table.

**Key Characteristics:**
- White worktable ground with a visible 28px baseline grid
- Primaries rationed by role (circle/square/triangle = active/structure/attention)
- Single-case geometric sans (Jost), lowercase everywhere
- Sharp corners only (0px radius system-wide)
- Flat panels bound by ink hairlines; one justified shadow on the print mini
- One authored motion: straight-line translation with honest easing

## Colors

The palette is a Bauhaus ration list: neutrals carry all structure and text; each primary has exactly one job.

### Primary
- **Workshop Red** (#d64533): the active state only — primary buttons, the selected size chip, the zoom thumb, the "on" toggle, the reset-crop link, and the head-position circle in the crop guide. It never decorates.

### Secondary
- **Structure Blue** (#2b5aa7): structure only — the crop frame's outer border, the empty frame's composition square and square grid, and the text-selection highlight. It never marks state.

### Tertiary
- **Caution Yellow** (#f0b429): attention only — filled triangle marks beside the privacy note and error messages, and the small triangle in the empty-state composition. Never used as a surface color.

### Neutral
- **Ink** (#17150f): all text, hairline borders (solid or at 15–40% opacity for subordinate lines), the wordmark square, hover fills, and disabled surfaces.
- **Paper** (#ffffff): the page ground and every panel; the name strip and print preview ground.

### Named Rules
**The Rationed Primaries Rule.** A primary color appears only in its role: red = active, blue = structure, yellow = attention. If a primary is doing a second job, the design is wrong.

## Typography

**Display Font:** Jost (with Century Gothic, ui-sans-serif fallback)
**Body Font:** Jost (same family; the system is single-voice)

**Character:** One geometric sans, one case. The single-case alphabet is the world's voice: headings, body, labels, and buttons are all lowercase; only the printed name strip (the product artifact) is uppercase.

### Hierarchy
- **Display** (600, 4.5rem/72px desktop, 3rem/48px mobile, line-height 1.02, tracking −0.03em): the single page headline.
- **Title** (600, 1.5rem/24px, tracking −0.02em): panel headings ("set up your photo").
- **Body** (400, 1rem–1.125rem, line-height 1.75, max 65–75ch): the promise paragraph and helper text.
- **Label** (600, 0.75–0.875rem, lowercase): control labels, chips, footer notes.

### Named Rules
**The Single Case Rule.** Page text is lowercase everywhere; uppercase is reserved for the name strip printed onto the exported photo.

## Layout

One worktable: a max-width 80rem container, a full-width ink-bordered header band, a display headline block (max 48rem), then a two-column grid (fluid editor panel left, 380px-minimum setup rail right) that stacks below 1024px. Rhythm is a 28px baseline: the ground grid is 28px, section blocks step 28/40/56px. The editor frame is aspect-square, capped at 640px, centered in its panel.

## Elevation & Depth

Flat by doctrine. Panels are white rectangles with 1px solid ink borders; separation comes from hairlines and the baseline grid, not shadows. The single shadow in the system belongs to the print preview mini (`0 10px 24px rgba(23,21,15,0.14)`), justified because it depicts a physical print.

### Shadow Vocabulary
- **print-on-table** (`0 10px 24px rgba(23,21,15,0.14)`): only on the mini print preview card.

### Named Rules
**The Flat Table Rule.** Depth is reserved for depictions of physical objects; interface surfaces never cast shadows.

## Shapes

Zero radius everywhere — squares, straight lines, right angles. The only curves in the system are semantic: the red circle (active/head position) and the yellow triangle (attention). Borders are 1px ink for panels and subordinate rules, 2px ink or blue for the crop frame. The zoom slider is a 2px ink track with a red circle thumb.

## Components

### Buttons
- **Shape:** square (0px), no radius
- **Primary:** Workshop Red fill, white text, 14px/20px padding, icon + lowercase label; hover deepens to #b93a2a; disabled renders ink at 15% fill with 40% ink text
- **Secondary:** 1px ink border on white, ink text; hover inverts to ink fill with white text
- **Focus:** 2px ink outline, 2px offset (global)

### Chips (size selector)
- **Style:** 1px border, ink/30 when idle with 75% ink text
- **State:** selected chip is red fill with white text; hover sharpens the border to full ink

### Inputs / Fields
- **Style:** 1px ink/30 border on white, 12px/16px padding, semibold value text, red caret
- **Focus:** border hardens to ink (no glow)
- **Disabled:** n/a (no disabled inputs shipped)

### Toggle
- **Style:** 20px×40px square track (square knob, square corners); off = ink/20, on = red; knob white with a soft 1-step shadow

### Crop Frame (signature component)
A 2px Structure Blue square frame holding the composition: red circle for head position, 1px ink chin line, yellow triangle accent in the empty state. When empty it shows the blueprint composition (square grid, circle, chin line, triangle) as a clickable CTA; when filled, the photo slides in over it with straight-line translation (500ms cubic-bezier(0.22,1,0.36,1)) and the guides overlay on top.

### Navigation
A single header band: ink square + red circle wordmark, lowercase wordmark text, privacy promise right-aligned (hidden under 640px). 1px ink rule below.

## Print Sheet

The 4-up sheet is the product's print artifact: a single PNG sized to the chosen paper at the chosen dpi, carrying four identical photos and nothing else.

- **Format:** 4 copies of the photo in a 2×2 grid, with even 3-way gaps on both axes (two gutters plus two margins). Gap-midline cross cut marks only: stroke width `max(1, dpi/100)` px, arm length `0.06 in`, ink at 55% opacity. No other marks, no labels, no registration targets.
- **Preview vs. export:** `PREVIEW_DPI = 150`. The preview runs the same render functions at the capped 150 dpi so a 600 dpi A4 sheet never re-renders per keystroke; export runs them at the chosen dpi (300 or 600).
- **Resolution:** export at 300 or 600 dpi. Quality path is a stepped halving downscale with high image smoothing plus a slight contrast sharpen.
- **Sharpening shortcut:** there is no true unsharp mask — only the slight contrast sharpen above. Upgrade to a real unsharp mask if print samples come back soft.

## Do's and Don'ts

### Do:
- **Do** keep every corner square (0px); curves are reserved for the red circle.
- **Do** spend red only on active states and blue only on structure.
- **Do** mark attention with the yellow triangle icon + ink text (yellow is never a text or surface color on white).
- **Do** theme browser chrome with the world: selection = Structure Blue fill/white text, red caret, thin square scrollbar thumb, ink focus outlines.
- **Do** keep all page text lowercase; uppercase belongs to the printed name strip only.

### Don't:
- **Don't** add a second accent color or a gradient — the three primaries are the whole voice.
- **Don't** round corners, glass, or blur; the world is flat print.
- **Don't** put a hard offset (neobrutalist) shadow on interface surfaces; the one soft print shadow is not a general device.
- **Don't** use a different display face or reintroduce sentence case in headings.
