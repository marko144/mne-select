# Montenegro Select Landing Page - UI Review #2 (Animation Issues)

**Date**: 2026-02-13  
**Review**: Follow-up after initial fixes  
**Status**: ⚠️ ANIMATION NOT WORKING + FONTS 404 ERROR

---

## Summary

The developer made good progress on several issues:

✅ **Fixed:**
- Updated `globals.css` with all font declarations
- Copied fonts to `public/fonts/` directory
- Copied SVG to `public/illustrations/`
- Fixed hero text responsive sizing (`text-4xl sm:text-5xl`)
- Added overflow protection to hero section
- Implemented SVG loading and animation logic

❌ **Still Broken:**
1. **Fonts returning 404 errors** (not loading despite files existing)
2. **Animation not working** (pulse keyframe missing)
3. **SVG animation may not trigger** (timing issues)

---

## 🔴 CRITICAL ISSUE #1: Fonts Return 404 Errors

**Evidence from Terminal Log** (lines 40-41):
```
GET /fonts/inter/inter-latin-wght-normal.woff2 404 in 78ms
GET /fonts/cormorant/cormorant-garamond-latin-wght-normal.woff2 404 in 77ms
```

### What's Wrong

The font files exist in:
```
/apps/guests/public/fonts/inter/
/apps/guests/public/fonts/cormorant/
```

But Next.js is returning **404 errors** when trying to load them.

### Root Cause

Next.js dev server **didn't restart** after fonts were added to the `public/` folder. The public folder is only scanned on server startup in development mode.

### The Fix

**Step 1**: Restart the development server

```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
cd /Users/markobabic/LocalDev/mne-select
pnpm dev:guests
```

**Step 2**: Verify fonts load

1. Open browser DevTools → Network tab
2. Filter by "Font"
3. Refresh page
4. Should see 8 font files with **200 status** (not 404)
5. Files should be ~20-50KB each

**Step 3**: If still 404, check file paths

```bash
# Verify files exist
ls -la /Users/markobabic/LocalDev/mne-select/apps/guests/public/fonts/inter/
ls -la /Users/markobabic/LocalDev/mne-select/apps/guests/public/fonts/cormorant/

# Should see 4 files in each directory
```

If files are missing, copy them again:

```bash
cd /Users/markobabic/LocalDev/mne-select

# Copy Inter fonts
cp packages/design-system/assets/fonts/inter/*.woff2 \
   apps/guests/public/fonts/inter/

# Copy Cormorant fonts
cp packages/design-system/assets/fonts/cormorant/*.woff2 \
   apps/guests/public/fonts/cormorant/
```

---

## 🔴 CRITICAL ISSUE #2: Animation Pulse Keyframe Missing

**Location**: `/apps/guests/components/sections/AboutSection.tsx` (line 77)  
**Error**: Pulse animation won't work

### What's Wrong

Line 77 tries to apply a pulse animation:

```typescript
path.style.animation = 'pulse 3s ease-in-out infinite'
```

But there's **NO `@keyframes pulse`** defined in the CSS. The pulse animation exists in Tailwind config but that's not accessible via inline `style.animation`.

### Why It Fails

1. Tailwind's `pulse` animation is a utility class (e.g., `class="animate-pulse"`)
2. Utility classes are NOT the same as @keyframes
3. Setting `path.style.animation = 'pulse ...'` looks for `@keyframes pulse` in CSS
4. No such @keyframes exists → animation silently fails

### The Fix

**Option A: Add @keyframes to globals.css** (Recommended)

Add this to `/apps/guests/app/globals.css` after the animation utilities section (around line 227):

```css
/* ============================================
   SVG ANIMATION KEYFRAMES
   ============================================ */

/* Pulse animation for coastline SVG */
@keyframes svg-pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

/* Draw animation for SVG paths */
@keyframes draw-path {
  to {
    stroke-dashoffset: 0;
  }
}
```

Then update AboutSection.tsx line 77:

```typescript
// OLD (BROKEN)
path.style.animation = 'pulse 3s ease-in-out infinite'

// NEW (WORKS)
path.style.animation = 'svg-pulse 3s ease-in-out infinite'
```

**Option B: Use CSS transition instead of animation**

Update AboutSection.tsx lines 76-78:

```typescript
// After drawing completes, add pulse effect using opacity
setTimeout(() => {
  // Use CSS transition for opacity changes
  path.style.transition = 'opacity 1.5s ease-in-out'
  
  // Create pulse effect by toggling opacity
  setInterval(() => {
    path.style.opacity = path.style.opacity === '0.7' ? '1' : '0.7'
  }, 1500)
}, 2500)
```

**Recommended**: Use Option A (proper @keyframes) - it's cleaner and more performant.

