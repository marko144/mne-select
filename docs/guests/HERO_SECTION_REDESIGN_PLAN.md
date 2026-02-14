# Montenegro Select – Hero Section Redesign Plan

**Date**: 2026-02-14  
**Focus**: Hero section – gradients, animation sequence, luxury-modern aesthetic  
**Status**: Planning & Implementation Guide

---

## Executive Summary

This document outlines a systematic approach to redesigning the Montenegro Select hero section with:

1. **Gradient background options** – luxury, non-cliché variations
2. **Coordinated animation sequence** – map outline → image reveal → layout shift → text
3. **Technical implementation** – tools, dependencies, and phased rollout
4. **Quick review workflow** – how to A/B test different options

---

## Part 1: Current State Analysis

### Hero Section (Current)
- **Layout**: Centered, single column, max-width 960px
- **Background**: `bg-navy` with `bg-gradient-to-br from-navy via-navy to-navy-darker opacity-50`
- **Content**: Logo → Headline (3 lines) → Subheadline → Email form
- **Animations**: `animate-fade-in` and `animate-fade-in-up` with staggered delays (200–800ms)

### Map / Coastline Asset
- **File**: `/apps/guests/public/illustrations/montenegro_coastline_vector.svg`
- **Type**: True vector (potrace output) – **animatable** via `stroke-dashoffset`
- **Structure**: Single `<path>` inside `<g>` with transform `translate(0,1536) scale(0.1,-0.1)`
- **ViewBox**: `0 0 2752 1536`
- **Used in**: AboutSection (draw animation on scroll)

### Hero Image
- **File**: `/apps/guests/public/images/porto-montenegro-heroshot-1224x690.avif`
- **Dimensions**: 1224×690 (aspect ~1.77:1)
- **Use**: To be revealed **inside** the map outline bounds

### Design Tokens
- **Navy**: `#0f2a44` (primary), `#071728` (darker)
- **Gold**: `#c2a24d` (accents)
- **Cream**: `#e8e6e1` (text), `rgba(232,230,225,0.7)` (muted)

---

## Part 2: Gradient Background Options

Goal: Luxury, sharp, modern – avoid overused “dark luxury” clichés.

### Option A: Deep Navy with Subtle Gold Glow
```css
background: linear-gradient(
  135deg,
  #0f2a44 0%,
  #0c2238 40%,
  #071728 70%,
  #030914 100%
);
/* Optional: radial gold accent top-right */
background-image: 
  radial-gradient(ellipse 80% 50% at 85% 15%, rgba(194,162,77,0.08) 0%, transparent 50%),
  linear-gradient(...);
```

### Option B: Cool-to-Warm Vertical Gradient
```css
background: linear-gradient(
  180deg,
  #0a1f35 0%,   /* Slightly cooler top */
  #0f2a44 30%,
  #0c2238 60%,
  #071728 100%
);
```

### Option C: Diagonal Luxury (Navy → Dark Teal hint)
```css
background: linear-gradient(
  160deg,
  #0f2a44 0%,
  #0d2640 25%,
  #0a2238 50%,
  #071728 100%
);
/* Hint of teal in mid-range for depth without being obvious */
```

### Option D: Layered Mesh (Premium, more complex)
```css
background: 
  radial-gradient(ellipse 100% 80% at 50% 0%, rgba(15,42,68,0.9) 0%, transparent 50%),
  radial-gradient(ellipse 60% 40% at 20% 80%, rgba(7,23,40,0.95) 0%, transparent 40%),
  linear-gradient(180deg, #0f2a44 0%, #071728 100%);
```

### Option E: Minimal with Edge Glow
```css
background: #0f2a44;
/* CSS pseudo-element or overlay */
box-shadow: inset 0 0 120px rgba(194,162,77,0.03);
/* Or: subtle gradient at bottom edge */
background-image: linear-gradient(
  to top,
  rgba(7,23,40,0.6) 0%,
  transparent 30%
);
```

**Recommendation**: Start with **Option A** or **D** for a premium feel. Use CSS variables so switching is trivial.

---

## Part 3: Animation Sequence – Detailed Design

### Sequence Overview (Desktop)

