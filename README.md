# Ananta Cast (Modern Astro Recreation)

Precision investment castings and in-house CNC machining website, reconstructed from the ground up in Astro.

## Tech Stack
- **Framework:** Astro 5
- **Styling:** Tailwind CSS + Custom CSS Keyframes
- **Typography:** Inter Tight & JetBrains Mono (locally hosted woff2)
- **Motion & Interactions:** Hardware-accelerated CSS transforms, IntersectionObserver, scroll-driven word reveal system, sticky stage scrubbers

## Key Features
- **Ditto recreation:** 1:1 match with original reference website across all 7 routes (`/`, `/about`, `/capabilities`, `/process`, `/products`, `/industries`, `/contact`).
- **Material Ticker:** Continuous, dual-track high-speed marquee (solid and stroked outline) with zero-jump seamless 50% loop.
- **Scroll-driven Word Reveal:** Shared text-reveal utility (`data-text-reveal="words"`) brightening typography progressively along scroll path with reverse scrub.
- **Process Timeline:** 6-stage vertical scrub sequence with synchronized clip-path image reveals and active stage transitions.
- **Responsive & Accessible:** Fully mobile-optimized, clean semantic HTML, accessible `aria-*` tags, and `prefers-reduced-motion` support.

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview build
npm run preview
```
