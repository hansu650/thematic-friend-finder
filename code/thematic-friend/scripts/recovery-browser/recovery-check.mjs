import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const { chromium } = await import(process.env.MINGLE_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MINGLE_CHECK_URL;
const output = process.env.MINGLE_CHECK_OUTPUT;
const password = process.env.MINGLE_CHECK_PASSWORD;
if (!base || !output || !password) throw Error('Use run-conversation-check.mjs with MINGLE_CHECK_SCRIPT=../recovery-browser/recovery-check.mjs');
const englishOnly = process.env.TONGPIN_CHINESE_ENABLED === 'false';
const browser = await chromium.launch({ headless: true, ...(process.env.MINGLE_BROWSER_PATH ? { executablePath: process.env.MINGLE_BROWSER_PATH } : {}) });
const checks = [], issues = [], screenshots = [];
const ok = (id, detail) => { checks.push({ id, detail, result: 'PASS' }); console.log('PASS ' + id + ' ' + detail); };
let activePage;
async function session(user) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 900 }, locale: 'zh-CN' });
  const page = await context.newPage(); activePage = page;
  page.setDefaultTimeout(12000);
  page.on('pageerror', e => issues.push(e.message));
  page.on('response', r => { if (r.status() >= 500) issues.push(r.status() + ' ' + r.url()); });
  if (user) {
    await page.goto(base + '/login');
    await page.locator('#username').fill(user); await page.locator('#password').fill(password);
    await Promise.all([page.waitForURL('**/explore'), page.locator('form[action="/login"] button[type=submit]').click()]);
  }
  return page;
}
async function submit(page, selector) { await Promise.all([page.waitForNavigation(), page.locator(selector).click()]); }
async function capture(page, name) {
  await page.evaluate(() => document.fonts.ready);
  const file = path.join(output, name + '.png');
  if (process.env.MINGLE_CAPTURE_MODULE) {
    const { captureScreenshot } = await import(process.env.MINGLE_CAPTURE_MODULE);
    await captureScreenshot(page, { file, cursor: 'arrow' });
  } else await page.screenshot({ path: file, type: 'png' });
  screenshots.push(name + '.png');
}
try {
  const home = await session();
  await home.goto(base + '/?lang=' + (englishOnly ? 'zh' : 'en'));
  assert.equal(await home.locator('html').getAttribute('lang'), 'en');
  assert.match(await home.locator('#home-title').innerText(), /Find friends/);
  assert.equal(await home.locator('.hinge-copy h2').innerText(), 'Meet up over a shared hobby.');
  if (englishOnly) assert.equal(await home.locator('a[href*="lang=zh"]').count(), 0);
  ok('HOME', 'Friendship copy is rendered in English, including a Chinese-browser session.');

  const first = await session('demo_zhou'), second = await session('demo_lin'), third = await session('demo_chen');
  await first.goto(base + '/events?lang=' + (englishOnly ? 'zh' : 'en'));
  assert.equal(await first.locator('html').getAttribute('lang'), 'en');
  if (englishOnly) assert.equal(await first.locator('a[href*="lang=zh"]').count(), 0);
  else {
    await first.locator('.site-account>summary').click();
    assert.equal(await first.locator('.site-account .language-switch').isVisible(), true);
    await first.locator('.site-account a[href*="lang=zh"]').click();
    assert.equal(await first.locator('html').getAttribute('lang'), 'zh');
    await first.goto(base + '/events?lang=en');
  }
  ok('LANGUAGE', englishOnly ? 'Final mode hides language controls and ignores lang=zh.' : 'Tablet account menu retains a working development language switch.');
  const seededPaths = await first.locator('.event-card').evaluateAll(nodes => nodes.map(n => new URL(n.href).pathname));
  assert.equal(seededPaths.length, 18);
  for (const eventPath of seededPaths) {
    await first.goto(base + eventPath);
    const details = await first.locator('.detail-copy>h1,.detail-description,.event-info').allInnerTexts();
    assert.doesNotMatch(details.join('\n'), /[\u3400-\u9fff]/);
  }
  ok('DATA', 'All 18 freshly seeded event titles, descriptions and location details are English. Existing databases are outside this check.');

  await first.goto(base + '/events/new');
  for (const [id, value] of Object.entries({ title: 'Recovery check coffee', description: 'Fictional capacity recovery fixture.', city: 'Wuhan', venue: 'Test cafe', capacity: '2' })) await first.locator('#' + id).fill(value);
  const future = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16);
  await first.locator('#startsAt').fill(future);
  await submit(first, 'main form button[type=submit]');
  const eventPath = new URL(first.url()).pathname;
  await first.goto(base + eventPath); await second.goto(base + eventPath); await third.goto(base + eventPath);
  const attendance = 'form[action$="/attendance"] button';
  await submit(first, attendance); await submit(second, attendance);
  // Third still has the real pre-capacity page: submitting it exercises the server conflict path.
  await submit(third, attendance);
  assert.equal(await third.locator('.error-page .eyebrow').innerText(), '409');
  const recovery = third.getByRole('link', { name: 'Back to this event', exact: true });
  assert.equal(await recovery.getAttribute('href'), eventPath);
  assert.equal(await third.getByRole('link', { name: 'Browse other events', exact: true }).getAttribute('href'), '/events');
  await capture(third, 'event-full-recovery');
  await recovery.click();
  assert.equal(await third.locator(attendance).isDisabled(), true);
  await submit(second, attendance);
  await third.reload(); await submit(third, attendance);
  assert.equal(await third.locator('form[action$="/attendance"] input[name=attending]').inputValue(), 'false');
  assert.equal(await third.locator('.attendee').count(), 2);
  ok('EVENT', 'A stale capacity race returns local recovery links; after cancellation the third account can join without exceeding capacity.');

  await first.goto(base + '/connections');
  for (const width of [390, 768]) {
    await first.setViewportSize({ width, height: 844 });
    assert.equal(await first.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    assert.equal(await first.locator('.inbox-list-pane').evaluate(e => getComputedStyle(e).minWidth), '0px');
  }
  ok('LAYOUT', 'B’s zero minimum width remains applied and the inbox fits at 390 and 768 emulated pixels.');
  assert.deepEqual(issues, []);
} catch (error) {
  issues.push(error.stack || error.message); process.exitCode = 1; console.error(error);
  if (activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(output, 'failure.png') }).catch(() => {});
} finally {
  await fs.writeFile(path.join(output, 'recovery-results.json'), JSON.stringify({ recordedAt: new Date().toISOString(), englishOnly, browser: browser.version(), checks, issues, screenshots, exitCode: process.exitCode || 0 }, null, 2) + '\n');
  await browser.close();
}