| Phase | Duration | What Happens |
|-------|----------|--------------|
| **0** | 0ms | Page load – dark background, map outline centered, large, stroke hidden |
| **1** | 0–2.5s | Map outline draws (stroke-dashoffset animation) |
| **2** | 2.5–4s | Image reveals inside map bounds (clip-path or mask) |
| **3** | 4–5.5s | Map+image resize and slide to left half |
| **4** | 5–6.5s | Hero text fades in on right |

### Phase Details

#### Phase 1: Map Outline Draw
- Map SVG centered, ~70–80% of viewport width
- Dark background (navy-darker or gradient)
- Stroke: gold, `stroke-dasharray` / `stroke-dashoffset` animation
- Same technique as AboutSection

#### Phase 2: Image Reveal Inside Map
- **Technique**: Use SVG path as `clip-path` or `mask`
- **Approach A**: Inline SVG with `<clipPath>` + `<image>` – image clipped to path
- **Approach B**: CSS `clip-path: url(#map-clip)` – path must be in DOM
- **Approach C**: SVG `<mask>` – path as mask, image as masked content
- **Reveal**: Animate `clip-path` from fully clipped to full reveal, or use opacity/mask-opacity

**Critical**: The map path is a **coastline** (open path). For clipping we need a **closed** shape. Options:
1. Use the path’s bounding box with a custom reveal (e.g. scale from center)
2. Trace a closed outline (country boundary) if available
3. Use a simplified closed path that approximates Montenegro’s shape

#### Phase 3: Layout Shift
- Map+image container animates:
  - `transform`: scale down + translate left
  - `width`: from ~80vw to ~45% of hero
- Easing: `cubic-bezier(0.25, 0.1, 0.25, 1)` (premium)

#### Phase 4: Text Reveal
- Right column: logo, headline, subheadline, CTA
- Staggered `fade-in-up` (existing pattern)
- Ensure text is hidden until phase 4 starts

### Mobile / Reduced Motion
- **Mobile**: Simplified sequence – map draw + image reveal, then text. Skip layout shift (stack vertically).
- **prefers-reduced-motion**: Skip animation, show final layout immediately.

---

## Part 4: Technical Implementation

### Dependencies

| Tool | Purpose | Required? |
|------|---------|-----------|
| **Framer Motion** | Orchestrated timelines, layout animations | **Recommended** |
| **GSAP** | Alternative – precise control, ScrollTrigger | Optional |
| **CSS + React state** | Phase-based `useState` + `setTimeout` | Possible, more manual |

**Recommendation**: Add **Framer Motion** (`framer-motion`). It fits React, supports orchestration, and respects `prefers-reduced-motion`.

```bash
pnpm add framer-motion --filter guests
```

### SVG Path for Clipping

The current `montenegro_coastline_vector.svg` path is an **open** coastline. For “image inside map” we have two paths:

1. **Use bounding box + custom reveal**: Clip image to a rectangle that matches map bounds, animate a wipe or scale.
2. **Obtain closed path**: Use a Montenegro country outline SVG (e.g. from Natural Earth, Mapbox, or custom). This gives true “image inside country shape”.

**Interim approach**: Use a rounded rectangle or the SVG’s bounding box for the reveal, then refine with a proper closed path later.

### File Structure (Proposed)

```
apps/guests/
├── components/
│   └── sections/
│       ├── HeroSection.tsx           # Main hero (refactored)
│       ├── HeroSectionMapReveal.tsx  # Map + image + animation logic
│       └── HeroSectionText.tsx       # Right-side text block
├── public/
│   └── illustrations/
│       ├── montenegro_coastline_vector.svg  # Existing
│       └── montenegro_outline_closed.svg    # (Optional) Closed path for clip
```

### Animation State Machine (React)

```ts
type HeroPhase = 'idle' | 'map-draw' | 'image-reveal' | 'layout-shift' | 'text-reveal' | 'complete'

// Triggers:
// - idle → map-draw: on mount
// - map-draw → image-reveal: after 2.5s
// - image-reveal → layout-shift: after 1.5s
// - layout-shift → text-reveal: after 1s (overlap ok)
// - text-reveal → complete: after 1s
```

---

## Part 5: Quick Review Workflow

### Option 1: Gradient Switcher (Dev Only)
Add a query param or env var to cycle gradients:

```
?gradient=a|b|c|d|e
```

Render different gradient classes based on param.

