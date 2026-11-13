import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.MINGLE_PLAYWRIGHT_MODULE || 'playwright');
const captureHelper = process.env.MINGLE_CAPTURE_MODULE ? await import(process.env.MINGLE_CAPTURE_MODULE) : null;

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const parent = path.resolve(process.env.MINGLE_TEST_OUTPUT || path.join(root, '.local/ui-browser-verification'));
await fs.mkdir(parent, { recursive: true });
const output = await fs.mkdtemp(path.join(parent, 'review-'));
const jar = path.resolve(process.env.MINGLE_TEST_JAR || path.join(root, 'target/thematic-friend-0.0.1-SNAPSHOT.jar'));
const reservation = net.createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const base = `http://127.0.0.1:${port}`;
const password = crypto.randomBytes(18).toString('base64url');
const log = fsSync.openSync(path.join(output, 'server.log'), 'a');
const javaArgs = ['-jar', jar, '--spring.profiles.active=demo', `--server.port=${port}`, '--server.address=127.0.0.1'];
const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
const server = spawn(java, javaArgs, {
  cwd: root, windowsHide: true, stdio: ['ignore', log, log],
  env: { ...process.env, APP_DATA_DIR: path.join(output, 'database'), TONGPIN_DEMO_PASSWORD: password }
});
fsSync.closeSync(log);
const checks = [], errors = [], images = [];
let browser, current;
const record = text => { checks.push(text); console.log('PASS ' + text); };
async function shot(page, name, fullPage = false) {
  const file = path.join(output, name + '.png');
  await page.evaluate(() => document.fonts.ready);
  if (captureHelper) await captureHelper.captureScreenshot(page, { file, cursor: 'arrow', fullPage });
  else await page.screenshot({ path: file, type: 'png', fullPage });
  images.push(file);
}
async function login(page, user) {
  await page.goto(base + '/login');
  await page.locator('#username').fill(user);
  await page.locator('#password').fill(password);
  await Promise.all([page.waitForURL('**/discover'), page.locator('form button[type=submit]').click()]);
}
async function context(viewport) {
  const context = await browser.newContext({ viewport, locale: 'en-GB' });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !r.url().endsWith('favicon.ico')) errors.push(r.status() + ' ' + r.url()); });
  return { context, page };
}
async function noOverflow(page, label) {
  const sizes = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
  assert.ok(sizes.scroll <= sizes.width + 1, `${label}: horizontal overflow ${JSON.stringify(sizes)}`);
}
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    if (server.exitCode !== null) throw new Error('Preview server exited.');
    try { const r = await fetch(base + '/login'); if (r.ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  assert.ok(ready, 'Preview server must become ready');
  browser = await chromium.launch({ headless: true, ...(process.env.MINGLE_BROWSER_PATH ? { executablePath: process.env.MINGLE_BROWSER_PATH } : {}) });
  const jamie = await context({ width: 1440, height: 1000 });
  current = jamie.page;
  await jamie.page.goto(base + '/login');
  await shot(jamie.page, '01-login-desktop');
  await login(jamie.page, 'demo_zhou');
  assert.equal(await jamie.page.locator('.person-name h2').innerText(), 'Alex Lin');
  assert.ok((await jamie.page.locator('.person-portrait').evaluate(el => getComputedStyle(el).backgroundImage)).includes('avatar-'));
  await noOverflow(jamie.page, 'Desktop discovery');
  await shot(jamie.page, '02-discover-desktop');
  await jamie.page.locator('.filter-panel summary').click();
  await jamie.page.selectOption('#interest', 'Coffee');
  await jamie.page.selectOption('#goal', 'New friends');
  await Promise.all([jamie.page.waitForURL('**/discover?*'), jamie.page.locator('.filter-bar button').click()]);
  assert.equal(await jamie.page.locator('#discovery-count').innerText(), '1 profile available');
  assert.equal(await jamie.page.locator('.shared-interest strong').innerText(), 'Coffee, Reading');
  record('Real filter form narrows the available card and preserves shared interests.');

  await jamie.page.setViewportSize({ width: 390, height: 844 });
  await jamie.page.goto(base + '/discover');
  await shot(jamie.page, '03-discover-mobile');
  for (const [width,height] of [[390,844],[375,667],[320,568],[768,1024]]) {
    await jamie.page.setViewportSize({width,height});
    await noOverflow(jamie.page, `${width}px discovery`);
    await jamie.page.locator('#like-form button').scrollIntoViewIfNeeded();
    const button = await jamie.page.locator('#like-form button').boundingBox();
    const nav = await jamie.page.locator('.sidebar').boundingBox();
    if (width <= 700) assert.ok(button.y + button.height <= nav.y + 1, `${width}px like button obscured by fixed navigation`);
    await jamie.page.locator('.filter-panel summary').scrollIntoViewIfNeeded();
    await jamie.page.locator('.filter-panel summary').click();
    await noOverflow(jamie.page, `${width}px filter sheet`);
    await jamie.page.locator('.filter-panel summary').click();
  }
  record('Discovery and filter sheet fit 320, 375, 390 and 768 px; decision buttons remain reachable.');
  await jamie.page.setViewportSize({ width: 390, height: 844 });
  await jamie.page.goto(base + '/discover?lang=zh');
  assert.equal(await jamie.page.locator('h1').innerText(), '发现');
  await shot(jamie.page, '04-discover-chinese');
  await jamie.page.goto(base + '/discover?lang=en');
  await Promise.all([jamie.page.waitForNavigation(), jamie.page.locator('#like-form button').click()]);
  const alex = await context({ width: 390, height: 844 });
  current = alex.page;
  await login(alex.page, 'demo_lin');
  assert.equal(await alex.page.locator('.person-name h2').innerText(), 'Jamie Zhou');
  await Promise.all([alex.page.waitForURL('**/matches/*'), alex.page.locator('#like-form button').click()]);
  await noOverflow(alex.page, 'Mobile match');
  await shot(alex.page, '05-match-mobile');
  await alex.page.locator('#open-conversation').click();
  await alex.page.locator('#body').fill('That little cafe sounds great. Shall we swap our reading lists?');
  await Promise.all([alex.page.waitForResponse(r=>r.request().method()==='POST'&&/\/messages$/.test(new URL(r.url()).pathname)),alex.page.locator('#message-form button').click()]);
  await jamie.page.goto(base + '/connections');
  current = jamie.page;
  assert.equal(await jamie.page.locator('.unread-badge').innerText(), '1');
  await noOverflow(jamie.page, 'Mobile inbox');
  await shot(jamie.page, '06-inbox-mobile');
  await jamie.page.locator('.contact-row').click();
  await jamie.page.locator('.message').first().waitFor();
  await jamie.page.locator('#body').fill('Yes! Coffee and a good book is my kind of weekend.');
  await Promise.all([jamie.page.waitForResponse(r=>r.request().method()==='POST'&&/\/messages$/.test(new URL(r.url()).pathname)),jamie.page.locator('#message-form button').click()]);
  await jamie.page.waitForFunction(()=>document.querySelectorAll('.message').length===2);
  await noOverflow(jamie.page, 'Mobile conversation');
  await shot(jamie.page, '07-chat-mobile');
  record('Two real demo sessions match, send messages and show the actual unread count.');
  await jamie.page.goto(base + '/profile');
  assert.ok(await jamie.page.locator('.profile-preview').isVisible());
  assert.ok(await jamie.page.locator('.mobile-signout button').isVisible());
  await noOverflow(jamie.page, 'Mobile profile');
  await shot(jamie.page, '08-profile-mobile', true);
  await jamie.page.goto(base + '/safety');
  await noOverflow(jamie.page, 'Mobile safety');
  await shot(jamie.page, '09-safety-mobile', true);
  await jamie.page.goto(base + '/profile');
  await Promise.all([jamie.page.waitForNavigation(), jamie.page.locator('.mobile-signout button').click()]);
  await jamie.page.goto(base + '/discover');
  assert.ok(new URL(jamie.page.url()).pathname === '/login');
  record('Saved profile, safety and mobile logout are accessible; logout protects discovery.');
  const anonymous = await context({ width: 320, height: 568 });
  current = anonymous.page;
  for (const route of ['/', '/login', '/signup', '/privacy']) {
    await anonymous.page.goto(base + route);
    await noOverflow(anonymous.page, '320px public ' + route);
  }
  record('Public entry, login, signup and privacy fit a 320 px viewport.');
  assert.deepEqual(errors, []);
  record('No browser JavaScript errors or failed app / asset responses.');
} catch (error) {
  errors.push(error.stack || String(error));
  if (current) await shot(current, 'failure', true).catch(()=>{});
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.kill();
  await Promise.race([new Promise(resolve=>server.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,3000))]);
  const result = { date:new Date().toISOString(), mode:'packaged-jar', jarSha256:crypto.createHash('sha256').update(await fs.readFile(jar)).digest('hex'), output, checks, errors, images, exitCode:process.exitCode||0 };
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');
  await fs.writeFile(path.join(parent,'latest.json'),JSON.stringify({output},null,2)+'\n');
  console.log(JSON.stringify(result,null,2));
}
