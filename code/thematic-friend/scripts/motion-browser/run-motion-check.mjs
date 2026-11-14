import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.MINGLE_PLAYWRIGHT_MODULE || new URL('../profile-browser/node_modules/playwright/index.mjs',import.meta.url).href);
const captureModule=process.env.MINGLE_CAPTURE_MODULE ? await import(process.env.MINGLE_CAPTURE_MODULE) : null;

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const parent=path.resolve(process.env.MINGLE_TEST_OUTPUT || path.join(root,'.local/motion-browser-verification'));
await fs.mkdir(parent,{recursive:true});
const output=await fs.mkdtemp(path.join(parent,'motion-'));
const jar=path.resolve(process.env.MINGLE_TEST_JAR || path.join(root,'target/thematic-friend-0.0.1-SNAPSHOT.jar'));
const jarSha256=crypto.createHash('sha256').update(await fs.readFile(jar)).digest('hex');
const java=process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java') : 'java';
const socket = net.createServer();
await new Promise(resolve => socket.listen(0, '127.0.0.1', resolve));
const port = socket.address().port;
await new Promise(resolve => socket.close(resolve));
const base = 'http://127.0.0.1:' + port, password = crypto.randomBytes(18).toString('base64url');
const log = fsSync.openSync(path.join(output, 'server.log'), 'a');
const server = spawn(java, [
  '-jar', jar,
  '--spring.profiles.active=demo', '--server.address=127.0.0.1', '--server.port=' + port
], {cwd:root,windowsHide:true,env:{...process.env,APP_DATA_DIR:path.join(output,'database'),TONGPIN_DEMO_PASSWORD:password},stdio:['ignore',log,log]});
fsSync.closeSync(log);
let launchError;
server.on('error',error=>{launchError=error;});
let browser, active, phase='initial';
const checks=[], errors=[], captures=[];
const ok=(id,detail)=>{checks.push({id,detail,result:'PASS'});console.log('PASS '+id+' '+detail);};

async function session(options={}) {
  const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',...options});
  // Observe real browser animations without replacing application methods.
  await context.addInitScript(() => {
    window.motionObserved={effects:[],maxOverflow:0};
    const seen=new WeakSet();
    function sample(){
      window.motionObserved.maxOverflow=Math.max(window.motionObserved.maxOverflow,document.documentElement.scrollWidth-innerWidth);
      for(const animation of document.getAnimations()){
        if(seen.has(animation))continue;seen.add(animation);
        const node=animation.effect?.target;if(!(node instanceof Element))continue;
        window.motionObserved.effects.push({
          id:node.id,className:node.getAttribute('class')||'',tag:node.tagName,
          chat:Boolean(node.closest('#messages')),match:Boolean(node.closest('.match-pair')),
          duration:animation.effect.getTiming().duration,delay:animation.effect.getTiming().delay
        });
      }
      requestAnimationFrame(sample);
    }
    document.addEventListener('DOMContentLoaded',sample,{once:true});
  });
  const page=await context.newPage();page.setDefaultTimeout(10000);active=page;
  page.on('pageerror',error=>errors.push({message:error.message,stack:error.stack,url:page.url(),phase}));
  page.on('response',response=>{if(response.status()>=500)errors.push(response.status()+' '+response.url());});
  return {context,page};
}
async function login(s,user){
  await s.page.goto(base+'/login');await s.page.locator('#username').fill(user);await s.page.locator('#password').fill(password);
  await Promise.all([s.page.waitForURL(u=>u.pathname==='/explore'),s.page.locator('form[action="/login"] button').click()]);
}
async function settled(page){
  await page.waitForFunction(()=>document.getAnimations().every(a=>a.playState!=='running'&&a.playState!=='pending'));
}
async function capture(page,name){
  await settled(page);await page.evaluate(()=>document.fonts.ready);
  const file=path.join(output,name+'.png');
  if(captureModule)await captureModule.captureScreenshot(page,{file,cursor:'arrow'});
  else await page.screenshot({path:file,type:'png'});
  captures.push(name+'.png');
}
async function submit(page,selector){
  await Promise.all([page.waitForNavigation(),page.locator(selector).click()]);
}
async function send(page,text){
  await page.locator('#body').fill(text);await page.locator('#message-form button').click();
  await page.locator('#messages .message>p').filter({hasText:text}).waitFor({state:'visible'});
}