### Option 2: Storybook / Component Playground
If Storybook exists, add a Hero story with gradient and animation controls.

### Option 3: Separate Route
Create `/preview/hero` with dropdown to switch:
- Gradient preset
- Animation speed (0.5x, 1x, 2x)
- Skip to phase (for debugging)

### Option 4: CSS Custom Properties
Define gradients as CSS variables, switch via `data-gradient` on `<section>`:

```html
<section data-gradient="a" class="hero">
```

```css
[data-gradient="a"] { --hero-bg: linear-gradient(...); }
[data-gradient="b"] { --hero-bg: linear-gradient(...); }
```

---

## Part 6: Implementation Phases

### Phase 1: Gradients & Layout (Low Risk)
- [ ] Add gradient options to Tailwind/globals.css
- [ ] Implement gradient switcher (data attribute or prop)
- [ ] Refactor hero to two-column layout (map left, text right) for desktop
- [ ] Keep current content, no animation changes yet

### Phase 2: Map + Image Static
- [ ] Add map SVG to hero (centered, large)
- [ ] Add Porto Montenegro image with clip/mask (static)
- [ ] Ensure responsive behavior (mobile: stacked)

### Phase 3: Animation Sequence
- [ ] Add Framer Motion
- [ ] Implement phase state machine
- [ ] Map draw animation
- [ ] Image reveal (clip-path or mask)
- [ ] Layout shift (map left, text right)
- [ ] Text reveal

### Phase 4: Polish
- [ ] `prefers-reduced-motion` handling
- [ ] Mobile simplification
- [ ] Performance (GPU acceleration, will-change)
- [ ] Remove dev-only gradient switcher

---

## Part 7: Hero Text Styling Adjustments

To work with the new layout and animation:

- **Desktop**: Right-aligned or left-aligned within right column; consider slightly larger type
- **Contrast**: Ensure cream/gold on gradient backgrounds passes WCAG
- **Timing**: Text appears only after layout shift, so no overlap with moving map
- **Optional**: Slight parallax or stagger between headline lines for extra polish

---

## Appendix A: SVG Clip-Path Example

```html
<svg width="0" height="0">
  <defs>
    <clipPath id="montenegro-clip">
      <path d="M..." /> <!-- Closed path -->
    </clipPath>
  </defs>
</svg>
<div style="clip-path: url(#montenegro-clip);">
  <img src="/images/porto-montenegro-heroshot-1224x690.avif" alt="" />
</div>
```

---

## Appendix B: Framer Motion Timeline Sketch

```tsx
const sequence = async () => {
  await animate(mapRef.current, { strokeDashoffset: 0 }, { duration: 2.5, ease: 'easeOut' })
  await animate(imageRef.current, { opacity: 1 }, { duration: 1.5 })
  await animate(containerRef.current, { x: '-50%', scale: 0.6 }, { duration: 1.5 })
  await animate(textRef.current, { opacity: 1, y: 0 }, { duration: 0.8 })
}
```

---

## Implementation Status (2026-02-14)

### Completed
- ✅ Gradient presets (a–e) in `globals.css` as CSS variables
- ✅ `HeroSectionAnimated` component with full animation sequence
- ✅ Map outline draw → image reveal (masked) → layout shift → text reveal
- ✅ Porto Montenegro image inside map outline via SVG mask
- ✅ Framer Motion for orchestration
- ✅ `prefers-reduced-motion` support
- ✅ Gradient switcher via `?gradient=a|b|c|d|e`
- ✅ Hero variant switcher: `?hero=classic` for original, default is animated

### Quick Review

1. **Run the app**: `pnpm dev:guests` (or `pnpm dev` from repo root)
2. **Default**: Animated hero with gradient A
3. **Gradient options**: Add `?gradient=b` or `?gradient=c` etc. to URL
4. **Original hero**: Add `?hero=classic` to URL
5. **Combine**: `?hero=animated&gradient=d`

### Files Changed/Added
- `apps/guests/app/globals.css` – gradient variables
- `apps/guests/components/sections/HeroSectionAnimated.tsx` – new component
- `apps/guests/lib/montenegro-coastline-path.ts` – path constant
- `apps/guests/app/page.tsx` – HeroSectionSwitch with query params

---

## Document History

- **v1.0** – 2026-02-14 – Initial plan
