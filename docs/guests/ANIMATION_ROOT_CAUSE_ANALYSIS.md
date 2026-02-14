# Montenegro Coastline Animation - ROOT CAUSE ANALYSIS

**Date**: 2026-02-13  
**Status**: 🔴 **ANIMATION IMPOSSIBLE WITH CURRENT FILE**  
**Severity**: CRITICAL - Wrong file type

---

## 🚨 THE PROBLEM: Wrong File Type

After deep technical analysis, I've discovered the **fundamental issue**:

**The `animation_outline.svg` file is NOT a vector outline.**

### What You Have

```
animation_outline.svg (502KB)
├─ <svg> container
├─ <g> groups (5 groups)
├─ <path> (1 simple rectangle - clipping mask only)
└─ <image> tags (2 embedded PNG bitmap images)
     ├─ PNG Image 1: 2752×1600px (base64 encoded)
     └─ PNG Image 2: 2752×1600px (base64 encoded)
```

**This is a RASTER IMAGE (bitmap PNG) wrapped in an SVG container, NOT a vector path outline.**

### Why The Animation Cannot Work

The `stroke-dashoffset` animation technique (drawing effect) **ONLY works on vector <path> elements** with actual coordinate data.

Your file has:
- ❌ No animatable vector paths
- ❌ Only 1 simple rectangular clipping path: `M 119 109 L 1420 109 L 1420 1431 L 119 1431 Z`
- ❌ The actual coastline is a PNG bitmap image

**You cannot animate stroke-dashoffset on a bitmap image. It's technically impossible.**

---

## 🔍 Technical Evidence

### File Analysis Results

```python
File size: 502,075 bytes (502KB)
Number of <path> tags: 1
Path d attribute: "M 119.558594 109 L 1420.058594 109 L 1420.058594 1431.597656..." 
  → This is just a RECTANGLE (clipping mask)

Number of <image> tags: 2
Embedded format: PNG (base64 encoded)
Image dimensions: 2752 × 1600 pixels each
```

### What The Current Code Does

```typescript
// Line 41: Finds the rectangle path (not the coastline)
const paths = svg.querySelectorAll('path')  // Finds 1 path

// Line 46: Gets the path length
const length = path.getTotalLength()  // Returns ~5000 (perimeter of rectangle)

// Line 52-53: Sets up dash animation
path.style.strokeDasharray = `${length}`
path.style.strokeDashoffset = `${length}`

// Line 70: Animates the RECTANGLE, not the coastline
path.style.strokeDashoffset = '0'  // Draws a rectangle outline, not coastline!
```

**Result**: The code animates the clipping rectangle, but you never see it because the PNG image sits on top of it.

---

## ✅ SOLUTION #1: Get A Proper Vector SVG (Recommended)

You need an SVG file with **actual vector path data** of the Montenegro coastline.

### What A Proper Vector SVG Looks Like

```xml
<svg viewBox="0 0 800 600">
  <path d="M 100,200 L 150,180 C 160,170 180,165 200,160 L 250,155 C 270,150 290,148 310,150 L ..." 
        stroke="#c2a24d" 
        stroke-width="2" 
        fill="none" />
</svg>
```

**Key difference**: The `d` attribute contains hundreds/thousands of actual coordinate points defining the coastline shape.

### How To Obtain A Vector SVG

**Option A: Convert Your Current Image**

Use a vectorization tool to trace the PNG and create vector paths:

1. **Adobe Illustrator**:
   - Open the animation_outline.svg
   - Select the image
   - Object → Image Trace → High Fidelity Photo
   - Object → Expand
   - Delete bitmap, keep paths
   - Export as SVG

2. **Inkscape** (Free):
   - Open the SVG
   - Select embedded image
   - Path → Trace Bitmap → Edge Detection
   - Adjust threshold for clean outline
   - Export as Optimized SVG

