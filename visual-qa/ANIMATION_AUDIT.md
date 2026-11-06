# Animation & Motion Audit — Ananta Cast Ditto Recreation

## Overview

All motion behaviors across the reference site were inspected in Playwright and recreated using performant CSS animations and lightweight JavaScript scroll observers.

---

## Motion Inventory & Behavioral Verification

### 1. Global Scroll & Progress
- **Smooth Scrolling**: Lenis inertial smooth scroll integrated globally.
- **Scroll Progress Bar**:
  - Element: Fixed top 2px bar with `bg-molten`.
  - Behavior: `transform: scaleX(progress)` with `origin-left`. Snaps smoothly with page scroll progress.

### 2. Header & Navigation Transitions
- **Background Fill**: Transitions from transparent to blurred dark glass (`rgba(18, 17, 16, 0.85)` + `backdrop-blur-md`) when scroll distance exceeds 50px.
- **Active Navigation Pill**: Active link displays a subtle indicator (`bg-molten`), while inactive links maintain `text-foreground/65` with hover transitions to `text-foreground`.
- **Mobile Menu Drawer**: Smooth slide-down and opacity fade when toggling hamburger button; locks body scroll when open.

### 3. Hero Section Reveal Animations
- **Slide-up Headline Reveal**:
  - H1 lines are wrapped in `overflow-hidden pb-[0.08em]`.
  - Inner spans execute `@keyframes slideUp` (`translateY(110%)` to `translateY(0)`), staggered with `cubic-bezier(0.22, 1, 0.36, 1)`.
- **Hero Image Zoom & Darken**:
  - Initial scale at 1.08 with parallax scale down on scroll.
  - Subtitle and scroll pill fade in smoothly on load.

### 4. Interactive Process Timeline (6-Stage Scroll Sequence)
- **Container**: `h-[600svh]` sticky section.
- **Image Transitions**:
  - Dynamic `clip-path: inset(100% 0 0 0)` to `inset(0% 0 0 0)` driven by scroll progress across the 6 stages.
  - Parallax image zoom (`scale(1.16)` easing to `scale(1.0)`).
- **Text & Counter Updates**:
  - Step indicator changes dynamically: `01 / 06` through `06 / 06`.
  - Content fades and translates smoothly during stage transitions.
  - Bottom stage navigation links update active state and progress bar width (`0%` to `100%`).

### 5. Ready to Fit Frame Expansion
- **Sticky Viewport**: `h-[280svh]` container.
- **Frame Transform**: Expands smoothly from `width: 62%, height: 48%, border-radius: 20px` to full screen `width: 100%, height: 100%, border-radius: 0px`.
- **Image Un-rotation**: Inner image transitions from `scale(1.25) rotate(-6deg)` to `scale(1.0) rotate(0deg)`.
- **Specs Reveal**: Bottom 3-column specification bar fades and translates into view as frame reaches full width.

### 6. Component Showcase Horizontal Scroll Track
- **Sticky Viewport**: `h-[320svh]` container.
- **Track Translation**: Driven by scroll progress, horizontally scrolling the 5 component cards smoothly from right to left (`translateX(0)` to `translateX(-totalWidth + viewportWidth)`).
- **Card Hover**: Image scales smoothly (`scale(1.05)`) over 1.2s with `cubic-bezier(0.22, 1, 0.36, 1)`.

### 7. Dual-Track Alloy Marquee
- **Track 1 (Solid)**: Linear infinite marquee animating leftwards (`translateX(0)` to `translateX(-50%)`) at 35s duration.
- **Track 2 (Stroked Outline)**: Linear infinite marquee animating rightwards (`translateX(-50%)` to `translateX(0)`) at 35s duration.
- **Visual Distinction**: Second track features `-webkit-text-stroke: 1px var(--steel)` with transparent text fill.

### 8. Interactive Product Filtering
- **Active Pill Animation**: Smooth background pill transition between category filter buttons (`All`, `Flow control`, `Rotating`, `Structural`, `Machined`).
- **Dynamic Count**: Real-time counter updates (`09 part families`, `03 part families`, etc.).
- **Card Filtering**: Grid elements transition with opacity and scale.

### 9. Interactive Industries Accordion
- **Toggle Motion**: Plus icon smoothly rotates 45 degrees (`transform: rotate(45deg)`) on active item.
- **Height Animation**: Smooth height transition between expanded and collapsed state.
- **Image Preview Reveal**: Dynamic clip-path inset animation revealing the industry photo.

### 10. Scroll Reveal Observers (`data-reveal`)
- Elements throughout all routes fade in (`opacity: 0 -> 1`) and translate upwards (`translateY(48px) -> translateY(0)`) as they enter the viewport using `IntersectionObserver` with `rootMargin: '0px 0px -12% 0px'` and `cubic-bezier(0.22, 1, 0.36, 1)`.

