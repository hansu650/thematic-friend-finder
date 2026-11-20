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
const requests = [];
let activePage;
let dropNext = false;
let releaseDroppedResponse = () => {};
let droppedResponseGate = Promise.resolve();

const ok = (id, assertion) => {
  checks.push({ id, assertion, result: 'PASS' });
  console.log(`PASS ${id} ${assertion}`);
};

async function setup() {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-GB' });
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
    session.page.waitForURL('**/explore'),
    session.page.locator('form button[type=submit]').click()
  ]);
  await session.page.goto(base + '/discover');
}

async function filters(session, interest, goal) {
  await session.page.goto(`${base}/discover?interest=${encodeURIComponent(interest)}&goal=${encodeURIComponent(goal)}`);
}

async function matchJamieAndAlex(jamie, alex) {
  await filters(jamie, 'Coffee', 'New friends');
  assert.equal(await jamie.page.locator('.detail-copy>h1').innerText(), 'Alex Lin');
  await Promise.all([jamie.page.waitForNavigation(), jamie.page.locator('#like-form button').click()]);

  await login(alex, 'demo_lin');
  await filters(alex, 'Coffee', 'New friends');
  await Promise.all([
    alex.page.waitForURL(url => /\/(matches|conversations)\/\d+$/.test(url.pathname)),
    alex.page.locator('#like-form button').click()
  ]);
  const conversation = new URL(alex.page.url()).pathname.startsWith('/matches/')
    ? await alex.page.locator('#open-conversation').getAttribute('href')
    : new URL(alex.page.url()).pathname;
  await alex.page.goto(base + conversation);
  assert.equal(await alex.page.locator('.chat-heading h1').innerText(), 'Jamie Zhou');
  return conversation;
}

async function installSendRoute(page) {
  await page.route('**/api/conversations/*/messages', async route => {
    if (route.request().method() !== 'POST') return route.continue();
    requests.push(Object.fromEntries(new URLSearchParams(route.request().postData() || '')));
    if (!dropNext) return route.continue();
    dropNext = false;
    await route.fetch();
    await droppedResponseGate;
    await route.abort('failed');
  });
}

async function prepareDroppedResponse() {
  dropNext = true;
  droppedResponseGate = new Promise(resolve => { releaseDroppedResponse = resolve; });
}

async function screenshot(session, name) {
  await session.page.evaluate(() => document.fonts.ready);
  await session.page.screenshot({ path: path.join(images, name), type: 'png', fullPage: true });
  screenshots.push(name);
}

