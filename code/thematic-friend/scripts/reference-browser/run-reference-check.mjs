import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Separate cookie jars and a fresh local database; shared preview data is untouched.
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const parent=path.join(root,'.local/reference-browser-verification');
await fs.mkdir(parent,{recursive:true});
const output=await fs.mkdtemp(path.join(parent,'review-'));
const reservation=net.createServer();
await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
const port=reservation.address().port;
await new Promise(resolve=>reservation.close(resolve));
const base=`http://127.0.0.1:${port}`,password=crypto.randomBytes(18).toString('base64url');
const java=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin/java.exe'):'java';
const log=fsSync.openSync(path.join(output,'server.log'),'a');
const server=spawn(java,['-jar',path.join(root,'target/thematic-friend-0.0.1-SNAPSHOT.jar'),'--spring.profiles.active=demo','--server.address=127.0.0.1',`--server.port=${port}`],{cwd:root,windowsHide:true,env:{...process.env,APP_DATA_DIR:path.join(output,'database'),TONGPIN_DEMO_PASSWORD:password},stdio:['ignore',log,log]});
fsSync.closeSync(log);
const checks=[],issues=[],screenshots=[];
let browser,activePage;
const ok=(id,detail)=>{checks.push({id,detail,result:'PASS'});console.log('PASS '+id+' '+detail);};
const captureModule=process.env.MINGLE_CAPTURE_MODULE?await import(process.env.MINGLE_CAPTURE_MODULE):null;
async function snapshot(page,name,fullPage=false){
 await page.evaluate(()=>document.fonts.ready);
 const file=path.join(output,name+'.png');
 if(captureModule)await captureModule.captureScreenshot(page,{file,cursor:'arrow',fullPage});else await page.screenshot({path:file,type:'png',fullPage});
 screenshots.push(name+'.png');
}
async function session(options={}){
 const context=await browser.newContext({viewport:{width:1440,height:1000},locale:'en-US',...options});
 const page=await context.newPage();page.setDefaultTimeout(12000);activePage=page;
 page.on('pageerror',e=>issues.push(e.message));
 page.on('response',r=>{if(r.status()>=500||(r.status()>=400&&/\/(css|js|images|fonts)\//.test(r.url())))issues.push(r.status()+' '+r.url());});
 return {context,page};
}
async function login(s,user){
 await s.page.goto(base+'/login');await s.page.locator('#username').fill(user);await s.page.locator('#password').fill(password);
 await Promise.all([s.page.waitForURL(u=>u.pathname==='/explore'),s.page.locator('form[action="/login"] button[type=submit]').click()]);
}
async function submit(page,selector){await Promise.all([page.waitForNavigation(),page.locator(selector).click()]);}
async function noOverflow(page){assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Page must fit: '+page.url());}
async function eventAction(page,kind){await submit(page,`form[action$="/${kind}"] button`);}
async function seeMessage(page,text){await page.locator('#messages .message>p').filter({hasText:text}).last().waitFor({state:'visible'});}
async function send(page,text){await page.locator('#body').fill(text);await page.locator('#message-form button[type=submit]').click();await seeMessage(page,text);}

try{
 let ready=false;
 for(let attempt=0;attempt<100;attempt++){
  if(server.exitCode!==null)throw new Error('Test server stopped before becoming ready.');
  try{const response=await fetch(base,{signal:AbortSignal.timeout(600)});if(response.ok){ready=true;break;}}catch{}
  await new Promise(resolve=>setTimeout(resolve,400));
 }
 if(!ready)throw new Error('Test server startup timed out.');
 const {chromium}=await import(process.env.MINGLE_PLAYWRIGHT_MODULE||'playwright');
 browser=await chromium.launch({headless:true,...(process.env.MINGLE_BROWSER_PATH?{executablePath:process.env.MINGLE_BROWSER_PATH}:{})});
 const a=await session(),b=await session();
 let response=await a.page.goto(base+'/?lang=en');assert.equal(response.status(),200);await a.page.evaluate(()=>document.fonts.ready);
 assert.equal(await a.page.locator('.capsule-nav').isVisible(),true);assert.equal(await a.page.evaluate(()=>document.fonts.check('100px FeeldEdge')),true);
 await snapshot(a.page,'01-home-desktop');await a.page.locator('[data-video-toggle]').click();assert.equal(await a.page.locator('video').evaluate(v=>v.paused),true);
 for(const width of [320,390,768]){
  await a.page.setViewportSize({width,height:844});await noOverflow(a.page);await a.page.locator('.public-header .mobile-nav>summary').click();
  assert.equal(await a.page.locator('.public-header .mobile-nav nav a[href="/events"]').isVisible(),true);await a.page.keyboard.press('Escape');
 }
 await a.page.setViewportSize({width:390,height:844});await snapshot(a.page,'02-home-mobile');await a.page.setViewportSize({width:1440,height:1000});
 ok('HOME','Reference fonts/media, video pause, mobile menu at 320/390/768 px.');
 await login(a,'demo_zhou');await login(b,'demo_lin');assert.equal(await a.page.locator('.event-card').count(),6);
 await snapshot(a.page,'03-explore-desktop',true);
 await a.page.goto(base+'/events');await a.page.locator('#event-query').fill('Fall');await a.page.locator('#event-category').selectOption('Hiking');
 await submit(a.page,'.filter-form button');assert.equal(await a.page.locator('.event-card').count(),1);
 await a.page.locator('#event-city').fill('NoSuchCity');await submit(a.page,'.filter-form button');assert.equal(await a.page.locator('.event-card').count(),0);
 await a.page.goto(base+'/events');await a.page.locator('.event-card').first().click();const eventPath=new URL(a.page.url()).pathname;
 await a.page.locator('.action-dock form[action$="/attendance"]').waitFor();await snapshot(a.page,'04-event-desktop',true);
 await a.page.locator('[data-open-photo]').click();assert.equal(await a.page.locator('#event-photo').evaluate(d=>d.open),true);await a.page.keyboard.press('Escape');
 for(const width of [320,390,768]){
  await a.page.setViewportSize({width,height:844});await noOverflow(a.page);
  assert.equal(await a.page.locator('.action-dock form[action$="/attendance"] button').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight&&r.right<=innerWidth;}),true);
 }
 await a.page.setViewportSize({width:390,height:844});await snapshot(a.page,'05-event-mobile');await a.page.setViewportSize({width:1440,height:1000});
 await eventAction(a.page,'save');assert.equal(await a.page.locator('form[action$="/save"] button').getAttribute('aria-pressed'),'true');
 await a.page.goto(base+'/events?view=saved');assert.equal(await a.page.locator('.event-card').count(),1);await b.page.goto(base+'/events?view=saved');assert.equal(await b.page.locator('.event-card').count(),0);
 await a.page.goto(base+eventPath);await eventAction(a.page,'attendance');assert.equal(await a.page.locator('.attendee').count(),1);
 await b.page.goto(base+eventPath);await eventAction(b.page,'attendance');assert.equal(await b.page.locator('.attendee').count(),2);
 await eventAction(b.page,'attendance');assert.equal(await b.page.locator('.attendee').count(),1);await a.page.reload();
 assert.equal(await a.page.locator('form[action$="/attendance"] input[name=attending]').inputValue(),'false');
 await a.page.goto(base+'/events?view=going');assert.equal(await a.page.locator('.event-card').count(),1);
 ok('EVENTS','Search/city/topic filters, personal bookmarks, two-account RSVP/cancel and persistence.');
 const native=await session({javaScriptEnabled:false});await native.page.goto(base+eventPath);assert.equal(new URL(native.page.url()).pathname,'/login');
 await native.page.locator('#username').fill('demo_chen');await native.page.locator('#password').fill(password);await submit(native.page,'form[action="/login"] button');
 assert.equal(new URL(native.page.url()).pathname,eventPath);await eventAction(native.page,'save');assert.equal(await native.page.locator('form[action$="/save"] button').getAttribute('aria-pressed'),'true');await native.context.close();
 ok('NATIVE','Saved login destination and event actions work without JavaScript.');
 await a.page.goto(base+'/events/new');await a.page.locator('#title').fill('Saturday coffee with friends');await a.page.locator('#description').fill('A relaxed afternoon at the neighbourhood cafe.');
 await a.page.locator('#city').fill('Wuhan');await a.page.locator('#venue').fill('Riverside Cafe');await a.page.locator('#startsAt').fill('2027-01-16T14:00');await a.page.locator('#capacity').fill('8');
 await submit(a.page,'main form button[type=submit]');assert.equal(await a.page.locator('.detail-copy>h1').innerText(),'Saturday coffee with friends');assert.equal(await a.page.locator('.detail-host strong').innerText(),'Jamie Zhou');
 ok('CREATE','Published event persists with the authenticated host.');
 await a.page.goto(base+'/explore');const alexCard=a.page.locator('.people-card').filter({has:a.page.getByRole('heading',{name:'Alex Lin',exact:true})});
 const alexHref=await alexCard.getAttribute('href');await alexCard.click();assert.equal(await a.page.locator('.detail-copy>h1').innerText(),'Alex Lin');
 assert.equal(new URL(a.page.url()).searchParams.get('member'),new URL(alexHref,base).searchParams.get('member'));await snapshot(a.page,'06-profile-detail');
 await a.page.locator('.photo-open[data-open-profile]').click();assert.equal(await a.page.locator('#profile-details').evaluate(d=>d.open),true);await a.page.keyboard.press('Escape');await submit(a.page,'#like-form button');
 await b.page.goto(base+'/explore');await b.page.locator('.people-card').filter({has:b.page.getByRole('heading',{name:'Jamie Zhou',exact:true})}).click();await submit(b.page,'#like-form button');await b.page.locator('#open-conversation').waitFor();
 await snapshot(b.page,'07-mutual-match');await b.page.locator('#open-conversation').click();const conversation=new URL(b.page.url()).pathname;
 await a.page.goto(base+'/connections');await a.page.locator('.contact-row[href="'+conversation+'"]').click();
 await send(a.page,'你好，周末一起散步吗？');await seeMessage(b.page,'你好，周末一起散步吗？');
 await b.page.locator('#body').fill('Sounds good! ');await b.page.locator('#emoji-toggle').click();await b.page.locator('#emoji-grid button').first().click();const reply=await b.page.locator('#body').inputValue();
 assert.ok(reply.length>'Sounds good! '.length);await b.page.locator('#message-form button[type=submit]').click();await seeMessage(a.page,reply);
 await a.page.locator('#body').fill('Keep this draft');await a.page.locator('#emoji-toggle').click();await a.page.locator('#sticker-tab').click();await a.page.locator('[data-sticker-id="coffee"]').click();
 await b.page.locator('#messages [data-sticker="coffee"]').waitFor();assert.equal(await a.page.locator('#body').inputValue(),'Keep this draft');
 await a.page.reload();await seeMessage(a.page,reply);assert.equal(await a.page.locator('#messages [data-sticker="coffee"]').count(),1);await snapshot(a.page,'08-conversation-desktop');
 for(const width of [320,390,768]){
  await a.page.setViewportSize({width,height:844});await noOverflow(a.page);assert.equal(await a.page.locator('#message-form button').evaluate(e=>{const r=e.getBoundingClientRect();return r.bottom<=innerHeight&&r.right<=innerWidth;}),true,'Composer must fit.');
 }
 await a.page.setViewportSize({width:390,height:844});await snapshot(a.page,'09-conversation-mobile');await a.page.setViewportSize({width:1440,height:1000});
 const noJsChat=await session({javaScriptEnabled:false,storageState:await a.context.storageState()});await noJsChat.page.goto(base+conversation);await noJsChat.page.locator('#body').fill('Native form message');await noJsChat.page.locator('#body').press('Tab');
 await Promise.all([noJsChat.page.waitForNavigation(),noJsChat.page.keyboard.press('Enter')]);await seeMessage(b.page,'Native form message');await noJsChat.context.close();
 ok('CHAT','Two independent accounts mutually connect; text/emoji/stickers, reload and JavaScript-free form delivery pass.');
 for(const route of ['/profile','/safety','/change-password','/connections','/events/new','/privacy']){
  response=await a.page.goto(base+route+'?lang=zh');assert.equal(response.status(),200,route);await noOverflow(a.page);
  assert.equal(await a.page.locator('link[rel=stylesheet]').getAttribute('href'),'/css/reference-ui.css');assert.equal(/\?\?(ui|ref|experience)\./.test(await a.page.locator('body').innerText()),false,'Visible message keys resolve.');
  await a.page.setViewportSize({width:320,height:844});await noOverflow(a.page);await a.page.setViewportSize({width:1440,height:1000});
 }
 await a.page.goto(base+'/profile?lang=zh');await a.page.locator('[data-motion-preference]').check();await a.page.goto(base+'/?lang=zh');
 assert.equal(await a.page.locator('html').getAttribute('data-motion'),'reduced');assert.equal(await a.page.locator('video').evaluate(v=>v.paused),true);
 ok('ACCOUNT','Shared styling, Chinese strings, 320 px account/safety layouts and persistent reduced motion.');
 assert.deepEqual(issues,[]);ok('RUNTIME','No browser exceptions, failed assets or HTTP 5xx.');
}catch(error){issues.push(error.stack||error.message);console.error(error.stack||error.message);process.exitCode=1;if(activePage&&!activePage.isClosed())await snapshot(activePage,'failure',true).catch(()=>{});}
finally{
 if(browser)await browser.close();server.kill();await Promise.race([new Promise(resolve=>server.once('exit',resolve)),new Promise(resolve=>setTimeout(resolve,5000))]);
 await fs.writeFile(path.join(output,'results.json'),JSON.stringify({capturedAt:new Date().toISOString(),base,checks,issues,screenshots,exitCode:process.exitCode||0},null,2));console.log('Browser output: '+output);
}