### 11. Scroll-Driven Progressive Word Reveal (`Statement.astro`)
- **Reverse-Engineered Mechanics**: Extracted directly from reference Next.js module `8737`.
- **Offset Bounds**: `["start 0.85", "end 0.45"]` (start when top reaches 85% vh, end when bottom reaches 45% vh).
- **Word Breakdown**: Paragraph text split into individual spans (`.reveal-word`) with `mr-[0.25em] inline-block`.
- **Progress Range**: Each word `i` of `N` mapped to sub-range `[i/N, (i+1)/N]`.
- **Transform & Opacity**:
  - Initial / unrevealed: `opacity: 0.14`, `translateY: 8px`.
  - Fully revealed: `opacity: 1.0`, `translateY: 0px`.
  - In-progress scrub: Linear interpolation over its sub-range.
- **Accent Words**: Preserves `text-molten` (orange accent) on keywords (`all`, `one`, `alloys,`), while brightening smoothly with scroll.
- **Bidirectional Scrub**: Scrubbing upward reverses the animation back to muted grey (`opacity: 0.14`).
- **Screen Reader Support**: `<p class="sr-only">` provides un-split text for accessibility; visual container has `aria-hidden="true"`.
- **Reduced Motion**: Disables scrub and displays all words at `opacity: 1` if `prefers-reduced-motion` is active.

### 13. Section-by-Section Homepage Animation Audit & Repair
- **Section 01 (Hero)**:
  - 3 staggered masked lines (`0.15s`, `0.28s`, `0.41s`) with `cubic-bezier(0.22, 1, 0.36, 1)`.
  - Hero scroll-linked parallax: Image scales `1.08 -> 1.32`, bg overlay darkens `0.35 -> 0.92`, H1 translates `-60%` & fades out by `0.55` scroll progress, subtitle translates `-140%`.
- **Section 02 (Why Ananta)**:
  - Preserved scroll-driven word-by-word reveal: 41 words mapped to sub-ranges over `["start 0.85", "end 0.45"]`. Muted grey (`0.14`) to bright off-white (`1.0`), reversible on scroll up. Accent words (`all`, `one`) preserve orange.
- **Section 03 (The Process)**:
  - Staged coordinate crossfade: All 6 stages rendered with absolute positioning. Active stage transitions smoothly from `translateY(24px)` to `translateY(0)` with `opacity: 1`. Exiting stages translate to `translateY(-24px)` with `opacity: 0` (`duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`).
  - Active stage number & title & body & spec transition together without layout shift.
  - Process navigation labels update dynamically (`i <= activeIdx` highlighted, active item has `aria-current="step"`).
  - Progress bar width tied to scroll progress (`width: progress * 100%`).
  - Image clipPath transition uses exact reference formula (`m = i/6 - 0.06`, `u = i/6 + 0.04`, `inset((1-ratio)*100% 0 0 0)`).
- **Section 04 (The Result)**:
  - Top heading translates up (`0% -> -120%`) and fades out (`1 -> 0`) across `0` to `0.3` progress.
  - Frame expands (`62% -> 100%`, `48% -> 100%`, borderRadius `20px -> 0px`) across `0` to `0.5` progress.
  - Inner image rotates (`-6deg -> +4deg`) and scales (`1.25 -> 1.0`) across full `0` to `1.0` progress.
  - Bottom 3 specs fade in (`0 -> 1`) and slide up (`60px -> 0px`) across `0.55` to `0.8` progress.
- **Section 05 (Components)**:
  - Section eyebrow & heading enter with clean line reveal.
  - Horizontal track translates smoothly based on `scrollWidth - innerWidth`.
  - Product cards feature image zoom on hover (`scale(1.05)` over 1.2s ease).
- **Section 06 (Capabilities)**:
  - 7 specification rows staggered with `data-delay={s * 0.04}` and `data-y={24}`.
  - Dual marquee ticker with solid fill and reverse stroked outline running continuously.
- **Section 07 (Industries)**:
  - Left column sticky with image parallax (`translateY(-15% -> +15%)`).
  - 6 industry rows staggered with `data-delay={s * 0.03}` and `data-y={36}`.
  - Row heading translates right on hover (`group-hover:translate-x-2 duration-500`).
- **Section 08 (Contact)**:
  - Left column reveal (`y: 48, delay: 0`).
  - Right column form reveal (`y: 48, delay: 0.1`).
  - Form input and button hover interactions.
- **Section 09 (Footer)**:
  - Clean layout, watermark subtly layered at `opacity-[0.07]`.
