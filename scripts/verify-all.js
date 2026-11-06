import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4321';
const ROUTES = ['/', '/about', '/capabilities', '/process', '/products', '/industries', '/contact'];

async function run() {
  console.log('Running final comprehensive functional and integration verification...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // 1. Verify all routes load with 200
  for (const r of ROUTES) {
    const res = await page.goto(`${BASE_URL}${r}`, { waitUntil: 'networkidle' });
    console.log(`Route: ${r} - Status: ${res.status()} - Title: "${await page.title()}"`);
    if (res.status() !== 200) throw new Error(`Route ${r} returned status ${res.status()}`);
  }

  // 2. Verify Product Filtering
  console.log('Testing Products filtering...');
  await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
  const filterButtons = await page.$$('.filter-btn');
  for (const btn of filterButtons) {
    const text = await btn.innerText();
    await btn.click();
    await page.waitForTimeout(200);
    const counter = await page.$eval('#product-counter', el => el.innerText);
    const visibleCards = await page.$$eval('.product-card:not(.hidden)', els => els.length);
    console.log(`  Filter "${text.trim()}": ${counter} (Visible cards: ${visibleCards})`);
    if (text.trim() === 'Flow control' && visibleCards !== 3) throw new Error('Flow control should show 3 cards');
    if (text.trim() === 'All' && visibleCards !== 9) throw new Error('All should show 9 cards');
  }

  // 3. Verify Industries Accordion
  console.log('Testing Industries accordion...');
  await page.goto(`${BASE_URL}/industries`, { waitUntil: 'networkidle' });
  const indItems = await page.$$('.industry-toggle');
  for (let i = 0; i < indItems.length; i++) {
    await indItems[i].click();
    await page.waitForTimeout(200);
    const isExpanded = await indItems[i].getAttribute('aria-expanded');
    console.log(`  Industry #${i + 1} expanded: ${isExpanded}`);
  }

  // 4. Verify Contact Form
  console.log('Testing Contact form validation...');
  await page.goto(`${BASE_URL}/contact`, { waitUntil: 'networkidle' });
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="company"]', 'Acme Valve Corp');
  await page.fill('input[name="email"]', 'john@acme.com');
  await page.fill('textarea[name="message"]', 'Need quote for 2,000 CF8M valve bodies.');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(300);
  const feedback = await page.$eval('#form-feedback', el => el.innerText);
  console.log(`  Contact form submitted feedback: "${feedback}"`);
  if (!feedback.includes('enquiry has been received')) throw new Error('Contact form submission feedback missing');

  // 5. Verify Mobile Menu
  console.log('Testing Mobile navigation...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  const toggle = await page.$('#mobile-nav-toggle');
  await toggle.click();
  await page.waitForTimeout(300);
  const isMenuOpen = await toggle.getAttribute('aria-expanded');
  console.log(`  Mobile menu open: ${isMenuOpen}`);
  if (isMenuOpen !== 'true') throw new Error('Mobile menu failed to open');

  console.log(`Verification complete! Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.warn('Console errors encountered:', consoleErrors);
  }

  await browser.close();
}

run().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
