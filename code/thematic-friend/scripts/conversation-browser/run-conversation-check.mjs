import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../..');
const jar = path.resolve(process.env.MINGLE_TEST_JAR || path.join(root, 'target/thematic-friend-0.0.1-SNAPSHOT.jar'));
await fs.access(jar);
const parent = path.resolve(process.env.MINGLE_TEST_OUTPUT || path.join(root, '.local/browser-verification'));
await fs.mkdir(parent, { recursive: true });
const output = await fs.mkdtemp(path.join(parent, 'conversation-'));

const reservation = net.createServer();
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
const port = reservation.address().port;
await new Promise(resolve => reservation.close(resolve));
const base = `http://127.0.0.1:${port}`;
const password = crypto.randomBytes(18).toString('base64url');
const java = process.env.JAVA_HOME
  ? path.join(process.env.JAVA_HOME, 'bin', process.platform === 'win32' ? 'java.exe' : 'java')
  : 'java';
const browserCandidates = [
  process.env.MINGLE_BROWSER_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);
let browserPath = null;
for (const candidate of browserCandidates) {
  try { await fs.access(candidate); browserPath = candidate; break; } catch { /* Try the next known local browser. */ }
}

const log = fsSync.openSync(path.join(output, 'server.log'), 'a');
const server = spawn(java, ['-jar', jar, '--spring.profiles.active=demo', '--server.address=127.0.0.1', `--server.port=${port}`], {
  cwd: root,
  windowsHide: true,
  env: { ...process.env, APP_DATA_DIR: path.join(output, 'database'), TONGPIN_DEMO_PASSWORD: password },
  stdio: ['ignore', log, log]
});
fsSync.closeSync(log);

const metadata = {
  startedAt: new Date().toISOString(),
  jarSha256: crypto.createHash('sha256').update(await fs.readFile(jar)).digest('hex'),
  java,
  node: process.version,
  base,
  output,
  browserPath,
  command: 'node scripts/conversation-browser/run-conversation-check.mjs'
};
let exitCode = 1;
try {
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error('Isolated test server exited; inspect server.log.');
    try {
      const response = await fetch(base, { signal: AbortSignal.timeout(600) });
      if (response.ok && (await response.text()).includes('Mingle')) { ready = true; break; }
    } catch { /* Keep the startup wait bounded. */ }
    await new Promise(resolve => setTimeout(resolve, 400));
  }
  if (!ready) throw new Error('Isolated test server did not become ready.');

  const check = spawn(process.execPath, [path.join(directory, 'conversation-check.mjs')], {
    cwd: root,
    windowsHide: true,
    stdio: 'inherit',
    env: {
      ...process.env,
      MINGLE_CHECK_URL: base,
      MINGLE_CHECK_PASSWORD: password,
      MINGLE_CHECK_OUTPUT: output,
      ...(browserPath ? { MINGLE_BROWSER_PATH: browserPath } : {})
    }
  });
  exitCode = await new Promise((resolve, reject) => {
    check.on('error', reject);
    check.on('exit', code => resolve(code ?? 1));
  });
} catch (error) {
  metadata.error = error.message;
  console.error(error.message);
} finally {
  server.kill();
  await Promise.race([new Promise(resolve => server.once('exit', resolve)), new Promise(resolve => setTimeout(resolve, 5000))]);
  await fs.writeFile(path.join(output, 'run.json'), JSON.stringify({
    ...metadata,
    finishedAt: new Date().toISOString(),
    exitCode
  }, null, 2) + '\n');
  console.log(`Browser output: ${output}\nBrowserExit=${exitCode}`);
  process.exitCode = exitCode;
}
