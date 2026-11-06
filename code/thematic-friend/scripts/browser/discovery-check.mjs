import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const { chromium } = await import(process.env.MINGLE_PLAYWRIGHT_MODULE || 'playwright');
const captureHelper = process.env.MINGLE_CAPTURE_MODULE ? await import(process.env.MINGLE_CAPTURE_MODULE) : null;
const motionHelper = process.env.MINGLE_MOTION_MODULE ? await import(process.env.MINGLE_MOTION_MODULE) : null;
const base = process.env.MINGLE_CHECK_URL;
if (!base || !['127.0.0.1', 'localhost', '[::1]'].includes(new URL(base).hostname)) throw new Error('Use an isolated local test server.');
const password = process.env.MINGLE_CHECK_PASSWORD;
const output = process.env.MINGLE_CHECK_OUTPUT;
if (!password || !output) throw new Error('Use run-discovery-check.mjs to create fixtures and an output directory.');
const images = path.join(output, 'images');
const skipScreenshots = process.env.MINGLE_SKIP_SCREENSHOTS === '1';
if (!skipScreenshots) await fs.mkdir(images, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.MINGLE_BROWSER_PATH ? { executablePath: process.env.MINGLE_BROWSER_PATH } : {}) });
const checks = [], issues = [], screenshots = [];
const ok = (id, assertion) => { checks.push({ id, assertion, result: 'PASS' }); console.log(`PASS ${id} ${assertion}`); };
let activePage;
async function setup(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1080 }, locale: 'en-GB', ...options });
  const page = await context.newPage();
  activePage = page;
  page.on('pageerror', error => issues.push(error.message));
  page.on('response', response => { if (response.status() >= 500) issues.push(`${response.status()} ${response.url()}`); });
  const posts = [];
  page.on('request', request => { if (request.method() === 'POST' && /\/decisions\/\d+$/.test(new URL(request.url()).pathname)) posts.push(request.url()); });
  if (motionHelper) await motionHelper.installCursor(page);
  return { context, page, posts, motion: motionHelper?.createMotion(page) };
}
async function click(session, selector) {
  const target = session.page.locator(selector);
  if (session.motion) await session.motion.click(target, { pace: 'travel' }); else await target.click();
}
async function login(session, username) {
  await session.page.goto(base + '/login');
  await session.page.locator('#username').fill(username);
  await session.page.locator('#password').fill(password);
  await Promise.all([session.page.waitForURL('**/discover'), click(session, 'form button[type=submit]')]);
}
async function shot(session, name, fullPage = false) {
  if (skipScreenshots) return;
  await session.page.evaluate(() => document.fonts.ready);
  const file = path.join(images, name + '.png');
  if (captureHelper) await captureHelper.captureScreenshot(session.page, { file, cursor: 'arrow', fullPage });
  else await session.page.screenshot({ path: file, type: 'png', fullPage });
  screenshots.push(name + '.png');
}
async function filters(session, interest, goal) {
  await session.page.goto(`${base}/discover?interest=${encodeURIComponent(interest)}&goal=${encodeURIComponent(goal)}`);
  assert.equal(await session.page.locator('#interest').inputValue(), interest);
  assert.equal(await session.page.locator('#goal').inputValue(), goal);
}
async function mouseDrag(session, distance) {
  const card = session.page.locator('#swipe-card');
  await card.scrollIntoViewIfNeeded();
  const box = await card.boundingBox();
  const start = { x: box.x + box.width / 2, y: box.y + 100 };
  if (session.motion) await session.motion.move(start, { pace: 'normal' }); else await session.page.mouse.move(start.x, start.y);
  await session.page.mouse.down();
  if (session.motion) await session.motion.move({ x: start.x + distance, y: start.y + 4 }, { durationMs: 450 });
  else await session.page.mouse.move(start.x + distance, start.y + 4, { steps: 14 });
  await session.page.mouse.up();
}
async function touchDrag(session, distance) {
  await session.page.locator('#swipe-card').scrollIntoViewIfNeeded();
  const box = await session.page.locator('#swipe-card').boundingBox();
  const x = box.x + box.width * .65, y = Math.max(20, box.y + 100);
  const cdp = await session.context.newCDPSession(session.page);
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 12; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + distance * step / 12, y: y + 3 }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
async function oneDecision(session, action, expectedRoute) {
  const count = session.posts.length;
  const response = session.page.waitForResponse(r => r.request().method() === 'POST' && /\/decisions\/\d+$/.test(new URL(r.url()).pathname));
  const navigation = session.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await action();
  assert.equal((await response).status(), 302);
  await navigation;
  assert.match(new URL(session.page.url()).pathname, expectedRoute);
  assert.equal(session.posts.length - count, 1);
}
async function noOverflow(session) {
  assert.equal(await session.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
}
try {
  const jamie = await setup();
  await login(jamie, 'demo_zhou');
  await filters(jamie, 'Coffee', 'New friends');
  assert.equal(await jamie.page.locator('#discovery-count').innerText(), '1 profile available');
  assert.equal(await jamie.page.locator('#swipe-card h2').innerText(), 'Alex Lin');
  assert.equal(await jamie.page.locator('.shared-interest strong').innerText(), 'Coffee, Reading');
  await shot(jamie, '03-after-filters');
  await click(jamie, '#remove-interest-filter');
  assert.equal(await jamie.page.locator('#interest').inputValue(), '');
  assert.equal(await jamie.page.locator('#goal').inputValue(), 'New friends');
  await filters(jamie, 'Coffee', 'New friends');
  await click(jamie, '#remove-goal-filter');
  assert.equal(await jamie.page.locator('#interest').inputValue(), 'Coffee');
  assert.equal(await jamie.page.locator('#goal').inputValue(), '');
  await click(jamie, '#clear-all-filters');
  assert.equal(await jamie.page.locator('.filter-pill').count(), 0);
  ok('A-01', 'Visible filters, eligible count and actual shared interests; removing one filter preserves the other.');

  await filters(jamie, 'Coffee', 'New friends');
  const target = await jamie.page.locator('#like-form').getAttribute('action');
  const beforeShort = jamie.posts.length;
  await mouseDrag(jamie, 40);
  await jamie.page.waitForFunction(() => document.querySelector('#swipe-card').style.transform === '');
  assert.equal(jamie.posts.length, beforeShort);
  assert.equal(await jamie.page.locator('#like-form').getAttribute('action'), target);
  await shot(jamie, '04-short-drag-return');
  ok('A-04a', 'Short mouse drag returns the same card and sends zero decisions.');
  await oneDecision(jamie, () => click(jamie, '#skip-form button'), /^\/discover$/);
  assert.equal(await jamie.page.locator('#revisit-form button').innerText(), 'Revisit skipped profiles (1)');
  await shot(jamie, '05-empty-revisit');
  await click(jamie, '#revisit-form button');
  assert.equal(await jamie.page.locator('#like-form').getAttribute('action'), target);
  assert.equal(await jamie.page.locator('#interest').inputValue(), 'Coffee');
  assert.equal(await jamie.page.locator('#goal').inputValue(), 'New friends');
  await filters(jamie, 'Sport', 'Study buddy');
  assert.equal(await jamie.page.locator('#revisit-form').count(), 0);
  await shot(jamie, '06-empty-no-match');
  await click(jamie, '#empty-clear-filters');
  await jamie.page.locator('#swipe-card').waitFor();
  ok('A-05a', 'Empty results offer working clear/revisit actions; revisiting keeps filters.');

  await filters(jamie, 'Coffee', 'New friends');
  await oneDecision(jamie, () => mouseDrag(jamie, 145), /^\/discover$/);
  assert.match(await jamie.page.locator('.notice').innerText(), /Like saved/);
  ok('A-04b', 'Committed mouse swipe sends exactly one like; a one-sided like stays in discovery.');
  const alex = await setup();
  await login(alex, 'demo_lin');
  await filters(alex, 'Coffee', 'New friends');
  assert.equal(await alex.page.locator('#swipe-card h2').innerText(), 'Jamie Zhou');
  await oneDecision(alex, () => click(alex, '#like-form button'), /^\/matches\/\d+$/);
  assert.deepEqual(await alex.page.locator('#match-shared span').allTextContents(), ['Coffee', 'Reading']);
  assert.equal(await alex.page.locator('#open-conversation').innerText(), 'Say hello to Jamie Zhou');
  const matchUrl = alex.page.url(), conversation = await alex.page.locator('#open-conversation').getAttribute('href');
  assert.equal(new URL(matchUrl).pathname.split('/').pop(), conversation.split('/').pop());
  await shot(alex, '07-match-success');
  await click(alex, '#keep-discovering');
  assert.equal(await alex.page.locator('#interest').inputValue(), 'Coffee');
  assert.equal(await alex.page.locator('#goal').inputValue(), 'New friends');
  await alex.page.goto(matchUrl);
  await click(alex, '#open-conversation');
  assert.equal(new URL(alex.page.url()).pathname, conversation);
  assert.equal(await alex.page.locator('.chat-heading h1').innerText(), 'Jamie Zhou');
  await jamie.page.goto(base + conversation);
  const message = 'Coffee and a good book sounds like a lovely start.';
  await alex.page.locator('#body').fill(message);
  await click(alex, '#message-form button');
  await jamie.page.getByText(message, { exact: true }).waitFor({ timeout: 10000 });
  await shot(alex, '08-correct-conversation');
  ok('A-03/A-05b', 'Reciprocal button like opens real feedback, correct chat and a message received by the other participant.');

  const keyboard = await setup();
  await login(keyboard, 'demo_xu');
  await oneDecision(keyboard, async () => {
    await keyboard.page.locator('#swipe-card').focus();
    await keyboard.page.keyboard.down('ArrowRight');
    await keyboard.page.keyboard.down('ArrowRight');
    await keyboard.page.keyboard.up('ArrowRight');
  }, /^\/discover$/);
  ok('A-04c', 'Repeated arrow-key events during commitment submit one decision.');

  const mobile = await setup({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await login(mobile, 'demo_chen');
  await noOverflow(mobile);
  await shot(mobile, '09-mobile-discover', true);
  const mobileBefore = mobile.posts.length, mobileTarget = await mobile.page.locator('#skip-form').getAttribute('action');
  await touchDrag(mobile, -35);
  await mobile.page.waitForFunction(() => document.querySelector('#swipe-card').style.transform === '');
  assert.equal(mobile.posts.length, mobileBefore);
  assert.equal(await mobile.page.locator('#skip-form').getAttribute('action'), mobileTarget);
  await oneDecision(mobile, () => touchDrag(mobile, -140), /^\/discover$/);
  await noOverflow(mobile);
  ok('A-04d', '390 px emulated touch: short drag returns; committed swipe submits once.');
  await filters(mobile, 'Sport', 'Study buddy');
  await noOverflow(mobile);
  await click(mobile, '#empty-clear-filters');
  await mobile.page.locator('#swipe-card').waitFor();
  await click(mobile, '.language-switch a[lang=zh]');
  assert.equal(await mobile.page.locator('html').getAttribute('lang'), 'zh');
  await noOverflow(mobile);
  await shot(mobile, '11-mobile-chinese', true);
  await oneDecision(mobile, () => click(mobile, '#skip-form button'), /^\/discover$/);
  ok('A-06a', '390 px discovery/empty states and Chinese controls have no horizontal overflow and submit the same action.');

  const smallMatch = await setup({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  await login(smallMatch, 'demo_lin');
  await smallMatch.page.goto(matchUrl);
  await noOverflow(smallMatch);
  assert.equal(await smallMatch.page.locator('#open-conversation').getAttribute('href'), conversation);
  await shot(smallMatch, '10-mobile-match', true);
  await click(smallMatch, '.language-switch a[lang=zh]');
  assert.equal(await smallMatch.page.locator('#open-conversation').getAttribute('href'), conversation);
  assert.match(await smallMatch.page.locator('#match-title').innerText(), /互相喜欢/);
  await noOverflow(smallMatch);
  await click(smallMatch, '#open-conversation');
  assert.equal(new URL(smallMatch.page.url()).pathname, conversation);
  ok('A-06b', '390 px match feedback and Chinese/reduced-motion mode preserve the conversation destination.');

  const reduced = await setup({ reducedMotion: 'reduce' });
  await login(reduced, 'demo_he');
  assert.equal(await reduced.page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
  await shot(reduced, '12-reduced-motion');
  await oneDecision(reduced, () => click(reduced, '#skip-form button'), /^\/discover$/);
  ok('A-06c', 'Reduced-motion button decision submits once.');

  const pending = await setup();
  await login(pending, 'demo_su');
  await filters(pending, 'Coffee', 'New friends');
  const actedTarget = await pending.page.locator('#skip-form').getAttribute('action');
  let observePending;
  const pendingObserved = new Promise(resolve => { observePending = resolve; });
  await pending.page.exposeFunction('recordPendingState', state => observePending(state));
  await pending.page.evaluate(() => {
    const status = document.querySelector('#decision-status');
    const observer = new MutationObserver(() => {
      if (!status.textContent) return;
      observer.disconnect();
      const state = {
        text: status.textContent,
        busy: document.querySelector('#swipe-card').getAttribute('aria-busy'),
        disabled: document.querySelectorAll('.action-button:disabled').length
      };
      // Exercise the duplicate guard before the browser starts a navigation.
      document.querySelector('#like-form').requestSubmit();
      window.recordPendingState(state);
    });
    observer.observe(status, { childList: true });
  });
  let releaseDecision, signalIntercept;
  const heldDecision = new Promise(resolve => { releaseDecision = resolve; });
  const intercepted = new Promise(resolve => { signalIntercept = resolve; });
  await pending.page.route('**/decisions/*', async route => {
    signalIntercept();
    await heldDecision;
    await route.continue();
  });
  const beforePending = pending.posts.length;
  const pendingButton = await pending.page.locator('#skip-form button').boundingBox();
  await pending.page.mouse.click(pendingButton.x + pendingButton.width / 2, pendingButton.y + pendingButton.height / 2);
  const pendingState = await pendingObserved;
  await intercepted;
  assert.equal(pendingState.text, 'Saving your choice…');
  assert.equal(pendingState.busy, 'true');
  assert.equal(pendingState.disabled, 2);
  assert.equal(pending.posts.length - beforePending, 1);
  const savedNavigation = pending.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  releaseDecision();
  await savedNavigation;
  await pending.page.unroute('**/decisions/*');
  assert.equal(pending.posts.length - beforePending, 1);
  ok('A-INT-UI-01', 'A delayed response shows saving/busy feedback; duplicate input cannot submit a second decision.');

  await pending.page.goBack({ waitUntil: 'domcontentloaded' });
  await pending.page.waitForFunction(target => {
    const form = document.querySelector('#skip-form');
    return form && form.getAttribute('action') !== target && !form.querySelector('button').disabled;
  }, actedTarget);
  assert.equal(await pending.page.locator('#interest').inputValue(), 'Coffee');
  // Browsers may choose a fresh load instead of BFCache. Exercise the persisted
  // pageshow branch explicitly as well; this is a simulated event, not a claim
  // that this Edge run naturally restored a BFCache entry.
  const historyRefresh = pending.page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await pending.page.evaluate(() => {
    document.querySelector('#skip-form button').disabled = true;
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await historyRefresh;
  assert.equal(await pending.page.locator('#skip-form button').isEnabled(), true);
  assert.notEqual(await pending.page.locator('#skip-form').getAttribute('action'), actedTarget);
  assert.equal(await pending.page.locator('#decision-status').innerText(), '');
  ok('A-INT-UI-02', 'Real Back navigation and an explicit persisted-pageshow event refresh eligibility and restore usable controls.');

  const noScript = await setup({ javaScriptEnabled: false });
  await login(noScript, 'demo_he');
  await filters(noScript, 'Coffee', 'New friends');
  await oneDecision(noScript, () => click(noScript, '#like-form button'), /^\/discover$/);
  assert.match(await noScript.page.locator('.notice').innerText(), /Like saved/);
  ok('A-INT-UI-03', 'With JavaScript disabled, native CSRF-protected buttons still submit the same validated action.');

  const stale = await setup({ viewport: { width: 390, height: 844 } });
  await login(stale, 'demo_xu');
  await filters(stale, 'Coffee', 'New friends');
  const staleTarget = await stale.page.locator('#like-form').getAttribute('action');
  const targetName = await stale.page.locator('#swipe-card h2').innerText();
  const targetLogin = { 'Jamie Zhou': 'demo_zhou', 'Alex Lin': 'demo_lin' }[targetName];
  assert.ok(targetLogin, 'The stale-card fixture must be one of the known fictional Coffee profiles.');
  const hiding = await setup();
  await login(hiding, targetLogin);
  await hiding.page.goto(base + '/profile');
  await hiding.page.locator('input[type="checkbox"][name="discoverable"]').uncheck();
  await Promise.all([hiding.page.waitForNavigation(), click(hiding, 'form.stack-form button[type=submit]')]);
  const staleResponse = stale.page.waitForResponse(r => r.request().method() === 'POST' && r.url().endsWith(staleTarget));
  await click(stale, '#like-form button');
  assert.equal((await staleResponse).status(), 404);
  assert.match(await stale.page.locator('#recovery-filters').innerText(), /Your filters are kept/);
  await noOverflow(stale);
  await click(stale, '#recovery-discover');
  assert.equal(await stale.page.locator('#interest').inputValue(), 'Coffee');
  assert.equal(await stale.page.locator('#goal').inputValue(), 'New friends');
  assert.notEqual(await stale.page.locator('#like-form').getAttribute('action'), staleTarget);
  await noOverflow(stale);
  ok('A-INT-UI-04', 'A profile hidden in another session returns a real 404; recovery keeps both filters at 390 px.');

  await alex.page.goto(base + conversation);
  await click(alex, '.chat-menu summary');
  alex.page.once('dialog', dialog => dialog.accept());
  await Promise.all([alex.page.waitForURL('**/connections'), click(alex, 'form[action$="/end"] button')]);
  const closedMatch = await jamie.page.goto(matchUrl);
  assert.equal(closedMatch.status(), 403);
  assert.equal(await jamie.page.locator('#open-conversation').count(), 0);
  assert.equal(await jamie.page.locator('#recovery-discover').getAttribute('href'), '/discover?interest=Coffee&goal=New%20friends');
  ok('A-INT-UI-05', 'Ending the connection denies an old match link and keeps a usable, filtered discovery destination.');
  assert.deepEqual(issues, []);
  ok('RUNTIME', 'No browser exceptions or HTTP 5xx responses during these flows.');
} catch (error) {
  issues.push(error.stack || error.message);
  console.error(error.stack || error.message);
  process.exitCode = 1;
  if (!skipScreenshots && activePage && !activePage.isClosed()) await activePage.screenshot({ path: path.join(images, 'failure.png'), fullPage: true }).catch(() => {});
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({ capturedAt: new Date().toISOString(), browser: browser.version(), checks, issues, screenshots, exitCode: process.exitCode || 0 }, null, 2) + '\n');
  await browser.close();
}
