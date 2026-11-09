import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium } = await import(process.env.MINGLE_PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MINGLE_CHECK_URL;
const password = process.env.MINGLE_CHECK_PASSWORD;
const output = process.env.MINGLE_CHECK_OUTPUT;
if (!base || !password || !output) throw new Error('Run this check through run-conversation-check.mjs.');
const images = path.join(output, 'images');
await fs.mkdir(images, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.MINGLE_BROWSER_PATH ? { executablePath: process.env.MINGLE_BROWSER_PATH } : {})
});
const checks = [];
const issues = [];
const screenshots = [];
let activePage;
const ok = (id, assertion) => {
  checks.push({ id, assertion, result: 'PASS' });
  console.log(`PASS ${id} ${assertion}`);
};

async function setup(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-GB', ...options });
  const page = await context.newPage();
  activePage = page;
  page.on('pageerror', error => issues.push(error.message));
  page.on('response', response => {
    if (response.status() >= 500) issues.push(`${response.status()} ${response.url()}`);
  });
  return { context, page };
}

async function login(session, username) {
  await session.page.goto(base + '/login');
  await session.page.locator('#username').fill(username);
  await session.page.locator('#password').fill(password);
  await Promise.all([
    session.page.waitForURL('**/discover'),
    session.page.locator('form button[type=submit]').click()
  ]);
}

async function filters(session, interest, goal) {
  await session.page.goto(`${base}/discover?interest=${encodeURIComponent(interest)}&goal=${encodeURIComponent(goal)}`);
}

async function likeProfileNamed(session, name) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const card = session.page.locator('#swipe-card');
    if (await card.count() === 0) throw new Error(`No eligible card found before ${name}.`);
    if (await session.page.locator('#swipe-card h2').innerText() === name) {
      await Promise.all([session.page.waitForNavigation(), session.page.locator('#like-form button').click()]);
      return;
    }
    await Promise.all([session.page.waitForNavigation(), session.page.locator('#skip-form button').click()]);
  }
  throw new Error(`Could not find ${name} in the filtered discovery list.`);
}

async function screenshot(session, name, fullPage = false) {
  await session.page.evaluate(() => document.fonts.ready);
  await session.page.screenshot({ path: path.join(images, name), type: 'png', fullPage });
  screenshots.push(name);
}

async function postForm(page, action, fields) {
  return page.evaluate(async ({ action, fields }) => {
    const token = document.querySelector('meta[name="_csrf"]').content;
    const header = document.querySelector('meta[name="_csrf_header"]').content;
    const response = await fetch(action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        [header]: token
      },
      body: new URLSearchParams(fields)
    });
    return response.status;
  }, { action, fields });
}

async function sendMessage(page, action, text) {
  return postForm(page, action, { body: text });
}

async function messageIds(page) {
  return page.locator('#messages .message[data-message-id]').evaluateAll(rows =>
    rows.map(row => Number(row.dataset.messageId))
  );
}

async function noHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