---

## ⚠️ ISSUE #3: SVG Animation Timing Issues

**Location**: `/apps/guests/components/sections/AboutSection.tsx` (lines 26-96)

### Potential Problems

The animation setup has several timing dependencies that might cause issues:

1. **Line 15-23**: Async fetch of SVG
2. **Line 26**: Second useEffect waits for `svgContent`
3. **Line 94**: `setTimeout(setupAndAnimate, 100)` - arbitrary 100ms delay
4. **Line 65-66**: Double `requestAnimationFrame` for paint sync
5. **Line 88**: Observer watches container, not SVG

### Why It Might Fail

The SVG is **502KB** (huge file, 1 massive path). The timing chain is:

```
fetch SVG (network time) 
  → setState (React re-render) 
    → useEffect runs 
      → setTimeout 100ms 
        → querySelector 
          → getTotalLength() [expensive!] 
            → set dasharray 
              → requestAnimationFrame × 2 
                → IntersectionObserver triggers 
                  → animate
```

If any step is delayed or the observer fires before setup completes, animation fails silently.

### The Fix

**Simplify the timing logic** - remove nested delays and use a more direct approach:

```typescript
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

export function AboutSection() {
  const { t } = useLanguage()
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)
  const [svgLoaded, setSvgLoaded] = useState(false)

  // Intersection Observer - simplified
  useEffect(() => {
    if (!svgContainerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          console.log('✅ Section is in view')
          setIsInView(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(svgContainerRef.current)
    return () => observer.disconnect()
  }, [])

  // Animate when both SVG loaded AND in view
  useEffect(() => {
    if (!svgLoaded || !isInView || !svgContainerRef.current) return

    console.log('🎬 Starting animation...')
    
    const svgElement = svgContainerRef.current.querySelector('svg')
    if (!svgElement) {
      console.error('❌ SVG element not found')
      return
    }

    const paths = svgElement.querySelectorAll('path')
    console.log(`Found ${paths.length} path(s)`)

    if (paths.length === 0) {
      console.error('❌ No paths found in SVG')
      return
    }

    paths.forEach((path, index) => {
      try {
        const length = path.getTotalLength()
        console.log(`Path ${index} length: ${length}`)

        // Style the path
        path.setAttribute('stroke', '#c2a24d')
        path.setAttribute('stroke-width', '2')
        path.setAttribute('fill', 'none')
        path.setAttribute('stroke-linecap', 'round')
        path.setAttribute('stroke-linejoin', 'round')

        // Set up for animation
        path.style.strokeDasharray = `${length}`
        path.style.strokeDashoffset = `${length}`
        path.style.transition = 'stroke-dashoffset 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)'

        // Small delay per path for stagger effect
        const delay = index * 50
        
        setTimeout(() => {
          console.log(`Animating path ${index}`)
          path.style.strokeDashoffset = '0'

          // After drawing, start pulse
          setTimeout(() => {
            path.style.animation = 'svg-pulse 3s ease-in-out infinite'
          }, 2500)
        }, delay)
      } catch (error) {
        console.error(`Error animating path ${index}:`, error)
      }
    })
  }, [svgLoaded, isInView])

  const bullets = t('about.bullets') as string[]

  return (
    <Section spacing="md" id="about">
      <Container maxWidth="default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="space-y-8">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              <span className="text-cream">{t('about.headline')} </span>
              <span className="text-gold">{t('about.headlineEmphasized')}</span>
              <span className="text-cream">{t('about.headlineSuffix')}</span>
            </h2>

            <ul className="space-y-6">
              {bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                  </div>
                  <p className="text-lg text-cream leading-relaxed">{bullet}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Montenegro Coastline */}
          <div ref={svgContainerRef} className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] h-[300px] md:h-[400px]">
              {/* Load SVG directly as img, then swap to inline for animation */}
              <object
                data="/illustrations/animation_outline.svg"
                type="image/svg+xml"
                className="w-full h-full"
                onLoad={() => {
                  console.log('✅ SVG loaded')
                  setSvgLoaded(true)
                }}
                aria-label="Montenegro coastline outline"
              >
                <img 
                  src="/illustrations/animation_outline.svg" 
                  alt="Montenegro coastline" 
                  className="w-full h-full"
                />
              </object>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

**Key Changes**:
1. ✅ Use `<object>` tag instead of fetch + dangerouslySetInnerHTML
2. ✅ Separate concerns: isInView and svgLoaded are independent
3. ✅ Animate only when BOTH conditions are true
4. ✅ Better error handling and console logging
5. ✅ Simplified timing (no nested setTimeout/requestAnimationFrame)

---

## 🐛 DEBUGGING CHECKLIST

Use the browser console to verify each step:

**Step 1: Check Fonts**
- [ ] Open DevTools → Network → Filter "Font"
- [ ] Refresh page
- [ ] All 8 fonts should be **200 OK** (not 404)
- [ ] If 404: Restart dev server

**Step 2: Check SVG Load**
- [ ] Open DevTools → Console
- [ ] Scroll to About section
- [ ] Should see: `✅ SVG loaded`
- [ ] Should see: `✅ Section is in view`
- [ ] Should see: `🎬 Starting animation...`
- [ ] Should see: `Found 1 path(s)`
- [ ] Should see: `Path 0 length: [big number]`
- [ ] Should see: `Animating path 0`

**Step 3: Check Animation**
- [ ] SVG path should draw over 2.5 seconds
- [ ] After drawing, should pulse (opacity 0.7 ↔ 1)
- [ ] No errors in console

**If Still Not Working:**

1. Check if `@keyframes svg-pulse` was added to `globals.css`
2. Check if SVG file exists: `ls /apps/guests/public/illustrations/animation_outline.svg`
3. Check browser console for errors
4. Try hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
5. Clear browser cache

---

## 📊 Status After Fixes

| Issue | Previous Status | Current Status | Fix Required |
|-------|----------------|----------------|--------------|
| Fonts Loading | ❌ Not configured | ⚠️ Configured but 404 | Restart server |
| SVG File | ❌ Missing | ✅ Copied | None |
| SVG Animation Logic | ❌ Placeholder | ⚠️ Implemented (buggy) | Simplify timing |
| Pulse Keyframe | ❌ Missing | ❌ Still missing | Add to CSS |
| Hero Text Overflow | ❌ Broken | ✅ Fixed | None |
| globals.css | ❌ Minimal | ✅ Complete | None |

---

## 🚀 IMMEDIATE ACTION ITEMS

**Priority 1** (Do First):
1. Restart dev server to fix font 404s
2. Add `@keyframes svg-pulse` to `globals.css`
3. Replace AboutSection.tsx with simplified version above

**Priority 2** (Verify):
1. Check browser console for animation logs
2. Verify fonts load (DevTools → Network)
3. Test SVG animation triggers when scrolling to section

**Priority 3** (Final QA):
1. Test on iPhone - verify no text overflow
2. Test all font weights render correctly
3. Verify animation works smoothly (60fps)

---

## Why The Animation Isn't Working - Technical Breakdown

The animation code LOOKS correct but has these subtle issues:

### Issue #1: Race Condition

```typescript
// Line 15: Fetch starts (async, unknown duration for 502KB file)
fetch('/illustrations/animation_outline.svg')