try {
  let ready=false;
  for(let i=0;i<80;i++){
    if(launchError)throw launchError;
    if(server.exitCode!==null)throw new Error('Inspection server exited.');
    try {if((await fetch(base,{signal:AbortSignal.timeout(600)})).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,400));
  }
  assert.ok(ready,'Inspection server must start.');
  browser=await chromium.launch({headless:true,...(process.env.MINGLE_BROWSER_PATH?{executablePath:process.env.MINGLE_BROWSER_PATH}:{})});
  const a=await session(),b=await session();
  await login(a,'demo_zhou');await login(b,'demo_lin');
  await settled(a.page);
  const feed=await a.page.evaluate(()=>window.motionObserved.effects.filter(e=>e.className.includes('event-card')));
  assert.ok(feed.length>=3&&new Set(feed.map(e=>e.delay)).size>=3);
  assert.equal(await a.page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await capture(a.page,'01-explore-settled');
  ok('STAGGER','Visible event cards actually animate with staggered start times and settle to readable content.');

  const target=a.page.locator('.people-card').filter({has:a.page.getByRole('heading',{name:'Alex Lin',exact:true})});
  await target.click();await settled(a.page);
  const card=a.page.locator('#swipe-card'),box=await card.boundingBox();
  await a.page.mouse.move(box.x+box.width*.8,box.y+box.height*.3);
  await a.page.waitForFunction(()=>document.querySelector('#swipe-card').style.transform.includes('perspective'));
  const posts=[];a.page.on('request',r=>{if(r.method()==='POST'&&/\/decisions\/\d+$/.test(new URL(r.url()).pathname))posts.push(r.url());});
  await a.page.mouse.move(box.x+box.width/2,box.y+box.height/2);await a.page.mouse.down();
  await a.page.mouse.move(box.x+box.width/2+48,box.y+box.height/2,{steps:10});
  const springSamples=a.page.evaluate(()=>new Promise(resolve=>{
    const samples=[],started=performance.now();
    function sample(){samples.push(new DOMMatrixReadOnly(getComputedStyle(document.querySelector('#swipe-card')).transform).m41);
      if(performance.now()-started<600)requestAnimationFrame(sample);else resolve(samples);}
    requestAnimationFrame(sample);
  }));
  await a.page.mouse.up();
  const movement=await springSamples;
  assert.ok(movement.some(x=>x<-.3),'A released short drag must pass the resting point before settling.');
  await a.page.waitForFunction(()=>window.motionObserved.effects.some(e=>e.id==='swipe-card'));
  await settled(a.page);assert.equal(posts.length,0);assert.equal(await card.getAttribute('aria-busy'),null);
  await a.page.mouse.move(20,150);await settled(a.page);
  await capture(a.page,'02-magnetic-card-settled');
  ok('MAGNET','Pointer tilt responds; a short real drag springs back without a decision POST.');

  await submit(a.page,'#like-form button');
  await b.page.locator('.people-card').filter({has:b.page.getByRole('heading',{name:'Jamie Zhou',exact:true})}).click();
  await submit(b.page,'#like-form button');
  const matchPath=new URL(b.page.url()).pathname;
  assert.match(matchPath,/^\/matches\/\d+$/);
  await b.page.waitForFunction(()=>window.motionObserved.effects.filter(e=>e.match).length>=4);
  await settled(b.page);
  assert.equal(await b.page.locator('.match-heart').evaluate(e=>getComputedStyle(e).opacity),'1');
  assert.ok((await b.page.locator('.match-confirmation').innerText()).length>10);
  await capture(b.page,'03-match-settled');
  for(const width of [390,320]){
    await b.page.setViewportSize({width,height:844});await b.page.reload();await settled(b.page);
    assert.equal(await b.page.evaluate(()=>window.motionObserved.maxOverflow),0,'Match motion must fit at '+width);
    await capture(b.page,'04-match-'+width);
  }
  await b.page.setViewportSize({width:1440,height:1000});
  ok('MATCH','Real mutual match runs the two-card/heart sequence; 390/320 px animation and final states fit.');

  await b.page.locator('#open-conversation').click();const chatPath=new URL(b.page.url()).pathname;
  await a.page.goto(base+chatPath);await settled(a.page);await settled(b.page);
  await send(a.page,'Coffee after class?');
  await b.page.locator('#messages .message>p').filter({hasText:'Coffee after class?'}).waitFor({state:'visible'});
  await b.page.waitForFunction(()=>window.motionObserved.effects.some(e=>e.chat));
  await settled(a.page);await settled(b.page);
  const count=await b.page.evaluate(()=>window.motionObserved.effects.filter(e=>e.chat).length);
  await b.page.waitForTimeout(3300);
  assert.equal(await b.page.evaluate(()=>window.motionObserved.effects.filter(e=>e.chat).length),count);
  assert.equal(await b.page.locator('#messages .message').count(),1);
  await capture(a.page,'05-chat-settled');
  ok('CHAT-MOTION','A confirmed message animates for sender and receiver; the next empty poll neither duplicates nor replays it.');

  await a.page.goto(base+'/events');await a.page.locator('.event-card').first().click();
  const eventPath=new URL(a.page.url()).pathname,save='form[action$="/save"] button';
  await submit(a.page,save);
  await a.page.waitForFunction(()=>window.motionObserved.effects.some(e=>e.className==='motion-particle'));
  assert.equal(await a.page.locator(save).getAttribute('aria-pressed'),'true');
  await settled(a.page);assert.equal(await a.page.locator('.motion-particles').count(),0);
  await a.page.reload();await settled(a.page);
  assert.equal(await a.page.evaluate(()=>window.motionObserved.effects.filter(e=>e.className==='motion-particle').length),0);
  await submit(a.page,save);await settled(a.page);
  assert.equal(await a.page.locator(save).getAttribute('aria-pressed'),'false');
  assert.equal(await a.page.evaluate(()=>window.motionObserved.effects.filter(e=>e.className==='motion-particle').length),0);
  phase='denied-save';
  await a.page.route('**'+eventPath+'/save',route=>route.fulfill({status:403,contentType:'text/html',body:'<h1>Inspection: save denied</h1>'}),{times:1});
  await submit(a.page,save);await a.page.goto(base+eventPath);await settled(a.page);
  assert.equal(await a.page.locator(save).getAttribute('aria-pressed'),'false');
  assert.equal(await a.page.evaluate(()=>window.motionObserved.effects.filter(e=>e.className==='motion-particle').length),0);
  ok('SAVE-MOTION','Particles follow confirmed saving, clean up, and do not replay after refresh, unsaving or a denied request.');

  phase='manual-reduced-motion';
  await a.page.goto(base+'/profile');await a.page.locator('[data-motion-preference]').check();
  await a.page.goto(base+eventPath);await submit(a.page,save);await settled(a.page);
  assert.equal(await a.page.locator(save).getAttribute('aria-pressed'),'true');
  assert.equal(await a.page.evaluate(()=>window.motionObserved.effects.some(e=>e.className==='motion-particle')),false);
  await a.page.goto(base+matchPath);await settled(a.page);
  assert.equal(await a.page.evaluate(()=>window.motionObserved.effects.some(e=>e.match)),false);
  phase='system-reduced-motion';
  const reduced=await session({reducedMotion:'reduce',viewport:{width:390,height:844}});
  await login(reduced,'demo_lin');await reduced.page.goto(base+matchPath);await settled(reduced.page);
  assert.equal(await reduced.page.evaluate(()=>window.motionObserved.effects.some(e=>e.match)),false);
  await reduced.page.goto(base+chatPath);await send(reduced.page,'The quiet version works too.');
  await settled(reduced.page);
  assert.equal(await reduced.page.evaluate(()=>window.motionObserved.effects.some(e=>e.chat)),false);
  await capture(reduced.page,'06-reduced-chat-mobile');
  ok('REDUCED','Both manual and operating-system reduced motion suppress effects while real save, match and message actions work.');
  assert.deepEqual(errors,[]);
  ok('RUNTIME','No browser exceptions or server 5xx errors during motion inspection.');
} catch(error) {
  errors.push(error.stack||error.message);console.error(error.stack||error.message);process.exitCode=1;
  if(active&&!active.isClosed())await active.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});
} finally {
  if(browser)await browser.close();server.kill();
  await Promise.race([new Promise(resolve=>server.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,5000))]);
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({at:new Date().toISOString(),jarSha256,node:process.version,platform:process.platform,checks,errors,captures,exitCode:process.exitCode||0},null,2));
  console.log('Motion inspection: '+output);
}
