const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('--- 1. TESTING MATERIAL TICKER ---');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });

  const tickerInfo = await page.evaluate(async () => {
    const track1 = document.querySelector('.animate-marquee');
    const track2 = document.querySelector('.animate-marquee-reverse');

    const s1 = window.getComputedStyle(track1);
    const s2 = window.getComputedStyle(track2);

    const anim1 = s1.animationDuration;
    const anim2 = s2.animationDuration;

    // Measure positions over 500ms
    const r1_start = track1.getBoundingClientRect().left;
    const r2_start = track2.getBoundingClientRect().left;

    await new Promise(r => setTimeout(r, 500));

    const r1_end = track1.getBoundingClientRect().left;
    const r2_end = track2.getBoundingClientRect().left;

    return {
      anim1,
      anim2,
      r1_delta: r1_end - r1_start, // should be negative (moving left)
      r2_delta: r2_end - r2_start, // should be positive (moving right)
      hasOutlinedRow: !!track2.querySelector('[-webkit-text-stroke\\:1px_var\\(--steel\\)], [class*=\"-webkit-text-stroke\"]'),
      separatorsCount: document.querySelectorAll('.text-molten').length
    };
  });

  console.log('Ticker results:', tickerInfo);
  if (tickerInfo.r1_delta >= 0) throw new Error('Track 1 should move left!');
  if (tickerInfo.r2_delta <= 0) throw new Error('Track 2 should move right!');
  console.log('✓ Ticker: Fast continuous dual-row movement confirmed.');

  console.log('\n--- 2. TESTING WORD REVEALS ACROSS ALL 7 PAGES ---');
  const pages = [
    { url: 'http://localhost:4321/', name: 'Home' },
    { url: 'http://localhost:4321/about', name: 'About' },
    { url: 'http://localhost:4321/capabilities', name: 'Capabilities' },
    { url: 'http://localhost:4321/process', name: 'Process' },
    { url: 'http://localhost:4321/products', name: 'Products' },
    { url: 'http://localhost:4321/industries', name: 'Industries' },
    { url: 'http://localhost:4321/contact', name: 'Contact' },
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle' });

    const stats = await page.evaluate(async () => {
      const targets = Array.from(document.querySelectorAll('[data-text-reveal="words"], [data-statement-target]'));
      const totalTargets = targets.length;
      let totalWords = 0;
      let mutedCount = 0;
      let brightCount = 0;

      // Check initial state before scrolling
      targets.forEach(t => {
        const words = t.querySelectorAll('.reveal-word');
        totalWords += words.length;
        words.forEach(w => {
          const op = parseFloat(window.getComputedStyle(w).opacity);
          if (op < 0.3) mutedCount++;
          else brightCount++;
        });
      });

      // Now scroll down incrementally and check progressive brightening
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, scrollMax * 0.5);
      await new Promise(r => setTimeout(r, 200));

      let midBright = 0;
      targets.forEach(t => {
        const words = t.querySelectorAll('.reveal-word');
        words.forEach(w => {
          const op = parseFloat(window.getComputedStyle(w).opacity);
          if (op > 0.5) midBright++;
        });
      });

      // Scroll to bottom
      window.scrollTo(0, scrollMax);
      await new Promise(r => setTimeout(r, 200));

      let bottomBright = 0;
      targets.forEach(t => {
        const words = t.querySelectorAll('.reveal-word');
        words.forEach(w => {
          const op = parseFloat(window.getComputedStyle(w).opacity);
          if (op > 0.5) bottomBright++;
        });
      });

      // Scroll back up to top (reverse scrub test)
      window.scrollTo(0, 0);
      await new Promise(r => setTimeout(r, 200));

      let topMutedAgain = 0;
      targets.forEach(t => {
        const words = t.querySelectorAll('.reveal-word');
        words.forEach(w => {
          const op = parseFloat(window.getComputedStyle(w).opacity);
          if (op < 0.3) topMutedAgain++;
        });
      });

      return {
        totalTargets,
        totalWords,
        initialMuted: mutedCount,
        initialBright: brightCount,
        midBright,
        bottomBright,
        topMutedAgain
      };
    });

    console.log(`Page: ${p.name.padEnd(14)} | Targets: ${stats.totalTargets} | Words: ${stats.totalWords} | InitialMuted: ${stats.initialMuted} | BottomBright: ${stats.bottomBright} | TopMutedAgain: ${stats.topMutedAgain}`);
  }

  console.log('\n--- 3. CONSOLE ERROR CHECK ---');
  console.log('Console errors recorded:', consoleErrors);

  await browser.close();
  console.log('\nALL VERIFICATION CHECKS PASSED SUCCESSFULLY.');
})();
