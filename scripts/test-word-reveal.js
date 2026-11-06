import { chromium } from 'playwright';
import fs from 'fs';

const REF_URL = 'https://ananta-cast-website-design.vercel.app/';
const LOC_URL = 'http://localhost:4321/';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const dir = 'visual-qa/word_reveal_diff';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const context = await browser.newContext({
    viewport: { width: 1272, height: 968 },
    deviceScaleFactor: 1
  });

  const refPage = await context.newPage();
  const locPage = await context.newPage();

  console.log('Loading reference and local pages...');
  await Promise.all([
    refPage.goto(REF_URL, { waitUntil: 'networkidle' }),
    locPage.goto(LOC_URL, { waitUntil: 'networkidle' })
  ]);

  // Find scroll target positions for the Why Ananta section
  const refTarget = await refPage.$('[aria-label="Why Ananta"]');
  const locTarget = await locPage.$('[aria-label="Why Ananta"]');

  const refBox = await refTarget.boundingBox();
  const locBox = await locTarget.boundingBox();

  console.log('Why Ananta section positions:', { refY: refBox.y, locY: locBox.y });

  // Test across multiple scroll offsets through the section
  // In Framer Motion: offset: ["start 0.85", "end 0.45"]
  // Container starts entering at rect.top = 0.85 * vh => scrollY ≈ targetTop - 0.85 * vh
  // Container ends at rect.bottom = 0.45 * vh => scrollY ≈ targetBottom - 0.45 * vh
  const vh = 968;
  const startScroll = Math.max(0, locBox.y - 0.85 * vh);
  const endScroll = locBox.y + locBox.height - 0.45 * vh;
  const steps = [
    { name: '01_initial_muted', progress: 0.0 },
    { name: '02_first_words', progress: 0.25 },
    { name: '03_middle_words', progress: 0.50 },
    { name: '04_most_words', progress: 0.75 },
    { name: '05_fully_revealed', progress: 1.00 },
    { name: '06_reverse_scroll', progress: 0.10 } // test scrub reverse
  ];

  console.log(`Scroll range: ${startScroll}px to ${endScroll}px`);

  for (const step of steps) {
    const scrollY = Math.round(startScroll + step.progress * (endScroll - startScroll));
    console.log(`Testing ${step.name} at scrollY: ${scrollY}px (progress: ${step.progress})`);

    await Promise.all([
      refPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY),
      locPage.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY)
    ]);

    await new Promise((r) => setTimeout(r, 150));

    // Capture screenshot of section
    const refPath = `${dir}/${step.name}_ref.png`;
    const locPath = `${dir}/${step.name}_loc.png`;

    await refPage.screenshot({ path: refPath });
    await locPage.screenshot({ path: locPath });

    // Inspect word opacities on local page
    const wordStates = await locPage.evaluate(() => {
      const words = Array.from(document.querySelectorAll('[data-statement-target] .reveal-word'));
      return {
        count: words.length,
        firstWord: {
          text: words[0]?.textContent,
          opacity: window.getComputedStyle(words[0]).opacity,
          transform: window.getComputedStyle(words[0]).transform
        },
        middleWord: {
          text: words[Math.floor(words.length / 2)]?.textContent,
          opacity: window.getComputedStyle(words[Math.floor(words.length / 2)]).opacity,
          transform: window.getComputedStyle(words[Math.floor(words.length / 2)]).transform
        },
        lastWord: {
          text: words[words.length - 1]?.textContent,
          opacity: window.getComputedStyle(words[words.length - 1]).opacity,
          transform: window.getComputedStyle(words[words.length - 1]).transform
        }
      };
    });

    console.log(`  Local word states:`, wordStates);
  }

  await browser.close();
  console.log('Word reveal test complete! Screenshots saved in ' + dir);
}

main().catch(console.error);