try {
  const jamie = await setup();
  await login(jamie, 'demo_zhou');
  const alex = await setup();
  const conversation = await matchJamieAndAlex(jamie, alex);
  await installSendRoute(alex.page);

  const draft = alex.page.locator('#body');
  const send = alex.page.locator('#message-form button[type=submit]');
  const text = 'Response was lost after commit';
  await draft.fill(text);
  await prepareDroppedResponse();
  await send.click();
  await alex.page.locator('#messages .message.pending').filter({ hasText: text }).waitFor();
  assert.equal(await draft.inputValue(), text);
  await screenshot(alex, 'D_retry_pending.png');
  ok('D-W4-B1', 'The unchanged draft is retained while a send is pending.');

  releaseDroppedResponse();
  await alex.page.locator('#messages .message.pending.failed').filter({ hasText: text }).waitFor({ timeout: 10000 });
  assert.equal(await draft.inputValue(), text);
  assert.match(await alex.page.locator('#chat-status').innerText(), /Could not confirm delivery/);
  await screenshot(alex, 'D_retry_failed.png');
  ok('D-W4-B2', 'A committed response that never reaches the browser is shown as failed with the draft retained.');

  await send.click();
  await alex.page.locator('#messages .message[data-message-id]').filter({ hasText: text }).waitFor({ timeout: 10000 });
  await alex.page.locator('#messages .message.pending').waitFor({ state: 'detached', timeout: 10000 });
  assert.equal(await draft.inputValue(), '');
  assert.equal(await alex.page.locator('#messages .message[data-message-id]').filter({ hasText: text }).count(), 1);
  assert.equal(requests[0].clientMessageId, requests[1].clientMessageId);
  await alex.page.waitForTimeout(600);
  await screenshot(alex, 'D_retry_confirmed.png');
  ok('D-W4-B3', 'Retry reuses the logical identity and resolves to one confirmed message.');

  const editedBaseline = 'Edit after failed response';
  const editedText = editedBaseline + ' — changed';
  await draft.fill(editedBaseline);
  await prepareDroppedResponse();
  await send.click();
  await alex.page.locator('#messages .message.pending').filter({ hasText: editedBaseline }).waitFor();
  const failedKey = requests.at(-1).clientMessageId;
  releaseDroppedResponse();
  await alex.page.locator('#messages .message.pending.failed').filter({ hasText: editedBaseline }).waitFor({ timeout: 10000 });
  await draft.fill(editedText);
  assert.equal(await alex.page.locator('#messages .message.pending').count(), 0);
  await send.click();
  await alex.page.locator('#messages .message[data-message-id]').filter({ hasText: editedText }).waitFor({ timeout: 10000 });
  const editedKey = requests.at(-1).clientMessageId;
  assert.notEqual(editedKey, failedKey);
  ok('D-W4-B4', 'Editing a failed draft creates a new logical send instead of reusing the failed identity.');

  const pollText = 'Poll confirmed before failed response';
  await draft.fill(pollText);
  await prepareDroppedResponse();
  await send.click();
  await alex.page.locator('#messages .message.pending').filter({ hasText: pollText }).waitFor();
  await alex.page.locator('#messages .message.pending').waitFor({ state: 'detached', timeout: 7000 });
  assert.equal(await alex.page.locator('#messages .message[data-message-id]').filter({ hasText: pollText }).count(), 1);
  releaseDroppedResponse();
  await alex.page.waitForTimeout(500);
  assert.doesNotMatch(await alex.page.locator('#chat-status').innerText(), /Could not confirm delivery/);
  ok('D-W4-B7', 'A poll-confirmed message is not changed back to failed when the original response later reports a network error.');

  await jamie.page.goto(base + '/connections');
  const selected = jamie.page.locator('.contact-row').filter({ hasText: 'Alex Lin' });
  assert.equal(await selected.getAttribute('data-unread'), '4');
  assert.equal(await selected.locator('p').innerText(), pollText);
  ok('D-W4-B5', 'The recipient has one unread increment per confirmed logical message and sees the final preview.');

  await jamie.page.goto(base + conversation);
  const exactBodyCount = body => jamie.page.locator('#messages .message[data-message-id] > p').evaluateAll(
    (nodes, expected) => nodes.filter(node => node.textContent === expected).length, body);
  assert.equal(await exactBodyCount(text), 1);
  assert.equal(await exactBodyCount(editedBaseline), 1);
  assert.equal(await exactBodyCount(editedText), 1);
  assert.equal(await exactBodyCount(pollText), 1);
  ok('D-W4-B6', 'Both accounts retain one stored row per logical send, including the edited new message.');

  assert.deepEqual(issues, []);
  ok('RUNTIME', 'No browser exceptions or HTTP 5xx responses during the checked retry flow.');
} catch (error) {
  issues.push(error.stack || error.message);
  console.error(error.stack || error.message);
  process.exitCode = 1;
  if (activePage && !activePage.isClosed()) {
    await activePage.screenshot({ path: path.join(images, 'D_retry_failure.png'), fullPage: true }).catch(() => {});
  }
} finally {
  await fs.writeFile(path.join(output, 'retry-results.json'), JSON.stringify({
    capturedAt: new Date().toISOString(),
    browser: browser.version(),
    checks,
    requests,
    issues,
    screenshots,
    exitCode: process.exitCode || 0
  }, null, 2) + '\n');
  await browser.close();
}
