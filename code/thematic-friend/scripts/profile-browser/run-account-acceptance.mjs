import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { mkdir, mkdtemp, open, readFile } from 'node:fs/promises';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const output = path.resolve(process.env.MINGLE_TEST_OUTPUT || '.local/w4-c');
await mkdir(output, { recursive: true });
const runDirectory = await mkdtemp(path.join(output, 'account-run-'));
const jar = path.resolve('target/thematic-friend-0.0.1-SNAPSHOT.jar');
const javaExecutable = process.platform === 'win32' ? 'java.exe' : 'java';
const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin', javaExecutable) : javaExecutable;
const database = path.join(runDirectory, 'data', 'tongpin').split(path.sep).join('/');
const reservation = createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const base = 'http://127.0.0.1:' + reservation.address().port;
await new Promise(resolve => reservation.close(resolve));

let server;
async function start() {
  const log = await open(path.join(runDirectory, 'private-server.log'), 'a');
  try {
    server = spawn(java, [
      '-jar', jar,
      '--server.port=' + new URL(base).port,
      '--server.address=127.0.0.1',
      '--spring.profiles.active=default',
      '--spring.datasource.url=jdbc:h2:file:' + database + ';DB_CLOSE_ON_EXIT=FALSE',
      '--spring.datasource.username=sa',
      '--spring.datasource.password='
    ], {
      env: { ...process.env, TONGPIN_CHINESE_ENABLED: 'false' },
      stdio: ['ignore', log.fd, log.fd]
    });
    await once(server, 'spawn');
  } finally {
    await log.close();
  }
  for (let attempt = 0; attempt < 120; attempt++) {
    if (server.exitCode !== null) throw new Error('Java exited early. See local server log.');
    if (await fetch(base + '/login', { signal: AbortSignal.timeout(1000) }).then(response => response.ok, () => false)) return;
    await delay(500);
  }
  throw new Error('Startup exceeded 60 seconds.');
}

let shutdowns = 0;
async function stop() {
  if (!server || server.exitCode !== null || server.signalCode !== null) return;
  const exit = once(server, 'exit');
  server.kill('SIGTERM');
  await exit;
  shutdowns++;
  const log = await readFile(path.join(runDirectory, 'private-server.log'), 'utf8');
  assert.equal([...log.matchAll(/Shutdown completed/g)].length, shutdowns);
}

const username = 'w4_acceptance';
const firstPassword = randomUUID();
const nextPassword = randomUUID();
const bio = '周末读书会 · Fictional acceptance profile';
const profileName = '小雨 · Fictional member';
const browser = await chromium.launch({ executablePath: process.env.MINGLE_BROWSER_PATH });
console.log('Browser ' + browser.version());
const page = await browser.newPage({ locale: 'zh-CN', viewport: { width: 390, height: 844 } });
const other = await browser.newPage({ locale: 'zh-CN' });
const probe = await browser.newPage();

async function login(tab, password, successful = true) {
  await tab.goto(base + '/login');
  await tab.locator('#username').fill(username);
  await tab.locator('#password').fill(password);
  await tab.locator('form[action="/login"] button[type=submit]').click();
  await tab.waitForURL(successful ? /\/explore$/ : /\/login\?error$/);
}

async function changePassword(current) {
  await page.goto(base + '/change-password?lang=zh');
  await page.locator('#currentPassword').fill(current);
  await page.locator('#newPassword').fill(nextPassword);
  await page.locator('#confirmation').fill(nextPassword);
  await page.locator('form[action="/change-password"] button[type=submit]').click();
}

function expectRoute(tab, route) {
  assert.equal(new URL(tab.url()).pathname, route);
}

async function expectEnglish(tab, heading) {
  assert.equal(await tab.locator('html').getAttribute('lang'), 'en');
  assert.equal(await tab.locator('.language-switch, a[lang=zh]').count(), 0);
  assert.equal((await tab.locator('h1').innerText()).trim(), heading);
}

try {
  await start();
  await page.goto(base + '/signup?lang=zh');
  await page.locator('#username').fill(username);
  await page.locator('#nickname').fill('Fictional member');
  await page.locator('#password').fill(firstPassword);
  await page.locator('input[name=adult]').check();
  await page.locator('form[action="/signup"] button[type=submit]').click();
  await page.waitForURL(/\/login\?registered$/);
  await login(page, firstPassword);
  await login(other, firstPassword);

  await page.goto(base + '/profile?lang=zh');
  await expectEnglish(page, 'My profile');
  await page.locator('#nickname').fill(profileName);
  await page.locator('#bio').fill(bio);
  await page.locator('label:has(input[name=interests])').first().click();
  const interests = await page.locator('input[name=interests]:checked').evaluateAll(inputs => inputs.map(input => input.value));
  assert.equal(interests.length, 1);
  await page.locator('#profile-form button[type=submit]').click();
  await page.getByText('Profile saved. Discover people who share your interests.', { exact: true }).waitFor();
  await page.reload();
  assert.equal(await page.locator('#bio').inputValue(), bio);
  console.log('PASS T1 registration, form login and explicit profile save on a fresh H2 database.');

  await changePassword(randomUUID());
  await page.getByText('The current password is incorrect.', { exact: true }).waitFor();
  await expectEnglish(page, 'Change password');
  await page.screenshot({ path: path.join(runDirectory, 'C_wrong_password_390.png'), fullPage: true });
  await login(probe, firstPassword);
  await probe.context().clearCookies();
  await login(probe, nextPassword, false);
  await probe.context().clearCookies();

  await changePassword(firstPassword);
  await page.waitForURL(/\/login\?passwordChanged$/);
  await page.goto(base + '/profile');
  expectRoute(page, '/login');
  await other.goto(base + '/profile');
  expectRoute(other, '/profile');
  await login(probe, firstPassword, false);
  await probe.context().clearCookies();
  await login(probe, nextPassword);
  console.log('PASS T3 wrong password preserves credential; valid change signs out only the submitting session; old login fails and new login succeeds.');

  await stop();
  await start();
  await probe.context().clearCookies();
  await login(probe, nextPassword);
  await probe.goto(base + '/profile?lang=zh');
  await expectEnglish(probe, 'My profile');
  assert.equal(await probe.locator('#nickname').inputValue(), profileName);
  assert.equal(await probe.locator('#bio').inputValue(), bio);
  assert.deepEqual(await probe.locator('input[name=interests]:checked').evaluateAll(inputs => inputs.map(input => input.value)), interests);
  console.log('PASS T1 profile name, bio, selected interest and replacement credential survive a seed-disabled Java process restart.');
  console.log('PASS T5 lang=zh and a zh-CN browser preference render English controls and rejection text, hide the language switch and preserve user-entered Chinese.');
  await probe.screenshot({ path: path.join(runDirectory, 'C_profile_after_restart.png'), fullPage: true });
} finally {
  try {
    await browser.close();
  } finally {
    await stop();
  }
}
console.log('Evidence directory: ' + runDirectory);
