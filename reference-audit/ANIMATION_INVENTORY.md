# Animation Inventory

## 1. Global / Ambient
- **Scroll Progress Bar**: `h-[2px]`, origin-left, `bg-molten`, scaleX driven by scroll.
- **Background Grain**: SVG noise overlay with fixed inset `-50%`, opacity `0.05`.
- **Smooth Scroll**: Lenis smooth scroll active on root HTML (`html.lenis`).
- **Alloy Ticker / Marquee**: Infinite linear CSS translateX marquee moving right-to-left.

## 2. Page & Section Transitions
- **Fade / Slide Reveals**: Sections and cards reveal on scroll with translateY (16px to 24px) and opacity 0 -> 1.
- **Header Transition**: Fixed header begins transparent, transitions background to dark with backdrop blur on scroll down.
- **Button Hover States**: Fill transitions to `#f86111` (`bg-molten`), duration `200ms` to `300ms`.

## 3. Route-Specific Interactions
- **Process Timeline**: 6-stage progressive interactive switcher showing active stage card, description, details, and switching corresponding stage image.
- **Products Catalog**: Filter tabs with active pill indicator; products re-render with smooth entrance fade and responsive 3-column grid.
- **Industries Showcase**: Selectable industry cards with switching specifications, typical parts, and metallurgical compositions.
- **Contact Form**: Form input focus states with `ring-molten` border highlight.
