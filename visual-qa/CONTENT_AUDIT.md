# Content Audit — Ananta Cast Ditto Recreation

## Executive Summary

Audit conducted across all seven routes comparing reference (`https://ananta-cast-website-design.vercel.app/`) against local Astro deployment (`http://localhost:4321/`). Every heading, subtitle, paragraph, caption, technical spec, and CTA was inspected in the live DOM.

---

## Route-by-Route Content Audit

### 1. Home (`/`)
- **Hero**:
  - Eyebrow: `INVESTMENT CASTING · CNC MACHINING · INSPECTION`
  - H1: `From casting to finished product.` (with `finished` in `--molten`)
  - Subtitle: `One partner for the entire journey of a metal part — pattern, shell, pour, heat treatment, machining and inspection, under a single roof.`
  - Scroll indicator pill: Present and animated.
- **Why Ananta**:
  - Eyebrow: `01 — WHY ANANTA`
  - H2: `Foundry roots. Machinist precision.`
  - Body: Complete 3-paragraph narrative matching reference.
  - Sanskrit name explanation & infinity symbol visual: Identical.
- **Process Sequence**:
  - Eyebrow: `02 — THE PROCESS`
  - H2: `Six stages. One accountable partner.`
  - Stages 01 to 06:
    1. Tooling & wax: `Aluminium dies inject precise wax replicas...` (`Pattern accuracy ±0.05 mm`)
    2. Shell building: `The tree is dipped in ceramic slurry...` (`7–9 ceramic coats`)
    3. Melting & pouring: `Induction-melted alloy, verified by spectro...` (`Chemistry checked every heat`)
    4. Fettling & heat treatment: `Shells are knocked out, gates cut...` (`Solution annealing · Q&T · Normalising`)
    5. CNC machining: `In-house turning and multi-axis milling...` (`VMC · HMC · CNC turning`)
    6. Inspection & dispatch: `Every lot is measured, documented...` (`CMM · DP · Radiography · MTC`)
- **Ready to Fit (Result)**:
  - Eyebrow: `03 — THE RESULT`
  - H2: `Ready to fit. Not ready to machine.`
  - 3 Specs: Near-net shape, Machined in-house, Documented (`Material certificates and dimensional reports travel with every dispatch.`)
- **Components Showcase**:
  - Eyebrow: `04 — COMPONENTS`
  - H2: `What leaves our floor.`
  - 5 Cards:
    1. Valve bodies (`CF8M · WCB · Duplex` | `01`)
    2. Pump impellers (`CF8 · CA15 · 17-4PH` | `02`)
    3. Levers & brackets (`4140 · 8620 · SS 410` | `03`)
    4. Machined assemblies (`Cast + CNC finished` | `04`)
    5. Wax-to-part prototypes (`Low volume · fast tooling` | `05`)
- **Technical Capabilities**:
  - Eyebrow: `05 — CAPABILITIES`
  - H2: `Engineered within microns.`
  - DL specs: Process, Part weight (`0.02 – 40 kg`), Dimensional tolerance (`ISO 8062 · CT4 – CT6`), As-cast surface (`Ra 3.2 – 6.3 µm`), Machining (`CNC turning · VMC · 4/5-axis milling`), Heat treatment (`Annealing · Normalising · Q&T · Case hardening`), Testing (`Spectro · CMM · Hardness · DP · Radiography`).
- **Alloy Ticker**:
  - Screen reader text: `Alloys: SS 304, SS 316, CF8, CF8M, CF3M, CA15, 17-4 PH, Duplex 2205, Super Duplex, WCB, LCB, AISI 4140, AISI 8620, EN 8, EN 19, SS 410, SS 420, Tool steels`
  - Track 1 (solid): 9 alloys
  - Track 2 (stroked outline): 9 alloys
- **Industries Preview**:
  - Eyebrow: `06 — INDUSTRIES`
  - H2: `Where our castings work.`
  - 6 sectors matching reference copy.
- **Contact Banner / CTA**:
  - Eyebrow: `07 — START A PROGRAMME`
  - H2: `Send us a drawing.`
  - Form fields and submit button: Complete.

---

### 2. About (`/about`)
- **Hero**:
  - Eyebrow: `ABOUT`
  - H1: `Foundry roots. Machinist precision.`
  - Subtitle: `We started with the belief that an investment casting should not leave the foundry unfinished.`
