import { chromium } from 'playwright';

const LOC_URL = 'http://localhost:4321/';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1272, height: 968 }
  });
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.message));

  console.log('Navigating to local homepage...');
  await page.goto(LOC_URL, { waitUntil: 'networkidle' });

  // 1. Verify Hero
  console.log('1. Checking Hero headline entrance...');
  const heroLines = await page.$$('.animate-slide-up-1, .animate-slide-up-2, .animate-slide-up-3');
  console.log(`  Found ${heroLines.length} staggered hero headline lines.`);

  // 2. Verify Section 02 - Statement
  console.log('2. Checking Why Ananta word reveal...');
  const words = await page.$$('[data-statement-target] .reveal-word');
  console.log(`  Found ${words.length} split word spans.`);

  // 3. Verify Section 03 - Process sequence transitions
  console.log('3. Checking Process Sequence across 6 stages...');
  const processSec = await page.$('#process');
  const processBox = await processSec.boundingBox();

  // Scroll through process stages
  for (let s = 0; s < 6; s++) {
    const stageScrollY = processBox.y + (s / 5.5) * (processBox.height - 968);
    await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), stageScrollY);
    await page.waitForTimeout(100);

    const activeInfo = await page.evaluate(() => {
      const activeItem = document.querySelector('.stage-content-item[style*="opacity: 1"]');
      const counter = document.getElementById('process-counter')?.textContent;
      const activeNav = document.querySelector('ol[aria-label="Process stages"] li[aria-current="step"]')?.textContent;
      return {
        counter,
        activeNav,
        title: activeItem?.querySelector('h3')?.textContent
      };
    });
    console.log(`  Stage ${s + 1} scroll position (${Math.round(stageScrollY)}px):`, activeInfo);
  }

  // 4. Verify Section 04 - Result frame & text transitions
  console.log('4. Checking Result section frame and text transitions...');
  const resultSec = await page.$('.result-section');
  const resultDocTop = await page.evaluate(() => {
    const el = document.querySelector('.result-section');
    return el.getBoundingClientRect().top + window.scrollY;
  });
  const resultHeight = await page.evaluate(() => document.querySelector('.result-section').offsetHeight);

  // Initial result scroll (15% through section)
  const resScroll1 = resultDocTop + 0.15 * (resultHeight - 968);
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), resScroll1);
  await page.waitForTimeout(100);
  const resState1 = await page.evaluate(() => {
    const frame = document.querySelector('.result-frame');
    const heading = document.querySelector('.result-heading-block');
    const specs = document.querySelector('.result-specs');
    return {
      frameWidth: frame?.style.width,
      headingOpacity: heading?.style.opacity,
      specsOpacity: specs?.style.opacity
    };
  });
  console.log('  Result at 15% scroll:', resState1);

  // Late result scroll (85% through section - fully expanded)
  const resScroll2 = resultDocTop + 0.85 * (resultHeight - 968);
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), resScroll2);
  await page.waitForTimeout(100);
  const resState2 = await page.evaluate(() => {
    const frame = document.querySelector('.result-frame');
    const heading = document.querySelector('.result-heading-block');
    const specs = document.querySelector('.result-specs');
    return {
      frameWidth: frame?.style.width,
      headingOpacity: heading?.style.opacity,
      specsOpacity: specs?.style.opacity
    };
  });
  console.log('  Result at 85% scroll:', resState2);

  // 5. Verify Section 05 - Components horizontal track
  console.log('5. Checking Components horizontal showcase track...');
  const compDocTop = await page.evaluate(() => {
    const el = document.querySelector('.horizontal-showcase-section');
    return el.getBoundingClientRect().top + window.scrollY;
  });
  const compHeight = await page.evaluate(() => document.querySelector('.horizontal-showcase-section').offsetHeight);
  const compScroll = compDocTop + 0.5 * (compHeight - 968);
  await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), compScroll);
  await page.waitForTimeout(100);
  const trackTransform = await page.evaluate(() => {
    return document.querySelector('.horizontal-track')?.style.transform;
  });
  console.log('  Components track transform at 50% scroll:', trackTransform);

  // 6. Verify Section 06 - Capabilities specs stagger
  console.log('6. Checking Capabilities specs stagger delays...');
  const capDelays = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#capabilities dl [data-reveal]'));
    return rows.map(r => r.getAttribute('data-delay'));
  });
  console.log('  Capabilities row delays:', capDelays);

  // 7. Verify Section 07 - Industries stagger & parallax
  console.log('7. Checking Industries row stagger delays...');
  const indDelays = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#industries ul [data-reveal]'));
    return rows.map(r => r.getAttribute('data-delay'));
  });
  console.log('  Industries row delays:', indDelays);

  // 8. Verify Section 08 - Contact form
  console.log('8. Checking Contact form reveal...');
  const contactDelays = await page.evaluate(() => {
    const blocks = Array.from(document.querySelectorAll('#contact [data-reveal]'));
    return blocks.map(b => b.getAttribute('data-delay') || '0');
  });
  console.log('  Contact column delays:', contactDelays);

  console.log(`\nVerification complete! Total console errors: ${errors.length}`);
  if (errors.length > 0) {
    console.error('Errors found:', errors);
  }

  await browser.close();
}

main().catch(console.error);
