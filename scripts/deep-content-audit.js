import { chromium } from 'playwright';
import fs from 'fs';

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'capabilities', path: '/capabilities' },
  { name: 'process', path: '/process' },
  { name: 'products', path: '/products' },
  { name: 'industries', path: '/industries' },
  { name: 'contact', path: '/contact' }
];

const REF_BASE = 'https://ananta-cast-website-design.vercel.app';
const LOC_BASE = 'http://localhost:4321';

async function extractPageTexts(page) {
  return await page.evaluate(async () => {
    // Scroll down slowly to trigger all reveals
    const totalHeight = document.documentElement.scrollHeight;
    const distance = 400;
    for (let pos = 0; pos < totalHeight; pos += distance) {
      window.scrollTo(0, pos);
      await new Promise(r => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 200));

    // Collect all elements with non-empty text
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, dt, dd, li, label, input, textarea'));
    const items = [];

    for (const el of elements) {
      // Direct text or important input value/placeholder
      let text = '';
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        text = el.placeholder || el.value || '';
      } else {
        // Only if it doesn't have child block text elements or if it's a leaf/direct container
        const directText = Array.from(el.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent.trim())
          .join(' ');
        text = el.innerText.trim();
      }

      if (text && text.length > 0) {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        items.push({
          tag: el.tagName.toLowerCase(),
          text: text.replace(/\s+/g, ' '),
          classes: el.className,
          rect: { width: Math.round(rect.width), height: Math.round(rect.height), top: Math.round(rect.top + window.scrollY) },
          computed: {
            opacity: style.opacity,
            visibility: style.visibility,
            display: style.display,
            color: style.color,
            fontSize: style.fontSize,
            fontWeight: style.fontWeight
          }
        });
      }
    }
    return items;
  });
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  const auditReport = {};

  for (const r of ROUTES) {
    console.log(`Auditing content & motion for: ${r.name} (${r.path})`);
    const pageRef = await context.newPage();
    const pageLoc = await context.newPage();

    await pageRef.goto(`${REF_BASE}${r.path}`, { waitUntil: 'networkidle' });
    await pageLoc.goto(`${LOC_BASE}${r.path}`, { waitUntil: 'networkidle' });

    const refTexts = await extractPageTexts(pageRef);
    const locTexts = await extractPageTexts(pageLoc);

    // Filter unique meaningful text snippets
    const refUnique = Array.from(new Set(refTexts.map(t => t.text))).filter(t => t.length > 2);
    const locUnique = Array.from(new Set(locTexts.map(t => t.text))).filter(t => t.length > 2);

    const missingInLoc = refUnique.filter(t => !locUnique.some(lt => lt.includes(t) || t.includes(lt)));
    const extraInLoc = locUnique.filter(t => !refUnique.some(rt => rt.includes(t) || t.includes(rt)));

    // Check for invisible/opacity 0 text in local
    const invisibleLoc = locTexts.filter(t => t.computed.opacity === '0' || t.computed.visibility === 'hidden');

    auditReport[r.name] = {
      refCount: refUnique.length,
      locCount: locUnique.length,
      missingInLoc,
      extraInLoc,
      invisibleLoc: invisibleLoc.map(t => ({ tag: t.tag, text: t.text.slice(0, 40), opacity: t.computed.opacity }))
    };

    console.log(`  Reference unique texts: ${refUnique.length}, Local unique texts: ${locUnique.length}`);
    console.log(`  Missing in local: ${missingInLoc.length}`);
    if (missingInLoc.length > 0) {
      console.log('    Missing items:', missingInLoc.slice(0, 10));
    }
    if (invisibleLoc.length > 0) {
      console.log('    Invisible items in local:', invisibleLoc.length);
    }

    await pageRef.close();
    await pageLoc.close();
  }

  await browser.close();
  fs.writeFileSync('visual-qa/deep_content_audit.json', JSON.stringify(auditReport, null, 2));
  console.log('Audit complete, saved to visual-qa/deep_content_audit.json');
}

run().catch(console.error);