- **Word-Reveal Narrative**:
  - `Ananta Cast is an investment casting company that thinks like a machine shop. We cast ferrous alloys, heat treat them, machine them and measure them — then ship them ready to assemble.`
- **Etymology / Sanskrit Section**:
  - Sanskrit calligraphy: `अनन्त` (Ananta: infinite, unbroken).
  - Body: Continuous cycle of metal, mold, and precision engineering.
- **Three Core Principles**:
  - `01 One roof`: Pattern, shell, pour, machine, inspect.
  - `02 Engineering first`: Foundry tooling designed by machinists.
  - `03 Clean reports`: Every shipment with dimensional & material records.

---

### 3. Capabilities (`/capabilities`)
- **Hero**:
  - Eyebrow: `CAPABILITIES`
  - H1: `Four disciplines. One floor.`
  - Subtitle: `Casting, machining, heat treatment and inspection run side by side — so your part never waits for a second supplier.`
- **Technical Envelope**:
  - Eyebrow: `01 — TECHNICAL ENVELOPE`
  - H2: `What we can hold.`
  - Full 7-item DL list matching reference.
- **Core Disciplines (Cards)**:
  - Eyebrow: `02 — CORE DISCIPLINES`
  - 4 Cards: Investment casting, CNC machining, Heat treatment, Testing & quality (`Radiography · MTC`).
- **Alloy Marquee**:
  - Dual track marquee with full alloy listings.
- **Material Grades Table**:
  - 6 alloy families: Austenitic stainless, Martensitic & PH, Duplex stainless, Carbon steels, Low-alloy steels, Tool steels.

---

### 4. Process (`/process`)
- **Hero**:
  - Eyebrow: `PROCESS`
  - H1: `Six stages. Zero handoffs.`
  - Subtitle: `Every step from tooling to final coordinate measurement happens inside our facility.`
- **Process Timeline**:
  - Eyebrow: `02 — THE PROCESS`
  - Full 6-stage interactive timeline with exact copy, specs, and counters.
- **Working With Us**:
  - Eyebrow: `03 — WORKING WITH US`
  - 3 stages: Drawing review (24-48h), First article inspection, Series production.

---

### 5. Products (`/products`)
- **Hero**:
  - Eyebrow: `PRODUCTS`
  - H1: `Built to your drawing.`
  - Subtitle: `From a 20-gram lever to a 40-kilogram valve body — explore the part families we cast, machine and inspect every day.`
- **Product Catalogue**:
  - Filter categories: `All`, `Flow control`, `Rotating`, `Structural`, `Machined`.
  - Dynamic count pill: `09 part families`.
  - 9 component articles with exact specs.
  - Footer caption: `Representative part families shown. Every component is cast and machined to the customer's own drawing and specification.`
- **Result Section**:
  - Eyebrow: `03 — THE RESULT`
  - H2: `Ready to fit. Not ready to machine.`
  - 3 Specs: Near-net shape, Machined in-house, Documented (`Material certificates and dimensional reports travel with every dispatch.`).

---

### 6. Industries (`/industries`)
- **Hero**:
  - Eyebrow: `INDUSTRIES`
  - H1: `Where our castings work.`
  - Subtitle: `Critical components for sectors where downtime is not an option and material failure is unthinkable.`
- **Word-Reveal Narrative**:
  - `Whether a part seals a pipeline or shifts a gear, it is cast, machined and measured to the same discipline — and shipped with the reports to prove it.`
- **Industries Accordion**:
  - 6 industries: Pumps & valves, Oil, gas & petrochem, Automotive, Agriculture & earthmoving, Food & pharma, General engineering.
  - Typical parts and common alloys for each.

---

### 7. Contact (`/contact`)
- **Hero**:
  - Eyebrow: `CONTACT`
  - H1: `Send a drawing. Get a part.`
  - Subtitle: `Share your 2D/3D data, material and annual quantity. Our engineering team responds with feasibility and a clear quotation.`
- **Contact Section**:
  - Eyebrow: `07 — START A PROGRAMME`
  - H2: `Send us a drawing.`
  - Subtitle: `Share your part, material and volumes. Our engineering team reviews every enquiry for castability and responds with a feasibility note and quotation.`
  - Interactive form with real-time feedback.
  - Contact metadata: Email, Phone, Address, Certifications.