3. **Online Tool** (https://www.vectorizer.io/):
   - Upload the PNG
   - Set to "Line Art" mode
   - Download vectorized SVG

**Option B: Create From Scratch**

If you have a simple outline:
1. Use Figma/Illustrator to draw the Montenegro coastline
2. Use pen tool to trace the shape
3. Export as SVG with paths only (no fills, just strokes)

**Option C: Find An Existing Vector Map**

- Search for "Montenegro vector map SVG outline"
- OpenStreetMap exports (simplified coastline)
- Natural Earth Data (free vector maps)

### Testing The New Vector SVG

A proper vector SVG should:
- ✅ Be much smaller (~10-50KB, not 500KB)
- ✅ Have multiple <path> elements OR one <path> with complex d attribute
- ✅ NOT have <image> tags
- ✅ NOT have base64 encoded data
- ✅ Work when you run: `path.getTotalLength()` returns a large number (10,000+)

---

## ✅ SOLUTION #2: Alternative Animation For Current File

If you must use the current PNG-based file, you can create a different reveal animation:

### Option A: Clip-Path Reveal Animation

Instead of drawing, reveal the image gradually using a clip-path:

```typescript
'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Container, Section } from '@mne-select/ui'
import { useLanguage } from '../../contexts/LanguageContext'

export function AboutSection() {
  const { t } = useLanguage()
  const imageRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!imageRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(imageRef.current)
    return () => observer.disconnect()
  }, [])

  const bullets = t('about.bullets') as string[]

  return (
    <Section spacing="md" id="about">
      <Container maxWidth="default">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column: Text */}
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

          {/* Right Column: Coastline with wipe-reveal animation */}
          <div className="flex items-center justify-center">
            <div
              ref={imageRef}
              className="relative w-full max-w-[500px] h-[400px] overflow-hidden"
            >
              {/* Animated reveal container */}
              <div
                className={`
                  w-full h-full transition-all duration-2500 ease-out
                  ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
                `}
                style={{
                  clipPath: isVisible
                    ? 'inset(0 0 0 0)'
                    : 'inset(0 100% 0 0)',
                  transition: 'clip-path 2.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                <img
                  src="/illustrations/animation_outline.svg"
                  alt="Montenegro coastline"
                  className="w-full h-full object-contain"
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(65%) sepia(27%) saturate(900%) hue-rotate(2deg) brightness(95%) contrast(86%)',
                  }}
                />
              </div>

              {/* Gold glow effect */}
              <div
                className={`
                  absolute inset-0 pointer-events-none
                  ${isVisible ? 'animate-svg-pulse' : 'opacity-0'}
                `}
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(194,162,77,0.2) 0%, transparent 70%)',
                  animationDelay: '2.5s',
                }}
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
```

Add to `globals.css`:

```css
/* Wipe reveal animation */
@keyframes wipe-reveal {
  from {
    clip-path: inset(0 100% 0 0);
  }
  to {
    clip-path: inset(0 0 0 0);
  }
}

/* SVG pulse for glow effect */
@keyframes svg-pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}
```

This creates a left-to-right wipe reveal effect with a gold glow.

### Option B: Fade + Scale Animation

Simple elegant reveal:

```tsx
<div
  className={`
    transition-all duration-2500 ease-out
    ${isVisible 
      ? 'opacity-100 scale-100 blur-0' 
      : 'opacity-0 scale-90 blur-sm'
    }
  `}
>
  <img src="/illustrations/animation_outline.svg" ... />
</div>
```

### Option C: Particles/Dots Reveal

More complex - reveal the image through animated particles (requires additional library like `react-tsparticles`).

---

## 🎯 RECOMMENDED ACTION PLAN

### Immediate Term (Next 30 Minutes)

**Implement Solution #2 Option A** (Clip-path reveal) to get SOMETHING animated while you work on the vector SVG.

```bash
# 1. Update AboutSection.tsx with the wipe-reveal code above
# 2. Add wipe-reveal and svg-pulse keyframes to globals.css
# 3. Test - should see left-to-right reveal animation
```

### Short Term (Next 1-2 Hours)

**Get a proper vector SVG**:

1. Try vectorization with Inkscape (free):
   ```bash
   # Install Inkscape
   brew install --cask inkscape  # Mac
   
   # Open your SVG, trace bitmap, export as optimized SVG
   ```

2. OR search for free vector maps:
   - https://www.naturalearthdata.com/
   - https://www.openstreetmap.org/ (export simplified coastlines)

3. Test the vector SVG:
   ```javascript
   // In browser console
   const svg = document.querySelector('svg')
   const path = svg.querySelector('path')
   console.log('Path length:', path.getTotalLength())  // Should be 10,000+
   ```

### Long Term (Production)

Once you have a proper vector SVG:

1. Replace the file
2. Update AboutSection.tsx to use the working stroke-dashoffset animation
3. The animation will work perfectly

---

## 📝 Summary

### Why Current Animation Doesn't Work

| What You Need | What You Have |
|---------------|---------------|
| Vector <path> with coordinates | PNG bitmap image |
| Animatable stroke | Non-animatable raster pixels |
| ~10-50KB SVG file | 502KB embedded image |
| `<path d="M100,200 L150,180 C160,170...">` | `<image xlink:href="data:image/png;base64...">` |

### The Fix

**Option 1** (Best): Get a real vector SVG with path coordinates  
**Option 2** (Temporary): Use clip-path reveal animation with current file

---

## 🔧 Quick Test Script

Want to verify this analysis yourself? Run this in browser console:

```javascript
// Load the SVG
fetch('/illustrations/animation_outline.svg')
  .then(r => r.text())
  .then(svg => {
    // Count path elements
    const pathCount = (svg.match(/<path/g) || []).length
    console.log('Number of <path> tags:', pathCount)
    
    // Count image elements  
    const imageCount = (svg.match(/<image/g) || []).length
    console.log('Number of <image> tags:', imageCount)
    
    // Check for base64
    const hasBase64 = svg.includes('base64')
    console.log('Has base64 embedded images:', hasBase64)
    
    // Extract path d attribute
    const match = svg.match(/d="([^"]+)"/)
    if (match) {
      console.log('Path data length:', match[1].length, 'characters')
      console.log('Path data sample:', match[1].substring(0, 100))
    }
    
    // Verdict
    if (imageCount > 0 && hasBase64) {
      console.error('❌ THIS IS A RASTER IMAGE, NOT A VECTOR PATH!')
      console.error('❌ STROKE-DASHOFFSET ANIMATION WILL NOT WORK!')
    } else if (match && match[1].length > 500) {
      console.log('✅ This looks like a proper vector SVG')
    }
  })
```

---

## Document History

- **v3.0** - 2026-02-13 - Root cause analysis: Wrong file type discovered
- Critical finding: Current file is PNG bitmap, not vector outline
- Animation technique incompatible with file type
- Solutions provided: Vector SVG or alternative animation

---

**BOTTOM LINE**: The animation code is correct, but you're trying to animate the wrong type of file. Get a vector SVG with actual path coordinates and the animation will work immediately.
