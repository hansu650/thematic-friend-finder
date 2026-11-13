import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium, expect} from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outputParent = path.resolve(process.env.MINGLE_TEST_OUTPUT || path.join(root, '.local/profile-checks'));
fs.mkdirSync(outputParent, {recursive:true});
const output = fs.mkdtempSync(path.join(outputParent, 'B-'));
const jar = path.resolve(process.env.MINGLE_TEST_JAR || path.join(root, 'target/thematic-friend-0.0.1-SNAPSHOT.jar'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const java = process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME,'bin',process.platform === 'win32' ? 'java.exe' : 'java') : 'java';
const git = args => execFileSync('git', args, {cwd:root,encoding:'utf8',windowsHide:true}).trim();
const manifest = {};
function filesIn(directory) {
  for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
    if (['node_modules','.cache','.local'].includes(entry.name)) continue;
    const file=path.join(directory,entry.name);
    if(entry.isDirectory()) filesIn(file);
    else manifest[path.relative(root,file).replaceAll('\\','/')]=hash(file);
  }
}
filesIn(path.join(root,'src'));
filesIn(path.join(root,'scripts/profile-browser'));
const result = {
  startedAt:new Date().toISOString(), command:'node scripts/profile-browser/run-profile-check.mjs',
  baseCommit:git(['rev-parse','HEAD']), workingTree:git(['status','--short']),
  node:process.version, java:execFileSync(java,['--version'],{encoding:'utf8',windowsHide:true}).trim(),
  playwright:JSON.parse(fs.readFileSync(new URL('./node_modules/@playwright/test/package.json',import.meta.url))).version,
  jarSha256:hash(jar), sourceSha256:manifest, checks:[], images:[], errors:[], exitCode:1
};
const reserve=net.createServer();
await new Promise(resolve=>reserve.listen(0,'127.0.0.1',resolve));
const port=reserve.address().port;
await new Promise(resolve=>reserve.close(resolve));
const base='http://127.0.0.1:'+port;
const password=crypto.randomBytes(20).toString('base64url');
const serverLog=fs.openSync(path.join(output,'server.log'),'w');
const server=spawn(java,['-jar',jar,'--spring.profiles.active=demo','--server.address=127.0.0.1','--server.port='+port],{
  cwd:root,windowsHide:true,stdio:['ignore',serverLog,serverLog],
  env:{...process.env,APP_DATA_DIR:path.join(output,'database'),TONGPIN_DEMO_PASSWORD:password,TONGPIN_CHINESE_ENABLED:'true'}
});
fs.closeSync(serverLog);
let browser, launchError, current;
server.on('error',error=>launchError=error);
const lines=[];
const log=line=>{lines.push(line);console.log(line);};
const pageErrors=[];
async function shot(page,name,fullPage=true) {
  await page.screenshot({path:path.join(output,name),fullPage,animations:'disabled'});
  result.images.push(name);
}
async function profile(options={}) {
  const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-GB',...options});
  const page=await context.newPage();
  current=page;
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.goto(base+'/login');
  await page.locator('#username').fill('demo_zhou');
  await page.locator('#password').fill(password);
  await Promise.all([page.waitForURL('**/explore'),page.locator('form button[type=submit]').click()]);
  await page.goto(base+'/profile?lang=en');
  return {context,page};
}
const selected=page=>page.locator('input[name="interests"]:checked').evaluateAll(inputs=>inputs.map(x=>x.value));
const pick=async(page,values)=>{
  const inputs=await page.locator('input[name="interests"]').all();
  // Release unwanted choices before adding replacements at the limit.
  for(const desired of [false,true]) for(const input of inputs) {
    if(values.includes(await input.getAttribute('value'))===desired && await input.isChecked()!==desired) {
      await input.locator('..').click();
    }
  }
};
async function noOverflow(page,label) {
  const size=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(size.scroll<=size.viewport+1,label+': '+JSON.stringify(size));
}
async function check(id,title,test) {
  const started=Date.now();
  try {
    await test();
    result.checks.push({id,title,passed:true,durationMs:Date.now()-started});
    log('PASS '+id+' '+title);
  } catch(error) {
    result.checks.push({id,title,passed:false,error:String(error),durationMs:Date.now()-started});
    if(current) await shot(current,id+'-failure.png').catch(()=>{});
    throw error;
  }
}
try {
  let ready=false;
  for(let i=0;i<150;i++) {
    if(launchError) throw launchError;
    if(server.exitCode!==null) throw Error('Test server exited; see server.log');
    try {if((await fetch(base+'/login',{signal:AbortSignal.timeout(500)})).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,400));
  }
  assert.ok(ready,'Isolated server starts within 60 seconds');
  browser=await chromium.launch({headless:true,...(process.env.MINGLE_BROWSER_PATH?{executablePath:process.env.MINGLE_BROWSER_PATH}:{})});
  result.browser=browser.version();
  log('Command: '+result.command);
  log('Base revision: '+result.baseCommit+' (working tree recorded in results.json)');
  log('JAR SHA-256: '+result.jarSha256);
  log('Browser: '+result.browser+'; Playwright: '+result.playwright+'; Node: '+process.version);

  await check('B-01','All preview fields update locally; refresh restores saved values; explicit save persists',async()=>{
    const {context,page}=await profile();
    const original=await page.locator('#profile-form').evaluate(form=>({
      name:form.nickname.value,bio:form.bio.value,goal:form.goal.value,
      interests:[...form.querySelectorAll('[name=interests]:checked')].map(x=>x.value)
    }));
    const posts=[];
    page.on('request',r=>{if(r.method()==='POST'&&new URL(r.url()).pathname==='/profile')posts.push(r.url());});
    await page.locator('#nickname').fill('Morgan Example');
    await page.locator('#bio').fill('Fictional profile: coffee, books and a weekend walk.');
    await page.locator('#goal').selectOption('Weekend plans');
    await pick(page,['Coffee','Hiking']);
    await expect(page.locator('#preview-name')).toHaveText('Morgan Example');
    await expect(page.locator('#preview-bio')).toHaveText('Fictional profile: coffee, books and a weekend walk.');
    await expect(page.locator('#preview-goal')).toHaveText('Weekend plans');
    await expect(page.locator('#preview-interests span')).toHaveText(['Coffee','Hiking']);
    await expect(page.locator('#preview-initial')).toHaveText('M');
    await expect(page.locator('#preview-status')).toContainText('not saved');
    assert.equal(posts.length,0);
    await shot(page,'B_normal.png');
    const second=await context.newPage();
    await second.goto(base+'/profile');
    await expect(second.locator('#nickname')).toHaveValue(original.name);
    await second.close();
    await page.reload();
    await expect(page.locator('#nickname')).toHaveValue(original.name);
    await expect(page.locator('#bio')).toHaveValue(original.bio);
    await expect(page.locator('#goal')).toHaveValue(original.goal);
    assert.deepEqual(await selected(page),original.interests);
    await page.locator('#nickname').fill('Saved Example');
    await page.locator('#bio').fill('Saved fictional biography.');
    await page.locator('#goal').selectOption('Study buddy');
    await pick(page,['Reading']);
    await Promise.all([page.waitForNavigation(),page.locator('#profile-form button[type=submit]').click()]);
    await page.reload();
    await expect(page.locator('#preview-name')).toHaveText('Saved Example');
    await expect(page.locator('#preview-bio')).toHaveText('Saved fictional biography.');
    await expect(page.locator('#preview-goal')).toHaveText('Study buddy');
    assert.deepEqual(await selected(page),['Reading']);
    assert.equal(posts.length,1);
    // Return the isolated fixture to its saved starting state for subsequent groups.
    await page.locator('#nickname').fill(original.name);
    await page.locator('#bio').fill(original.bio);
    await page.locator('#goal').selectOption(original.goal);
    await pick(page,original.interests);
    await Promise.all([page.waitForNavigation(),page.locator('#profile-form button[type=submit]').click()]);
    await context.close();
  });

  await check('B-02','Mouse/Space enforce five interests, announce the sixth, and preserve existing choices',async()=>{
    const {context,page}=await profile({viewport:{width:390,height:844}});
    await pick(page,[]);
    const five=['Coffee','Reading','Films','Music','Photography'];
    await pick(page,five);
    await expect(page.locator('#interest-feedback')).toHaveText('5 / 5 interests selected.');
    const selectedColor=await page.locator('input[name=interests]:checked').first().evaluate(el=>getComputedStyle(el.labels[0].querySelector('span')).backgroundColor);
    assert.equal(selectedColor,'rgb(245, 238, 252)','Selected chips have visible feedback despite Thymeleaf hidden inputs');
    const sixth=page.locator('input[name=interests][value=Travel]');
    await sixth.locator('..').click();
    await expect(sixth).not.toBeChecked();
    assert.deepEqual(await selected(page),five);
    await expect(page.locator('#interest-feedback')).toContainText('Travel was not added');
    await expect(page.locator('#interest-feedback')).toHaveAttribute('role','status');
    await expect(page.locator('#interest-feedback')).toHaveAttribute('aria-live','polite');
    await page.locator('#profile-interests').scrollIntoViewIfNeeded();
    await shot(page,'B_boundary.png',false);
    await sixth.focus();
    await page.keyboard.press('Space');
    await expect(sixth).toBeFocused();
    await expect(sixth).not.toBeChecked();
    await page.locator('input[name=interests][value=Coffee]').focus();
    await page.keyboard.press('Space');
    await sixth.focus();
    await page.keyboard.press('Space');
    assert.deepEqual(await selected(page),['Reading','Films','Music','Photography','Travel']);
    await page.locator('#profile-form button[type=reset]').click();
    await expect(page.locator('#interest-feedback')).toHaveText('3 / 5 interests selected.');
    await context.close();
  });

  await check('B-03','HTML-like text stays inert; 30/300-character values fit at 390 px',async()=>{
    const {context,page}=await profile({viewport:{width:390,height:844}});
    let dialogs=0;
    page.on('dialog',async d=>{dialogs++;await d.dismiss();});
    const name='<img src=x onerror=alert(1)>';
    const bio='<script>window.previewInjected=true</script>'+'X'.repeat(257);
    await page.locator('#nickname').fill(name);
    await page.locator('#bio').fill(bio.slice(0,300));
    await expect(page.locator('#preview-name')).toHaveText(name);
    await expect(page.locator('#preview-bio')).toHaveText(bio.slice(0,300));
    assert.equal(await page.locator('#preview-name img, #preview-bio script').count(),0);
    assert.equal(await page.evaluate(()=>window.previewInjected),undefined);
    assert.equal(dialogs,0);
    await noOverflow(page,'HTML-like long preview');
    await page.locator('#nickname').fill('W'.repeat(30));
    await page.locator('#bio').fill('X'.repeat(300));
    await noOverflow(page,'Unbroken maximum text');
    await shot(page,'B_safe_text.png');
    await context.close();
  });

  await check('B-04','Keyboard tab order, visible focus, native controls and preview status work',async()=>{
    const {context,page}=await profile({viewport:{width:390,height:844}});
    await page.locator('#nickname').focus();
    await page.keyboard.press('ControlOrMeta+A');
    await page.keyboard.type('Keyboard Example');
    await expect(page.locator('#preview-name')).toHaveText('Keyboard Example');
    await expect(page.locator('#preview-status')).toContainText('not saved');
    await expect(page.locator('#preview-status')).toHaveAttribute('aria-live','polite');
    const focus=await page.locator('#nickname').evaluate(el=>({style:getComputedStyle(el).outlineStyle,width:getComputedStyle(el).outlineWidth}));
    assert.equal(focus.style,'solid');assert.equal(focus.width,'3px');
    await page.keyboard.press('Tab');
    await expect(page.locator('#bio')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name=interests]').first()).toBeFocused();
    const chipOutline=await page.locator('input[name=interests]').first().evaluate(el=>getComputedStyle(el.labels[0].querySelector('span')).outlineStyle);
    assert.equal(chipOutline,'solid');
    for(let i=0;i<await page.locator('input[name=interests]').count();i++) await page.keyboard.press('Tab');
    await expect(page.locator('#goal')).toBeFocused();
    const before=await page.locator('#goal').inputValue();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#goal')).not.toHaveValue(before);
    await page.keyboard.press('Tab');
    await expect(page.locator('#discoverable')).toBeFocused();
    const checked=await page.locator('#discoverable').isChecked();
    await page.keyboard.press('Space');
    assert.equal(await page.locator('#discoverable').isChecked(),!checked);
    await page.keyboard.press('Tab');
    await expect(page.locator('#profile-form button[type=submit]')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#profile-form button[type=reset]')).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#preview-status')).toContainText('Saved profile.');
    await shot(page,'B_keyboard.png',false);
    await context.close();
  });

  await check('B-05','Desktop/390 px navigation has an active destination and reachable content without overflow',async()=>{
    const {context,page}=await profile();
    for(const width of [1440,390]) {
      await page.setViewportSize({width,height:width===390?844:1000});
      for(const route of ['/profile','/discover','/connections','/safety']) {
        await page.goto(base+route);
        const nav=width===390?page.locator('.mobile-nav'):route==='/profile'?page.locator('.site-account'):page.locator('.site-links');
        if(width===390||route==='/profile') await nav.locator('summary').click();
        const active=nav.locator('[aria-current=page]');
        await expect(active).toHaveAttribute('href',route);
        await expect(active).toBeVisible();
        if(width===390||route==='/profile') await nav.locator('summary').click();
        await expect(page.locator('h1').first()).toBeVisible();
        await noOverflow(page,width+'px '+route);
        if(route==='/profile') {
          const save=page.locator('#profile-form button[type=submit]');
          await save.scrollIntoViewIfNeeded();
          await save.click({trial:true}); // Actionability detects overlapping navigation without saving.
          await page.locator('#preview-status').scrollIntoViewIfNeeded();
          await expect(page.locator('#preview-status')).toBeVisible();
        }
      }
      const profileNav=page.locator(width===390?'.mobile-nav':'.site-account');
      await profileNav.locator('summary').click();
      await profileNav.locator('a[href="/profile"]').click();
      await expect(page).toHaveURL(/\/profile$/);
      await page.locator('#preview-name').scrollIntoViewIfNeeded();
      await shot(page,width===390?'B_mobile.png':'B_desktop.png');
    }
    await context.close();
  });

  await check('B-06','Both temporary languages associate controls; reduced motion removes animation',async()=>{
    const {context,page}=await profile({viewport:{width:390,height:844},reducedMotion:'reduce'});
    for(const language of ['en','zh']) {
      await page.goto(base+'/profile?lang='+language);
      await expect(page.locator('html')).toHaveAttribute('lang',language);
      const controls=await page.locator('#profile-form input:not([type=hidden]),#profile-form textarea,#profile-form select').evaluateAll(
        elements=>elements.map(el=>({id:el.id,label:[...el.labels].map(x=>x.textContent.trim()).join('')})));
      assert.ok(controls.every(x=>x.id&&x.label),'Every interactive form field has a real label');
      await page.locator('#nickname').fill('Language Example');
      await expect(page.locator('#preview-status')).toContainText(language==='en'?'not saved':'才会保存');
      await pick(page,['Coffee','Reading','Films','Music','Photography']);
      await page.locator('input[value=Travel]').locator('..').click();
      await expect(page.locator('#interest-feedback')).toContainText(language==='en'?'was not added':'未添加');
      const motion=await page.locator('#profile-form button[type=submit]').evaluate(el=>({
        matches:matchMedia('(prefers-reduced-motion: reduce)').matches,
        animation:getComputedStyle(el).animationName,transition:getComputedStyle(el).transitionDuration
      }));
      assert.equal(motion.matches,true);
      assert.equal(motion.animation,'none');
      assert.ok(motion.transition.split(',').every(value=>parseFloat(value)<=0.00001), 'Reduced transitions are at most 0.01 ms, matching the shared theme');
      await noOverflow(page,language+' reduced-motion profile');
      if(language==='zh') await shot(page,'B_chinese.png');
    }
    await context.close();
  });

  await check('B-FALLBACK','JavaScript-disabled saves work and six interests are rejected by the server without data loss',async()=>{
    const {context,page}=await profile({javaScriptEnabled:false});
    const oldName=await page.locator('#nickname').inputValue();
    await pick(page,['Coffee','Reading','Films','Music','Photography','Travel']);
    await page.locator('#nickname').fill('Rejected Example');
    await Promise.all([page.waitForNavigation(),page.locator('#profile-form button[type=submit]').click()]);
    await expect(page.locator('#interests-error')).not.toBeEmpty();
    await expect(page.locator('#nickname')).toHaveValue('Rejected Example');
    assert.equal((await selected(page)).length,6);
    await page.goto(base+'/profile');
    await expect(page.locator('#nickname')).toHaveValue(oldName);
    await page.locator('#bio').fill('Native form without JavaScript.');
    await Promise.all([page.waitForNavigation(),page.locator('#profile-form button[type=submit]').click()]);
    await page.reload();
    await expect(page.locator('#preview-bio')).toHaveText('Native form without JavaScript.');
    await context.close();
  });
  assert.deepEqual(pageErrors,[],'No JavaScript errors');
  result.exitCode=0;
} catch(error) {
  result.errors.push(error.stack||String(error));
  result.pageErrors=pageErrors;
  if(current) result.domDiagnostics=await current.evaluate(()=>({scripts:[...document.scripts].map(s=>s.src),controls:[...document.querySelectorAll('#profile-form input')].map(e=>({id:e.id,name:e.name,type:e.type}))})).catch(()=>null);
  log('Page errors: '+JSON.stringify(pageErrors));
  log('FAIL '+String(error));
} finally {
  result.finishedAt=new Date().toISOString();
  log('Browser exit code: '+result.exitCode);
  result.output=output;
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');
  fs.writeFileSync(path.join(output,'browser-output.txt'),lines.join('\n')+'\n');
  fs.writeFileSync(path.join(outputParent,'latest.json'),JSON.stringify({output},null,2)+'\n');
  // A clearly labelled viewer of this real run, not a simulated terminal or CI badge.
  if(browser) {
    const report=await browser.newPage({viewport:{width:1440,height:900}});
    const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
    await report.setContent('<html lang="en"><title>B browser test output</title><body style="background:#101722;color:#e5eaf0;font:17px monospace;padding:30px"><h1>Actual browser test output</h1><p>Log viewer - not a terminal or CI screenshot</p><pre style="white-space:pre-wrap;overflow-wrap:anywhere">'+escape(lines.join('\n'))+'</pre></body></html>');
    await report.screenshot({path:path.join(output,'B_tests.png'),fullPage:true});
    await browser.close();
  }
  server.kill();
  if(server.exitCode===null) await Promise.race([new Promise(resolve=>server.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,5000))]);
  console.log('Evidence directory: '+output);
  process.exitCode=result.exitCode;
}
