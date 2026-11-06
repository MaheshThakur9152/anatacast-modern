import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import https from 'https';

const BASE_URL = 'https://ananta-cast-website-design.vercel.app';
const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'capabilities', path: '/capabilities' },
  { name: 'process', path: '/process' },
  { name: 'products', path: '/products' },
  { name: 'industries', path: '/industries' },
  { name: 'contact', path: '/contact' }
];

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-375', width: 375, height: 812 },
  { name: 'mobile-360', width: 360, height: 800 }
];

const AUDIT_DIR = path.resolve('reference-audit');
const SCREENSHOT_DIR = path.join(AUDIT_DIR, 'screenshots');
const VISUAL_QA_DIR = path.resolve('visual-qa/reference');
const PUBLIC_DIR = path.resolve('public');

async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
      return resolve(false);
    }
    const file = fs.createWriteStream(destPath);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(true));
        });
      } else {
        file.close();
        fs.unlink(destPath, () => {});
        resolve(false);
      }
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      resolve(false);
    });
  });
}

async function run() {
  fs.mkdirSync(AUDIT_DIR, { recursive: true });
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  fs.mkdirSync(VISUAL_QA_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext();

  const collectedAssets = new Set();
  const pageAuditData = {};
  const interactionData = [];
  const animationData = [];

  for (const route of ROUTES) {
    console.log(`Auditing route: ${route.name} (${route.path})`);
    pageAuditData[route.name] = {
      title: '',
      meta: {},
      sections: [],
      images: [],
      fonts: [],
      interactiveElements: [],
      colors: {},
      typography: {}
    };

    // Primary inspection at 1440x900
    const page = await context.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    page.on('response', (res) => {
      const url = res.url();
      if (url.startsWith(BASE_URL) && !url.includes('/_next/static/webpack')) {
        collectedAssets.add(url);
      }
    });

    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    pageAuditData[route.name].title = await page.title();

    // Collect DOM structure and styles
    const auditResult = await page.evaluate(() => {
      const data = {
        meta: {},
        sections: [],
        images: [],
        buttons: [],
        links: [],
        cssVars: {}
      };

      document.querySelectorAll('meta').forEach(m => {
        const name = m.getAttribute('name') || m.getAttribute('property');
        if (name) data.meta[name] = m.getAttribute('content');
      });

      // Sections
      const header = document.querySelector('header');
      if (header) {
        const rect = header.getBoundingClientRect();
        const style = window.getComputedStyle(header);
        data.sections.push({
          tag: 'header',
          id: header.id,
          classes: header.className,
          rect: { width: rect.width, height: rect.height, top: rect.top },
          styles: {
            background: style.backgroundColor,
            position: style.position,
            backdropFilter: style.backdropFilter,
            zIndex: style.zIndex
          }
        });
      }

      document.querySelectorAll('main > section, main > div').forEach((sec, idx) => {
        const rect = sec.getBoundingClientRect();
        const style = window.getComputedStyle(sec);
        const heading = sec.querySelector('h1, h2, h3');
        data.sections.push({
          tag: sec.tagName.toLowerCase(),
          index: idx,
          id: sec.id || '',
          classes: sec.className,
          heading: heading ? heading.innerText.trim().replace(/\n/g, ' ') : null,
          rect: { width: rect.width, height: rect.height, top: rect.top + window.scrollY },
          styles: {
            padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`,
            margin: `${style.marginTop} ${style.marginRight} ${style.marginBottom} ${style.marginLeft}`,
            backgroundColor: style.backgroundColor,
            border: `${style.borderTopWidth} ${style.borderTopStyle} ${style.borderTopColor}`
          }
        });
      });

      const footer = document.querySelector('footer');
      if (footer) {
        const rect = footer.getBoundingClientRect();
        const style = window.getComputedStyle(footer);
        data.sections.push({
          tag: 'footer',
          classes: footer.className,
          rect: { width: rect.width, height: rect.height, top: rect.top + window.scrollY },
          styles: {
            background: style.backgroundColor,
            padding: `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`
          }
        });
      }

      // Images
      document.querySelectorAll('img').forEach((img) => {
        const rect = img.getBoundingClientRect();
        const style = window.getComputedStyle(img);
        data.images.push({
          src: img.src,
          currentSrc: img.currentSrc,
          alt: img.alt,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          displayWidth: rect.width,
          displayHeight: rect.height,
          classes: img.className,
          objectFit: style.objectFit,
          objectPosition: style.objectPosition
        });
      });

      // Buttons & interactive
      document.querySelectorAll('button, a, input, select, textarea').forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const item = {
          tag: el.tagName.toLowerCase(),
          text: el.innerText ? el.innerText.trim().replace(/\n/g, ' ') : (el.value || el.placeholder || ''),
          href: el.getAttribute('href') || null,
          classes: el.className,
          ariaLabel: el.getAttribute('aria-label') || null,
          rect: { width: rect.width, height: rect.height },
          styles: {
            fontFamily: style.fontFamily,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight,
            color: style.color,
            backgroundColor: style.backgroundColor,
            borderRadius: style.borderRadius
          }
        };
        if (el.tagName === 'A') data.links.push(item);
        else data.buttons.push(item);
      });

      return data;
    });

    pageAuditData[route.name] = { ...pageAuditData[route.name], ...auditResult };

    // Capture standard full-page and hero screenshots
    const qaPath = path.join(VISUAL_QA_DIR, `${route.name}-1440.png`);
    await page.screenshot({ path: qaPath, fullPage: true });

    // Capture screenshots across viewports
    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);
      const vpDir = path.join(SCREENSHOT_DIR, vp.name);
      fs.mkdirSync(vpDir, { recursive: true });
      await page.screenshot({ path: path.join(vpDir, `${route.name}.png`), fullPage: true });
    }

    // Inspect interactive specifics per route
    await page.setViewportSize({ width: 1440, height: 900 });

    if (route.name === 'products') {
      console.log('Inspecting product filters...');
      const filterBtns = await page.$$('button');
      for (const btn of filterBtns) {
        try {
          const text = await btn.innerText();
          if (['All', 'Flow control', 'Rotating', 'Structural', 'Machined'].includes(text.trim())) {
            await btn.evaluate(el => el.click());
            await page.waitForTimeout(400);
            const activeState = await page.evaluate(() => {
              const activeBtn = document.querySelector('button[data-state="active"], button.bg-molten, button.bg-foreground');
              const cards = Array.from(document.querySelectorAll('main div.grid > div, main div[class*="grid"] > div')).length;
              return { activeBtnClass: activeBtn ? activeBtn.className : '', cardCount: cards };
            });
            interactionData.push({
              route: '/products',
              action: `Click filter "${text.trim()}"`,
              result: activeState
            });
          }
        } catch (e) {
          console.warn('Filter interaction warn:', e.message);
        }
      }
    }

    if (route.name === 'process') {
      console.log('Inspecting process stages...');
      const stageButtons = await page.$$('button');
      for (const btn of stageButtons) {
        try {
          const text = await btn.innerText();
          if (text && (text.includes('01') || text.includes('02') || text.includes('Stage'))) {
            await btn.evaluate(el => el.click());
            await page.waitForTimeout(400);
          }
        } catch (e) {
          console.warn('Process stage warn:', e.message);
        }
      }
    }

    if (route.name === 'industries') {
      console.log('Inspecting industries tabs / interactions...');
      const industryItems = await page.$$('button, [role="tab"], div[role="button"]');
      for (const item of industryItems) {
        try {
          const text = await item.innerText();
          if (text && text.length > 2 && text.length < 40) {
            await item.evaluate(el => el.click());
            await page.waitForTimeout(300);
          }
        } catch (e) {
          // ignore
        }
      }
    }

    // Test mobile nav
    try {
      await page.setViewportSize({ width: 390, height: 844 });
      const menuBtn = await page.$('button[aria-label="Open menu"], button[aria-controls="mobile-nav"]');
      if (menuBtn) {
        await menuBtn.evaluate(el => el.click());
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-390', `${route.name}-menu-open.png`) });
        interactionData.push({
          route: route.path,
          action: 'Open mobile nav',
          result: 'Menu drawer/expanded state captured'
        });
      }
    } catch (e) {
      console.warn('Mobile nav warn:', e.message);
    }

    await page.close();
  }

  await browser.close();

  // Download collected assets
  console.log(`Discovered ${collectedAssets.size} internal assets from network requests.`);
  const assetInventory = [];

  for (const assetUrl of collectedAssets) {
    try {
      const u = new URL(assetUrl);
      const pathname = u.pathname;
      if (pathname.endsWith('.js') || pathname.endsWith('.css') || pathname.endsWith('.html') || pathname === '/') continue;

      let localSubdir = 'misc';
      if (pathname.includes('/images/')) {
        localSubdir = pathname.replace(/^\/images\//, 'images/');
      } else if (pathname.includes('/media/')) {
        localSubdir = `fonts/${path.basename(pathname)}`;
      } else if (pathname.endsWith('.svg') || pathname.endsWith('.png') || pathname.endsWith('.ico')) {
        localSubdir = `icons/${path.basename(pathname)}`;
      } else if (pathname.endsWith('.woff2') || pathname.endsWith('.woff')) {
        localSubdir = `fonts/${path.basename(pathname)}`;
      }

      const dest = path.join(PUBLIC_DIR, localSubdir);
      const saved = await downloadFile(assetUrl, dest);
      assetInventory.push({
        url: assetUrl,
        localPath: path.relative(process.cwd(), dest),
        type: path.extname(pathname).replace('.', ''),
        status: saved ? 'downloaded' : (fs.existsSync(dest) ? 'cached' : 'failed')
      });
    } catch (e) {
      console.error('Error downloading:', assetUrl, e.message);
    }
  }

  // Generate Reference Audit Markdown Files
  console.log('Generating audit documentation markdown files...');

  // 1. REFERENCE_AUDIT.md
  let auditMd = `# Reference Website Audit Report

Target URL: https://ananta-cast-website-design.vercel.app/
Date of Audit: ${new Date().toISOString()}

## Summary
The reference website is a dark-themed precision engineering/foundry company ("Ananta Cast") website constructed with Next.js and Tailwind CSS.
It features seven primary routes:
- Home (\`/\`)
- About (\`/about\`)
- Capabilities (\`/capabilities\`)
- Process (\`/process\`)
- Products (\`/products\`)
- Industries (\`/industries\`)
- Contact (\`/contact\`)

## Design Tokens & Computed Values
- **Background**: \`#0b0a09\` (very dark charcoal / near black)
- **Foreground / Text**: \`#eeebe5\` (soft warm white)
- **Primary Accent ("molten")**: \`#f86111\` / \`lab(61.3135% 56.657 68.0212)\` (glowing orange)
- **Steel Accent**: \`#9ea6ab\`
- **Card Background**: \`#141211\`
- **Border**: \`rgba(255, 255, 255, 0.1)\`
- **Input Background**: \`rgba(255, 255, 255, 0.14)\`
- **Muted Background**: \`#1c1a19\`
- **Muted Foreground**: \`#95918d\`
- **Primary Font Family**: \`Inter Tight\`, ui-sans-serif, system-ui, sans-serif
- **Monospace Font Family**: \`JetBrains Mono\`, ui-monospace, monospace
- **Texture / Grain**: Subtle SVG fractal noise grain overlay in \`body.grain:after\` with opacity \`0.05\`.

## Header & Navigation Specifications
- Height: \`64px\` (\`h-16\`)
- Max width: \`1400px\` (\`max-w-[1400px]\`), horizontal padding: \`20px\` (\`px-5\`) on mobile, \`40px\` (\`px-10\`) on desktop
- Logo: Infinity loop SVG with molten orange dot on the right loop + uppercase text "Ananta Cast" (tracking \`0.18em\`, font-size \`0.95rem\`, weight \`600\`)
- Nav links: About, Capabilities, Process, Products, Industries. Font size \`14px\` (\`text-sm\`), color \`text-foreground/65\`, hover \`text-foreground\`
- CTA button: "Request a quote", pill shape (\`rounded-full\`), bg \`#eeebe5\`, text \`#0b0a09\`, height \`40px\` (\`h-10\`), hover \`bg-molten\`
- Mobile toggle: hamburger icon (Lucide \`Menu\`), reveals mobile nav accordion.

## Footer Specifications
- Logo and tagline "From Casting to Finished Product"
- Grid columns: Navigation links, Capabilities, Certifications, Contact details
- Legal copyright line & bottom links
`;
  fs.writeFileSync(path.join(AUDIT_DIR, 'REFERENCE_AUDIT.md'), auditMd);

  // 2. PAGE_STRUCTURE.md
  let pageStructureMd = `# Page Structure Audit\n\n`;
  for (const [routeName, info] of Object.entries(pageAuditData)) {
    pageStructureMd += `## Route: /${routeName === 'home' ? '' : routeName}\n`;
    pageStructureMd += `- **Title**: ${info.title}\n`;
    pageStructureMd += `- **Description**: ${info.meta.description || 'N/A'}\n`;
    pageStructureMd += `- **Sections (${info.sections.length})**:\n`;
    info.sections.forEach((sec, idx) => {
      pageStructureMd += `  ${idx + 1}. \`<${sec.tag}>\` ${sec.id ? '#' + sec.id : ''} ${sec.heading ? '— Heading: "' + sec.heading + '"' : ''} (H: ${Math.round(sec.rect.height)}px, BG: ${sec.styles.backgroundColor || sec.styles.background})\n`;
    });
    pageStructureMd += `\n`;
  }
  fs.writeFileSync(path.join(AUDIT_DIR, 'PAGE_STRUCTURE.md'), pageStructureMd);

  // 3. ASSET_INVENTORY.md
  let assetInventoryMd = `# Asset Inventory\n\nTotal assets discovered: ${assetInventory.length}\n\n`;
  assetInventoryMd += `| Original URL | Local Path | Type | Status |\n|---|---|---|---|\n`;
  assetInventory.forEach(a => {
    assetInventoryMd += `| ${a.url} | \`${a.localPath}\` | ${a.type} | ${a.status} |\n`;
  });
  fs.writeFileSync(path.join(AUDIT_DIR, 'ASSET_INVENTORY.md'), assetInventoryMd);

  // 4. ANIMATION_INVENTORY.md
  let animationMd = `# Animation Inventory

## 1. Global / Ambient
- **Scroll Progress Bar**: \`h-[2px]\`, origin-left, \`bg-molten\`, scaleX driven by scroll.
- **Background Grain**: SVG noise overlay with fixed inset \`-50%\`, opacity \`0.05\`.
- **Smooth Scroll**: Lenis smooth scroll active on root HTML (\`html.lenis\`).
- **Alloy Ticker / Marquee**: Infinite linear CSS translateX marquee moving right-to-left.

## 2. Page & Section Transitions
- **Fade / Slide Reveals**: Sections and cards reveal on scroll with translateY (16px to 24px) and opacity 0 -> 1.
- **Header Transition**: Fixed header begins transparent, transitions background to dark with backdrop blur on scroll down.
- **Button Hover States**: Fill transitions to \`#f86111\` (\`bg-molten\`), duration \`200ms\` to \`300ms\`.

## 3. Route-Specific Interactions
- **Process Timeline**: 6-stage progressive interactive switcher showing active stage card, description, details, and switching corresponding stage image.
- **Products Catalog**: Filter tabs with active pill indicator; products re-render with smooth entrance fade and responsive 3-column grid.
- **Industries Showcase**: Selectable industry cards with switching specifications, typical parts, and metallurgical compositions.
- **Contact Form**: Form input focus states with \`ring-molten\` border highlight.
`;
  fs.writeFileSync(path.join(AUDIT_DIR, 'ANIMATION_INVENTORY.md'), animationMd);

  // 5. INTERACTION_INVENTORY.md
  let interactionMd = `# Interaction Inventory\n\n`;
  interactionData.forEach(item => {
    interactionMd += `### Route: \`${item.route}\`\n`;
    interactionMd += `- **Action**: ${item.action}\n`;
    interactionMd += `- **Result**: ${JSON.stringify(item.result)}\n\n`;
  });
  fs.writeFileSync(path.join(AUDIT_DIR, 'INTERACTION_INVENTORY.md'), interactionMd);

  // Save raw data JSON for precise reconstruction
  fs.writeFileSync(path.join(AUDIT_DIR, 'raw_audit_data.json'), JSON.stringify(pageAuditData, null, 2));

  console.log('Reference audit complete! All markdown files, screenshots, and assets recorded.');
}

run().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
