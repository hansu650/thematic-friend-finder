import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import {spawn, execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const {chromium} = await import(process.env.MINGLE_PLAYWRIGHT_MODULE || new URL('../profile-browser/node_modules/playwright/index.mjs', import.meta.url).href);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const parent = path.resolve(process.env.MINGLE_TEST_OUTPUT || path.join(root, '.local/usability-checks'));
await fs.mkdir(parent, {recursive:true});
const output = await fs.mkdtemp(path.join(parent, 'B-W4-'));
const jar = path.resolve(process.env.MINGLE_TEST_JAR || path.join(root, 'target/thematic-friend-0.0.1-SNAPSHOT.jar'));
const sha = file => crypto.createHash('sha256').update(fsSync.readFileSync(file)).digest('hex');
const git = args => execFileSync('git', args, {cwd:root, encoding:'utf8', windowsHide:true, stdio:['ignore','pipe','pipe']}).trim();
const result = {startedAt:new Date().toISOString(), command:'node scripts/usability-browser/run-usability-check.mjs',
  operator:'Codex automated inspection; not participant observation or a human screen-reader test',
  jarSha256:sha(jar), runnerSha256:sha(fileURLToPath(import.meta.url)), node:process.version, checks:[], focus:[], errors:[], captures:[]};
try {result.baseCommit=git(['rev-parse','HEAD']); result.workingTree=git(['status','--short']);} catch {result.baseCommit=null;}
const sourceHashes = {};
function sourceTree(dir) {
  for (const entry of fsSync.readdirSync(dir, {withFileTypes:true})) {
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()) sourceTree(file);
    else sourceHashes[path.relative(root,file).replaceAll('\\','/')]=sha(file);
  }
}
sourceTree(path.join(root,'src')); result.sourceSha256=sourceHashes;
const socket=net.createServer();
await new Promise(resolve=>socket.listen(0,'127.0.0.1',resolve));
const port=socket.address().port;
await new Promise(resolve=>socket.close(resolve));
const base='http://127.0.0.1:'+port;
const password=crypto.randomBytes(20).toString('base64url');
const java=process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java') : 'java';
result.java=execFileSync(java,['--version'],{encoding:'utf8',windowsHide:true}).trim();
const log=fsSync.openSync(path.join(output,'server.log'),'w');
const server=spawn(java,['-jar',jar,'--spring.profiles.active=demo','--server.address=127.0.0.1','--server.port='+port,'--app.demo-conversations=true'],{
  cwd:root,windowsHide:true,stdio:['ignore',log,log],
  env:{...process.env,APP_DATA_DIR:path.join(output,'database'),TONGPIN_DEMO_PASSWORD:password,TONGPIN_CHINESE_ENABLED:'false'}});
