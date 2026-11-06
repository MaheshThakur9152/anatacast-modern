# Reference Website Audit Report

Target URL: https://ananta-cast-website-design.vercel.app/
Date of Audit: 2026-11-06T06:18:37.423Z

## Summary
The reference website is a dark-themed precision engineering/foundry company ("Ananta Cast") website constructed with Next.js and Tailwind CSS.
It features seven primary routes:
- Home (`/`)
- About (`/about`)
- Capabilities (`/capabilities`)
- Process (`/process`)
- Products (`/products`)
- Industries (`/industries`)
- Contact (`/contact`)

## Design Tokens & Computed Values
- **Background**: `#0b0a09` (very dark charcoal / near black)
- **Foreground / Text**: `#eeebe5` (soft warm white)
- **Primary Accent ("molten")**: `#f86111` / `lab(61.3135% 56.657 68.0212)` (glowing orange)
- **Steel Accent**: `#9ea6ab`
- **Card Background**: `#141211`
- **Border**: `rgba(255, 255, 255, 0.1)`
- **Input Background**: `rgba(255, 255, 255, 0.14)`
- **Muted Background**: `#1c1a19`
- **Muted Foreground**: `#95918d`
- **Primary Font Family**: `Inter Tight`, ui-sans-serif, system-ui, sans-serif
- **Monospace Font Family**: `JetBrains Mono`, ui-monospace, monospace
- **Texture / Grain**: Subtle SVG fractal noise grain overlay in `body.grain:after` with opacity `0.05`.

## Header & Navigation Specifications
- Height: `64px` (`h-16`)
- Max width: `1400px` (`max-w-[1400px]`), horizontal padding: `20px` (`px-5`) on mobile, `40px` (`px-10`) on desktop
- Logo: Infinity loop SVG with molten orange dot on the right loop + uppercase text "Ananta Cast" (tracking `0.18em`, font-size `0.95rem`, weight `600`)
- Nav links: About, Capabilities, Process, Products, Industries. Font size `14px` (`text-sm`), color `text-foreground/65`, hover `text-foreground`
- CTA button: "Request a quote", pill shape (`rounded-full`), bg `#eeebe5`, text `#0b0a09`, height `40px` (`h-10`), hover `bg-molten`
- Mobile toggle: hamburger icon (Lucide `Menu`), reveals mobile nav accordion.

## Footer Specifications
- Logo and tagline "From Casting to Finished Product"
- Grid columns: Navigation links, Capabilities, Certifications, Contact details
- Legal copyright line & bottom links
