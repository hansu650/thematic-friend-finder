import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawn, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const parent=path.resolve(process.env.MINGLE_TEST_OUTPUT||path.join(root,'.local/h2-restore-checks'));
fs.mkdirSync(parent,{recursive:true});
const output=fs.mkdtempSync(path.join(parent,'restore-'));
const java=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java'):'java';
const powershell=process.env.MINGLE_POWERSHELL_PATH||'powershell.exe';
const jar=path.join(root,'target/thematic-friend-0.0.1-SNAPSHOT.jar');
const password=crypto.randomBytes(20).toString('base64url');
const nickname='Restore '+crypto.randomBytes(4).toString('hex');
const message='Retained after stopped H2 backup and restore '+crypto.randomUUID();
const result={startedAt:new Date().toISOString(),command:'node scripts/tests/run-h2-restore-check.mjs',
  jarSha256:crypto.createHash('sha256').update(fs.readFileSync(jar)).digest('hex'),
  checks:[],errors:[],exitCode:1,output};
let server,browser,base;
async function start(data,label,demo){
  const reservation=net.createServer();
  await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
  const port=reservation.address().port;
  await new Promise(resolve=>reservation.close(resolve));
  base='http://127.0.0.1:'+port;
  const log=fs.openSync(path.join(output,label+'.log'),'w');
  server=spawn(java,['-jar',jar,'--server.address=127.0.0.1','--server.port='+port,
    '--app.chinese-enabled=false',...(demo?['--spring.profiles.active=demo']:[])],{
    cwd:root,windowsHide:true,stdio:['ignore',log,log],
    env:{...process.env,APP_DATA_DIR:data,TONGPIN_DEMO_PASSWORD:password}});
  fs.closeSync(log);
  let launchError;
  server.on('error',error=>launchError=error);
  for(let i=0;i<150;i++){
    if(launchError)throw launchError;
    if(server.exitCode!==null)throw Error('Isolated server stopped; see '+label+'.log');
    try{if((await fetch(base+'/login',{signal:AbortSignal.timeout(600)})).ok)return;}catch{}
    await new Promise(resolve=>setTimeout(resolve,400));
  }
  throw Error('Isolated server startup timeout');
}
async function stop(){
  if(!server||server.exitCode!==null)return;
  const exited=new Promise(resolve=>server.once('exit',resolve));
  server.kill();
  await Promise.race([exited,new Promise((_,reject)=>setTimeout(()=>reject(Error('Test process did not stop')),10000))]);
}
async function login(username){
  const context=await browser.newContext({viewport:{width:1280,height:900}});
  const page=await context.newPage();
  await page.goto(base+'/login');await page.locator('#username').fill(username);await page.locator('#password').fill(password);
  await Promise.all([page.waitForURL('**/explore'),page.locator('form[action="/login"] button').click()]);
  return {page,context};
}
async function submit(page,selector){await Promise.all([page.waitForNavigation(),page.locator(selector).click()]);}
function check(id,description){result.checks.push({id,description,passed:true});console.log('PASS '+id+' '+description);}
function ps(script,args,log){
  // A PowerShell 7 parent can otherwise pass an incompatible module search path
  // to Windows PowerShell 5.1. Let the chosen shell build its own default path.
  const shellEnvironment={...process.env};
  delete shellEnvironment.PSModulePath;
  const text=execFileSync(powershell,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(root,'scripts',script),...args],
    {cwd:root,encoding:'utf8',windowsHide:true,env:shellEnvironment});
  fs.writeFileSync(path.join(output,log),text);
}
try{
  const {chromium}=await import(process.env.MINGLE_PLAYWRIGHT_MODULE||'playwright');
  browser=await chromium.launch({headless:true,...(process.env.MINGLE_BROWSER_PATH?{executablePath:process.env.MINGLE_BROWSER_PATH}:{})});
  await start(path.join(output,'original'),'original-server',true);
  const a=await login('demo_zhou'),b=await login('demo_lin');
  await a.page.goto(base+'/explore');
  await a.page.locator('.people-card').filter({has:a.page.getByRole('heading',{name:'Alex Lin',exact:true})}).click();
  await submit(a.page,'#like-form button');
  await b.page.goto(base+'/explore');
  await b.page.locator('.people-card').filter({has:b.page.getByRole('heading',{name:'Jamie Zhou',exact:true})}).click();
  await submit(b.page,'#like-form button');
  const conversation=await b.page.locator('#open-conversation').getAttribute('href');
  await a.page.goto(base+conversation);await a.page.locator('#body').fill(message);await a.page.locator('#message-form button[type=submit]').click();
  await a.page.locator('#messages .message>p').filter({hasText:message}).waitFor();
  await a.page.goto(base+'/profile');await a.page.locator('#nickname').fill(nickname);await submit(a.page,'#profile-form button[type=submit]');
  await a.page.goto(base+'/events');await a.page.locator('.event-card').first().click();
  const eventPath=new URL(a.page.url()).pathname;
  await submit(a.page,'form[action$="/save"] button');
  check('H2-01','Created a real profile edit, mutual connection, message and personal event save.');
  await a.context.close();await b.context.close();await stop();
  ps('backup.ps1',['-DataDirectory',path.join(output,'original'),'-BackupRoot',path.join(output,'backups')],'backup.log');
  const backup=fs.readdirSync(path.join(output,'backups')).find(n=>n.startsWith('backup-'));
  assert.ok(backup);const restored=path.join(output,'restored');
  ps('restore.ps1',['-BackupDirectory',path.join(output,'backups',backup),'-Destination',restored],'restore.log');
  check('H2-02','Stopped test process, backed up real H2 files, and restored to a new directory with checksum validation.');
  // Start without the demo profile: no seeding can recreate missing records.
  await start(restored,'restored-server',false);
  const recovered=await login('demo_zhou'),other=await login('demo_lin');
  await recovered.page.goto(base+'/profile?lang=zh');
  assert.equal(await recovered.page.locator('#nickname').inputValue(),nickname);
  assert.equal(await recovered.page.locator('html').getAttribute('lang'),'en');
  assert.equal(await recovered.page.locator('a[href*="lang=zh"]').count(),0);
  await recovered.page.goto(base+conversation);assert.equal(await recovered.page.locator('#messages .message>p').filter({hasText:message}).count(),1);
  await other.page.goto(base+conversation);assert.equal(await other.page.locator('#messages .message>p').filter({hasText:message}).count(),1);
  check('H2-03','Both retained passwords log in; saved profile, connection and exactly one message survive restoration without seeding.');
  await recovered.page.goto(base+'/events?view=saved');assert.equal(await recovered.page.locator('.event-card[href="'+eventPath+'"]').count(),1);
  await other.page.goto(base+'/events?view=saved');assert.equal(await other.page.locator('.event-card').count(),0);
  check('H2-04','Restored saved events remain account-specific; English-only configuration overrides lang=zh.');
  result.exitCode=0;
}catch(error){result.errors.push(error.stack||String(error));console.error(error.stack||String(error));}
finally{
  if(browser)await browser.close();
  await stop().catch(error=>{result.errors.push(String(error));result.exitCode=1;});
  result.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');
  console.log('Restore output: '+output+'\nRestoreExit='+result.exitCode);
  process.exitCode=result.exitCode;
}