fsSync.closeSync(log);
let browser,active,launchError;
server.on('error',e=>{launchError=e;});
async function settled(page) {
  await page.waitForFunction(()=>document.getAnimations().every(a=>!['running','pending'].includes(a.playState)));
}
async function screenshot(page,name) {
  await settled(page); await page.screenshot({path:path.join(output,name+'.png'),fullPage:true});
  result.captures.push(name+'.png');
}
async function inspectFocus(page,selector) {
  // Native Tab focus may trigger smooth scrolling. Wait for visibility without
  // scrolling or moving focus from the harness; an off-screen control still fails.
  await page.waitForFunction(selector=>{
    const el=document.querySelector(selector);
    if(!el)return false;
    const visual=el.matches('.interest-options input') ? el.labels[0]?.querySelector('span') : el;
    const r=visual.getBoundingClientRect();
    const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
    return r.width>0&&r.height>0&&r.x+r.width/2>=0&&r.x+r.width/2<innerWidth&&r.y>=0&&r.bottom<=innerHeight&&Boolean(hit&&(visual===hit||visual.contains(hit)));
  },selector,{timeout:2500}).catch(()=>{});
  const info=await page.locator(selector).first().evaluate(el=>{
    const visual=el.matches('.interest-options input') ? (el.labels[0]?.querySelector('span') || el) : el;
    const r=visual.getBoundingClientRect(),s=getComputedStyle(visual),x=r.x+r.width/2,y=r.y+r.height/2;
    const hit=document.elementFromPoint(x,y);
    return {selector:el.id || el.getAttribute('href') || el.tagName, text:visual.textContent.trim().slice(0,70),
      rect:{x:r.x,y:r.y,width:r.width,height:r.height},viewport:{width:innerWidth,height:innerHeight},
      visible:r.width>0&&r.height>0&&x>=0&&x<innerWidth&&y>=0&&y<innerHeight,
      unobscured:Boolean(hit&&(visual===hit||visual.contains(hit)||el===hit||el.contains(hit))),
      outline:s.outlineStyle+' '+s.outlineWidth,boxShadow:s.boxShadow,focusVisible:el.matches(':focus-visible')};
  });
  result.focus.push({route:new URL(page.url()).pathname,...info});
  assert.ok(info.visible&&info.unobscured,'Focused control must be visible and unobscured: '+JSON.stringify(info));
  assert.ok(info.focusVisible,'Keyboard focus should match :focus-visible');
  assert.ok(!info.outline.startsWith('none')||info.boxShadow!=='none','Focus indication must exist: '+selector);
}
async function tabTo(page,selector) {
  for(let i=0;i<120;i++){
    if(await page.locator(selector).first().evaluate(el=>el===document.activeElement)){
      await inspectFocus(page,selector); return;
    }
    await page.keyboard.press('Tab');
  }
  throw Error('Keyboard could not reach '+selector);
}
async function activate(page,selector,navigation=false) {
  await tabTo(page,selector);
  if(navigation) {await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);await settled(page);}
  else await page.keyboard.press('Enter');
}
async function type(page,selector,value) {
  await tabTo(page,selector); await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.type(value);
}
async function navigate(page,route,width) {
  const menu=width<640?'.mobile-nav':null;
  if(menu) {
    await activate(page,menu+' summary');
    await activate(page,menu+' a[href="'+route+'"]',true);
  } else if(route==='/profile') {
    await activate(page,'.site-account summary');
    await activate(page,'.site-account a[href="/profile"]',true);
  } else await activate(page,'.site-links a[href="'+route+'"]',true);
  await settled(page);
}
async function login(width=390,options={}) {
  const context=await browser.newContext({viewport:{width,height:844},locale:'en-GB',...options});
  await context.addInitScript(()=>{
    window.auditEffects=[]; const seen=new WeakSet();
    function sample(){for(const a of document.getAnimations())if(!seen.has(a)){
      seen.add(a); const target=a.effect?.target;
      if(target instanceof Element)window.auditEffects.push({chat:Boolean(target.closest('#messages')),className:target.className,id:target.id,duration:a.effect.getTiming().duration,type:a.constructor.name});
    } requestAnimationFrame(sample);}
    document.addEventListener('DOMContentLoaded',sample,{once:true});
  });
  const page=await context.newPage();active=page;page.setDefaultTimeout(12000);
  page.on('pageerror',e=>result.errors.push(e.message));
  await page.goto(base+'/login');
  await type(page,'#username','demo_zhou');await type(page,'#password',password);
  await activate(page,'form[action="/login"] button[type=submit]',true);
  await settled(page);
  return {context,page};
}
async function noOverflow(page) {
  const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(size.scroll<=size.width,'Page overflows: '+page.url()+' '+JSON.stringify(size));
}
async function check(id,body) {
  if(process.env.MINGLE_CHECK_GROUP && id!==process.env.MINGLE_CHECK_GROUP)return;
  const started=Date.now();
  try {const detail=await body();result.checks.push({id,status:'PASS',detail,durationMs:Date.now()-started});console.log('PASS '+id+' '+detail);}
  catch(error) {result.checks.push({id,status:'FAIL',error:error.stack,durationMs:Date.now()-started});console.error('FAIL '+id+' '+error.message);
    if(active&&!active.isClosed())await screenshot(active,id+'-failure').catch(()=>{});
  }
}
try {
  let ready=false;
  for(let i=0;i<150;i++){
    if(launchError)throw launchError;if(server.exitCode!==null)throw Error('Server exited');
    try{if((await fetch(base+'/login',{signal:AbortSignal.timeout(600)})).ok){ready=true;break;}}catch{}
    await new Promise(r=>setTimeout(r,400));
  }
  assert.ok(ready,'Isolated server starts');
  browser=await chromium.launch({headless:true,...(process.env.MINGLE_BROWSER_PATH?{executablePath:process.env.MINGLE_BROWSER_PATH}:{})});
  result.browser=browser.version();
  await check('B-W4-INBOX',async()=>{
    const {page,context}=await login(390);
    try {
      const widths=[];
      for(const width of [1440,390,320]){
        await page.setViewportSize({width,height:844});await page.goto(base+'/connections');await settled(page);
        await noOverflow(page);
        const geometry=await page.evaluate(()=>{
          const bounds=el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width};};
          return {workspace:bounds(document.querySelector('.inbox-workspace')),pane:bounds(document.querySelector('.inbox-list-pane')),
            controls:[...document.querySelectorAll('#contact-search,.contact-row')].map(el=>({tag:el.tagName,...bounds(el)}))};
        });
        widths.push({width,...geometry});
        await screenshot(page,'B_inbox_'+width);
        result.inboxGeometry=widths;
        assert.ok(geometry.pane.width<=geometry.workspace.width,'Inbox pane must fit the workspace at '+width+': '+JSON.stringify(geometry));
        assert.ok(geometry.controls.every(r=>r.left>=geometry.pane.left&&r.right<=geometry.pane.right&&r.right<=geometry.workspace.right),
          'Search and contact rows must remain inside the visible inbox at '+width+': '+JSON.stringify(geometry));
      }
      return 'Seeded conversation previews, search and contact rows remain inside the visible pane at 1440/390/320 px; inner clipping is checked as well as document overflow.';
    } catch(error) {await screenshot(page,'B_failure_'+Date.now()).catch(()=>{});throw error;} finally {await context.close();}
  });
  for(const width of [390,320]) await check('B-W4-KEYBOARD-'+width,async()=>{
    const {page,context}=await login(width);
    try {
      await navigate(page,'/profile',width);
      const original=await page.locator('#nickname').inputValue();
      await type(page,'#nickname','W'.repeat(30));
      await type(page,'#bio','X'.repeat(300));
      assert.equal(await page.locator('#preview-name').innerText(),'W'.repeat(30));
      await noOverflow(page);await screenshot(page,'B_profile_limits_'+width);
      await activate(page,'#profile-form button[type=reset]');
      await page.waitForFunction(()=>document.querySelector('#profile-form').dataset.dirty==='false');
      assert.equal(await page.locator('#nickname').inputValue(),original);
      await type(page,'#nickname','Keyboard '+width);
      await activate(page,'#profile-form button[type=submit]',true);
      assert.equal(await page.locator('#nickname').inputValue(),'Keyboard '+width);
      await navigate(page,'/discover',width);await noOverflow(page);
      await tabTo(page,'#like-form button');
      await screenshot(page,'B_discover_keyboard_'+width);
      await navigate(page,'/events',width);
      await activate(page,'.event-card',true);await noOverflow(page);
      const save='form[action$="/save"] button';
      const before=await page.locator(save).getAttribute('aria-pressed');
      await activate(page,save,true);
      assert.notEqual(await page.locator(save).getAttribute('aria-pressed'),before);
      await screenshot(page,'B_event_keyboard_'+width);
      await navigate(page,'/connections',width);await noOverflow(page);
      await activate(page,'.contact-row',true);await settled(page);await noOverflow(page);
      await type(page,'#body','Keyboard walkthrough '+width);
      await activate(page,'#message-form button[type=submit]');
      await page.locator('#messages .message:not(.pending)>p').filter({hasText:'Keyboard walkthrough '+width}).waitFor();
      await screenshot(page,'B_chat_keyboard_'+width);
      // Final release-mode guard, with no claim that user text is translated.
      await page.goto(base+'/profile?lang=zh');
      assert.equal(await page.locator('html').getAttribute('lang'),'en');
      assert.equal(await page.locator('.language-switch:visible').count(),0);
      return 'Keyboard login, profile edit/reset/save, Meet control, event save and conversation send; 30/300-character profile; no document overflow; final English mode.';
    } catch(error) {await screenshot(page,'B_failure_'+Date.now()).catch(()=>{});throw error;} finally {await context.close();}
  });
  await check('B-W4-HISTORY',async()=>{
    const {page,context}=await login(390);
    try{
      await navigate(page,'/connections',390);await activate(page,'.contact-row',true);
      const url=page.url();
      const fixture=await page.locator('#messages').evaluate(el=>({url:el.dataset.url,token:el.dataset.csrf,header:el.dataset.csrfHeader}));
      // Explicit fixture setup via the real authenticated API, not a claim of typing 105 messages.
      for(let i=0;i<105;i++){
        const response=await context.request.post(base+fixture.url,{headers:{[fixture.header]:fixture.token,Accept:'application/json'},
          form:{body:'B history fixture '+i,clientMessageId:crypto.randomUUID()}});
        assert.equal(response.status(),200);
      }
      await page.goto(url);await settled(page);
      assert.equal(await page.locator('#messages [data-message-id]').count(),100);
      await activate(page,'#load-older');
      await page.waitForFunction(()=>document.querySelectorAll('#messages [data-message-id]').length>100);
      await settled(page);
      const ids=await page.locator('#messages [data-message-id]').evaluateAll(rows=>rows.map(r=>Number(r.dataset.messageId)));
      assert.equal(new Set(ids).size,ids.length);
      assert.deepEqual(ids,[...ids].sort((a,b)=>a-b));
      assert.equal(await page.evaluate(()=>window.auditEffects.filter(e=>e.chat).length),0);
      for(let i=0;i<2;i++)await page.waitForResponse(r=>r.request().method()==='GET'&&new URL(r.url()).pathname===fixture.url);
      assert.equal(await page.locator('#messages [data-message-id]').count(),ids.length);
      assert.equal(await page.evaluate(()=>window.auditEffects.filter(e=>e.chat).length),0);
      await screenshot(page,'B_history_no_replay');
      return ids.length+' ordered, unique messages after keyboard history load; no chat arrival effect on history or two subsequent polls.';
    } catch(error) {await screenshot(page,'B_failure_'+Date.now()).catch(()=>{});throw error;} finally {await context.close();}
  });
  await check('B-W4-REDUCED-PREFERENCES',async()=>{
    for(const mode of ['manual','system']){
      const {page,context}=await login(320,{reducedMotion:mode==='system'?'reduce':'no-preference'});
      try {
        await navigate(page,'/profile',320);
        if(mode==='manual'){await tabTo(page,'[data-motion-preference]');await page.keyboard.press('Space');}
        assert.equal(await page.locator('[data-motion-preference]').isChecked(),mode==='manual');
        assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches),mode==='system');
        await page.waitForFunction(()=>document.documentElement.dataset.motion==='reduced');
        await type(page,'#nickname','Reduced '+mode);await activate(page,'#profile-form button[type=submit]',true);
        await navigate(page,'/discover',320);await noOverflow(page);
        await page.mouse.move(180,450);
        assert.equal(await page.evaluate(()=>window.MingleMotion.reduced()),true);
        await tabTo(page,'#like-form button');
        await navigate(page,'/connections',320);await activate(page,'.contact-row',true);
        await type(page,'#body','Reduced mode '+mode);await activate(page,'#message-form button[type=submit]');
        await page.locator('#messages .message:not(.pending)>p').filter({hasText:'Reduced mode '+mode}).waitFor();
        await settled(page);
        const observation=await page.evaluate(()=>({manual:localStorage.getItem('mingle.motion.v1'),system:matchMedia('(prefers-reduced-motion:reduce)').matches,setting:document.documentElement.dataset.motion,reduced:window.MingleMotion.reduced(),effects:window.auditEffects.filter(e=>e.chat)}));
        (result.reducedObservations ||= []).push({mode,...observation});
        assert.equal(observation.reduced,true);
        // Shared reduced-motion CSS intentionally retains 0.01 ms focus transitions.
        // Any JavaScript bubble animation or longer CSS transition must still fail.
        assert.ok(observation.effects.every(effect=>effect.type==='CSSTransition'&&Number(effect.duration)<=0.01),
          JSON.stringify({mode,...observation}));
        await screenshot(page,'B_reduced_'+mode+'_320');
      } catch(error) {await screenshot(page,'B_failure_'+Date.now()).catch(()=>{});throw error;} finally {await context.close();}
    }
    return 'Manual preference with OS no-preference, then independent OS reduce with manual unchecked; profile save and keyboard message send remain usable at 320 px; no JavaScript chat arrival animation and only at-most-0.01 ms CSS transitions.';
  });
  assert.deepEqual(result.errors,[]);
} catch(error) {result.errors.push(error.stack||error.message);}
finally {
  if(browser)await browser.close();server.kill();
  if(server.exitCode===null)await Promise.race([new Promise(r=>server.once('exit',r)),new Promise(r=>setTimeout(r,5000))]);
  result.finishedAt=new Date().toISOString();
  result.exitCode=result.errors.length||result.checks.some(c=>c.status==='FAIL')?1:0;
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify(result,null,2)+'\n');
  console.log('Usability inspection: '+output);process.exitCode=result.exitCode;
}