try {
  const jamie = await setup();
  await login(jamie, 'demo_zhou');
  await filters(jamie, 'Coffee', 'New friends');
  assert.equal(await jamie.page.locator('#swipe-card h2').innerText(), 'Alex Lin');
  await Promise.all([jamie.page.waitForNavigation(), jamie.page.locator('#like-form button').click()]);

  const alex = await setup();
  await login(alex, 'demo_lin');
  await filters(alex, 'Coffee', 'New friends');
  await Promise.all([
    alex.page.waitForURL(url => /\/(matches|conversations)\/\d+$/.test(url.pathname)),
    alex.page.locator('#like-form button').click()
  ]);
  const conversation = new URL(alex.page.url()).pathname.startsWith('/matches/')
    ? await alex.page.locator('#open-conversation').getAttribute('href')
    : new URL(alex.page.url()).pathname;
  await openConversation(alex, conversation);

  async function openConversation(session, href) {
    await session.page.goto(base + href);
    assert.equal(await session.page.locator('.chat-heading h1').innerText(), 'Jamie Zhou');
  }

  const messageAction = await alex.page.locator('#message-form').getAttribute('action');
  assert.equal(await sendMessage(alex.page, messageAction, 'First unread message'), 200);

  await jamie.page.goto(base + '/connections');
  assert.equal(await jamie.page.locator('.unread-badge').getAttribute('data-unread-count'), '1');
  assert.match(await jamie.page.locator('.unread-badge').getAttribute('aria-label'), /1 unread message/);
  await screenshot(jamie, 'D_normal_connections.png');
  const firstRead = jamie.page.waitForResponse(response =>
    response.request().method() === 'POST' && response.url().includes('/read') && response.status() === 200
  );
  await Promise.all([jamie.page.waitForURL('**/conversations/*'), jamie.page.locator('.contact-row').click()]);
  await firstRead;
  await screenshot(jamie, 'D_normal_conversation.png');
  await jamie.page.goto(base + '/connections');
  assert.equal(await jamie.page.locator('.unread-badge').count(), 0);
  ok('D-01/D-02', 'Incoming messages show a recipient-only badge; opening the conversation acknowledges the current participant and clears it.');

  assert.equal(await sendMessage(alex.page, messageAction, 'A later unread message'), 200);
  await jamie.page.goto(base + '/connections');
  assert.equal(await jamie.page.locator('.unread-badge').getAttribute('data-unread-count'), '1');
  const secondRead = jamie.page.waitForResponse(response =>
    response.request().method() === 'POST' && response.url().includes('/read') && response.status() === 200
  );
  await Promise.all([jamie.page.waitForURL('**/conversations/*'), jamie.page.locator('.contact-row').click()]);
  await secondRead;
  ok('D-02', 'A later incoming message becomes unread again and a new acknowledgement clears it.');

  await jamie.page.goto(base + '/connections');
  const chatAction = await alex.page.locator('#message-form').getAttribute('action');
  for (let index = 1; index <= 120; index++) {
    assert.equal(await sendMessage(alex.page, chatAction, `Seeded history message ${index}`), 200);
  }
  await jamie.page.goto(base + '/connections');
  assert.equal(await jamie.page.locator('.unread-badge').getAttribute('data-unread-count'), '120');
  const bulkRead = jamie.page.waitForResponse(response =>
    response.request().method() === 'POST' && response.url().includes('/read') && response.status() === 200
  );
  await Promise.all([jamie.page.waitForURL('**/conversations/*'), jamie.page.locator('.contact-row').click()]);
  await bulkRead;
  assert.equal(await jamie.page.locator('#messages .message').count(), 100);
  assert.equal(await jamie.page.locator('#load-older').isVisible(), true);
  const latestIds = await messageIds(jamie.page);
  assert.deepEqual(latestIds, [...latestIds].sort((a, b) => a - b));
  await jamie.page.locator('#load-older').click();
  await jamie.page.waitForFunction(() => document.querySelectorAll('#messages .message').length === 122);
  const allIds = await messageIds(jamie.page);
  assert.equal(new Set(allIds).size, allIds.length);
  assert.deepEqual(allIds, [...allIds].sort((a, b) => a - b));
  await screenshot(jamie, 'D_boundary_history.png', true);
  ok('D-03', 'More than 100 messages load in a bounded page, remain ascending and contain no duplicates.');

  await sendMessage(alex.page, chatAction, 'Message arriving during history review');
  await jamie.page.waitForFunction(() => document.querySelectorAll('#messages .message').length >= 123, null, { timeout: 10000 });
  const mergedIds = await messageIds(jamie.page);
  assert.equal(new Set(mergedIds).size, mergedIds.length);
  assert.deepEqual(mergedIds, [...mergedIds].sort((a, b) => a - b));
  ok('D-04', 'A polling result arriving after older-history paging merges by ID without duplicates or reordering.');

  const longMessage = 'Long message ' + 'x'.repeat(987);
  assert.equal(await sendMessage(alex.page, chatAction, longMessage), 200);
  await jamie.page.getByText(longMessage, { exact: true }).waitFor({ timeout: 10000 });
  assert.equal(await noHorizontalOverflow(jamie.page), true);
  ok('D-06a', 'A 1,000-character message remains readable without horizontal page overflow.');

  await jamie.page.locator('#body').fill('Keyboard send check');
  await jamie.page.locator('#body').focus();
  await jamie.page.keyboard.press('Tab');
  assert.equal(await jamie.page.evaluate(() => document.activeElement?.closest('form')?.id), 'message-form');
  await Promise.all([jamie.page.waitForNavigation(), jamie.page.keyboard.press('Enter')]);
  await jamie.page.getByText('Keyboard send check', { exact: true }).waitFor();
  ok('D-06b', 'Keyboard navigation reaches the send control and Enter submits the message.');

  const sam = await setup();
  await login(sam, 'demo_su');
  await filters(sam, 'Reading', 'New friends');
  await likeProfileNamed(sam, 'Jamie Zhou');
  await jamie.page.goto(base + '/discover?interest=Reading&goal=New%20friends');
  await Promise.all([
    jamie.page.waitForURL(url => /\/(matches|conversations)\/\d+$/.test(url.pathname)),
    (async () => {
      for (let attempt = 0; attempt < 12; attempt++) {
        if (await jamie.page.locator('#swipe-card h2').innerText() === 'Sam Su') {
          await jamie.page.locator('#like-form button').click();
          return;
        }
        await jamie.page.locator('#skip-form button').click();
        await jamie.page.waitForLoadState('domcontentloaded');
      }
      throw new Error('Could not find Sam Su in Jamie\'s filtered discovery list.');
    })()
  ]);
  const emptyConversation = new URL(jamie.page.url()).pathname.startsWith('/matches/')
    ? await jamie.page.locator('#open-conversation').getAttribute('href')
    : new URL(jamie.page.url()).pathname;
  await jamie.page.goto(base + emptyConversation);
  assert.equal(await jamie.page.locator('#messages .message').count(), 0);
  assert.equal(await jamie.page.locator('#body').isVisible(), true);
  await screenshot(jamie, 'D_empty_conversation.png');
  ok('D-06c', 'An empty conversation shows a usable composer without a misleading load-history control.');

  const mobile = await setup({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await login(mobile, 'demo_zhou');
  await mobile.page.goto(base + conversation);
  assert.equal(await noHorizontalOverflow(mobile.page), true);
  assert.equal(await mobile.page.locator('#messages .message').count() > 0, true);
  const mobileLayout = await mobile.page.evaluate(() => {
    const send = document.querySelector('#message-form button').getBoundingClientRect();
    const nav = document.querySelector('.sidebar').getBoundingClientRect();
    return { sendBottom: send.bottom, navTop: nav.top };
  });
  assert.ok(mobileLayout.sendBottom <= mobileLayout.navTop, `Send button overlaps mobile navigation: ${JSON.stringify(mobileLayout)}`);
  await screenshot(mobile, 'D_mobile_conversation.png', true);
  ok('D-06d', 'The desktop conversation remains usable at 390 px without horizontal overflow.');

  await postForm(alex.page, `/connections/${conversation.split('/').pop()}/end`, {});
  const closedResponse = await mobile.page.goto(base + conversation);
  assert.equal(closedResponse.status(), 403);
  await mobile.page.locator('.error-page').waitFor();
  assert.equal(await noHorizontalOverflow(mobile.page), true);
  await screenshot(mobile, 'D_error_closed.png', true);
  ok('D-05/D-06e', 'An ended conversation returns a real 403 error state that remains readable at 390 px.');

  assert.deepEqual(issues, []);
  ok('RUNTIME', 'No browser exceptions or HTTP 5xx responses during the checked flows.');
} catch (error) {
  issues.push(error.stack || error.message);
  console.error(error.stack || error.message);
  process.exitCode = 1;
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: path.join(images, 'D_failure.png'), fullPage: true }).catch(() => {});
  }
} finally {
  await fs.writeFile(path.join(output, 'results.json'), JSON.stringify({
    capturedAt: new Date().toISOString(),
    browser: browser.version(),
    checks,
    issues,
    screenshots,
    exitCode: process.exitCode || 0
  }, null, 2) + '\n');
  await browser.close();
}