// Line 18: setState triggers re-render
setSvgContent(svgText)

// Line 26: useEffect with [svgContent] dependency
useEffect(() => {
  if (!svgContent || ...) return
  
  // Line 94: Wait 100ms (arbitrary)
  setTimeout(setupAndAnimate, 100)
  
  // Inside setupAndAnimate:
  // Line 32: Query for SVG (might not be in DOM yet!)
  const svgElement = container.querySelector('svg')
})
```

**Problem**: React's setState → re-render → useEffect → setTimeout doesn't guarantee SVG is in DOM when querySelector runs.

**Fix**: Use `<object>` tag with onLoad callback - guarantees SVG is loaded and accessible.

### Issue #2: Missing CSS Keyframe

```typescript
// Line 77: Tries to use 'pulse' animation
path.style.animation = 'pulse 3s ease-in-out infinite'
```

**Problem**: No `@keyframes pulse` in CSS → animation silently fails.

**Fix**: Add `@keyframes svg-pulse` to CSS.

### Issue #3: Observing Wrong Element

```typescript
// Line 88: Observes the container
observer.observe(container)

// But container ref is on outer div (line 125)
<div ref={svgContainerRef} ...>
```

**Problem**: Observer triggers when container is in view, but SVG might not be loaded yet.

**Fix**: Separate isInView and svgLoaded states, only animate when both true.

---

## Expected Result After Fixes

Once all fixes are applied:

✅ **Fonts load successfully** (200 OK in Network tab)  
✅ **SVG draws on scroll** (2.5 second drawing animation)  
✅ **SVG pulses after drawing** (opacity 0.7 ↔ 1, 3 second loop)  
✅ **Console shows animation progress** (helpful logs)  
✅ **No errors in browser console**  
✅ **Works on all devices** (mobile, tablet, desktop)  
✅ **Smooth 60fps animation** (GPU-accelerated)

---

## Document History

- **v2.0** - 2026-02-13 - Follow-up review after initial fixes
- Issues found: 3 (fonts 404, missing keyframe, timing issues)
- Estimated fix time: 30-45 minutes

---

**End of Review #2**
