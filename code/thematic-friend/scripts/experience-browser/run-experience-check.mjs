import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import net from 'node:net';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const {chromium}=await import(process.env.MINGLE_PLAYWRIGHT_MODULE||'playwright');
const captureHelper=process.env.MINGLE_CAPTURE_MODULE?await import(process.env.MINGLE_CAPTURE_MODULE):null;
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const parent=path.resolve(process.env.MINGLE_TEST_OUTPUT||path.join(root,'.local/experience-browser-verification'));
await fs.mkdir(parent,{recursive:true});
const output=await fs.mkdtemp(path.join(parent,'review-'));
const reservation=net.createServer();
await new Promise(resolve=>reservation.listen(0,'127.0.0.1',resolve));
const port=reservation.address().port;
await new Promise(resolve=>reservation.close(resolve));
const base='http://127.0.0.1:'+port;
const password=crypto.randomBytes(18).toString('base64url');
const java=process.env.JAVA_HOME?path.join(process.env.JAVA_HOME,'bin',process.platform==='win32'?'java.exe':'java'):'java';
const log=fsSync.openSync(path.join(output,'server.log'),'a');
const server=spawn(java,['-jar',path.join(root,'target/thematic-friend-0.0.1-SNAPSHOT.jar'),'--spring.profiles.active=demo','--app.demo-conversations=true','--server.address=127.0.0.1','--server.port='+port],{
  cwd:root,windowsHide:true,stdio:['ignore',log,log],env:{...process.env,APP_DATA_DIR:path.join(output,'database'),TONGPIN_DEMO_PASSWORD:password}
});
fsSync.closeSync(log);
const checks=[],errors=[],screenshots=[];
let browser,current;
const pass=label=>{checks.push(label);console.log('PASS '+label);};
async function shot(page,name,fullPage=false){
  const file=path.join(output,name+'.png');await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>!document.querySelector('.feedback-toast.visible')&&[...document.querySelectorAll('.app-main,dialog[open]')].every(el=>el.getAnimations().every(a=>a.playState==='finished'||a.playState==='idle')));
  if(captureHelper)await captureHelper.captureScreenshot(page,{file,cursor:'arrow',fullPage});
  else await page.screenshot({path:file,fullPage});
  screenshots.push(file);
}
async function session(options={}){
  const context=await browser.newContext({viewport:{width:1440,height:900},locale:'zh-CN',...options});
  const page=await context.newPage();
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',response=>{if(response.status()>=500)errors.push(response.status()+' '+response.url());});
  return {context,page};
}
async function login(page,username){
  await page.goto(base+'/login?lang=zh');await page.locator('#username').fill(username);await page.locator('#password').fill(password);
  await Promise.all([page.waitForURL('**/discover'),page.locator('form[action="/login"] button[type=submit]').click()]);
}
async function noOverflow(page,label){
  const size=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth}));
  assert.ok(size.scroll<=size.viewport+1,label+' overflow '+JSON.stringify(size));
}
async function message(page,text){
  await page.bringToFront();await page.locator('#body').fill(text);
  await Promise.all([page.waitForResponse(r=>r.url().endsWith('/messages')&&r.request().method()==='POST'&&r.status()===200),page.locator('#message-form button[type=submit]').click()]);
  await page.locator('#messages .message.mine>p').filter({hasText:text}).last().waitFor();
}
try{
  let ready=false;
  for(let i=0;i<120;i++){
    if(server.exitCode!==null)throw new Error('Verification server exited');
    try{if((await fetch(base+'/login')).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  assert.ok(ready,'Server readiness');
  browser=await chromium.launch({headless:true,...(process.env.MINGLE_BROWSER_PATH?{executablePath:process.env.MINGLE_BROWSER_PATH}:{})});
  const a=await session();current=a.page;
  await login(a.page,'demo_zhou');
  assert.equal(await a.page.locator('.welcome-nudge').count(),1);
  await a.page.locator('.welcome-nudge [data-guide-open]').click();
  await a.page.locator('.guide-dialog[open]').waitFor();
  for(let step=0;step<3;step++)await a.page.locator('.guide-next').click();
  await shot(a.page,'01-quick-start');
  await a.page.locator('.guide-next').click();
  await a.page.reload();assert.equal(await a.page.locator('.welcome-nudge').count(),0);
  await a.page.locator('.experience-buttons [data-guide-open]').click();await a.page.keyboard.press('Escape');
  await a.page.locator('.guide-dialog').waitFor({state:'hidden'});
  pass('Onboarding completes, stays dismissed after reload, and can be replayed or closed with Escape.');

  assert.equal(await a.page.locator('[data-sound-toggle]').getAttribute('aria-pressed'),'false');
  await a.page.locator('[data-sound-toggle]').click();await a.page.reload();
  assert.equal(await a.page.locator('[data-sound-toggle]').getAttribute('aria-pressed'),'true');
  await a.page.locator('[data-sound-toggle]').click();
  await a.page.locator('[data-motion-toggle]').click();
  assert.equal(await a.page.locator('html').getAttribute('data-motion'),'reduced');
  await a.page.goto(base+'/explore');
  assert.equal(await a.page.locator('.person-star').count(),7);
  assert.equal(await a.page.locator('.person-star').first().evaluate(el=>getComputedStyle(el).animationName),'none');
  await a.page.locator('[data-motion-toggle]').click();
  assert.equal(await a.page.locator('.person-star').first().evaluate(el=>getComputedStyle(el).animationName),'star-float');
  await a.page.locator('[data-orbit-pause]').click();
  assert.equal(await a.page.locator('.person-star').first().evaluate(el=>getComputedStyle(el).animationPlayState),'paused');
  await noOverflow(a.page,'Planet desktop');await shot(a.page,'02-planet-desktop');
  await a.page.locator('.person-star').first().click();await a.page.locator('.star-profile[open]').waitFor();
  assert.ok(await a.page.locator('.star-profile[open] .star-like-form input[name=_csrf]').count());
  await shot(a.page,'03-person-popup');await a.page.keyboard.press('Escape');
  pass('Planet uses real eligible profiles; popup, CSRF form, motion pause and persisted sound controls work.');

  await a.page.selectOption('#planet-interest','Coffee');
  await Promise.all([a.page.waitForURL('**/explore?interest=Coffee'),a.page.locator('.planet-filter button').click()]);
  assert.equal(await a.page.locator('.person-star').count(),2);
  await a.page.goto(base+'/discover');
  const photo=await a.page.locator('.person-portrait').evaluate(el=>getComputedStyle(el).backgroundImage);
  assert.ok(photo.includes('/images/demo-portraits/'));
  assert.ok(await a.page.evaluate(async url=>{const image=new Image();image.src=url.match(/url\(["']?(.*?)["']?\)/)[1];await image.decode();return image.naturalWidth>=800;},photo));
  await shot(a.page,'04-photo-cards');pass('Filters use actual profiles and demo portraits load locally at full card resolution.');

  const b=await session();await login(b.page,'demo_lin');
  await a.page.goto(base+'/connections');
  const conversation=await a.page.locator('.contact-row[data-contact-name="Alex Lin"]').getAttribute('href');
  assert.ok(conversation);
  await a.page.goto(base+conversation);await b.page.goto(base+'/connections');
  const initial=await a.page.locator('#messages .message').count();assert.equal(initial,6);
  await a.page.evaluate(()=>{window.navigationProbe='same-document';});
  await a.page.locator('#body').fill('今天一起去喝咖啡 ');
  await a.page.locator('#emoji-toggle').click();await a.page.locator('#emoji-grid button[aria-label="微笑"]').click();
  assert.equal(await a.page.locator('#body').inputValue(),'今天一起去喝咖啡 😊');
  await a.page.locator('#body').press('Enter');
  await a.page.locator('#messages .message.mine>p').filter({hasText:'今天一起去喝咖啡 😊'}).waitFor();
  assert.equal(await a.page.evaluate(()=>window.navigationProbe),'same-document');
  await b.page.reload();assert.ok(Number(await b.page.locator('.contact-row[data-contact-name="Jamie Zhou"]').getAttribute('data-unread'))>0);
  await b.page.goto(base+conversation);await b.page.bringToFront();
  await b.page.locator('#messages .message>p').filter({hasText:'今天一起去喝咖啡 😊'}).waitFor({timeout:10000});
  await message(b.page,'好呀，我带上最近在读的书 📚');
  await a.page.bringToFront();await a.page.locator('#messages .message>p').filter({hasText:'好呀，我带上最近在读的书 📚'}).waitFor({timeout:10000});
  assert.equal(await a.page.locator('#messages .message').count(),initial+2);
  await a.page.locator('#body').fill('这段草稿先留着');
  await a.page.locator('#emoji-toggle').click();await a.page.locator('#sticker-tab').click();
  await shot(a.page,'05-sticker-picker');
  await a.page.locator('[data-sticker-id=heart]').click();
  await a.page.locator('#messages [data-sticker=heart]').waitFor();
  assert.equal(await a.page.locator('#body').inputValue(),'这段草稿先留着');
  await b.page.bringToFront();await b.page.locator('#messages [data-sticker=heart]').waitFor({timeout:10000});
  await b.page.reload();await b.page.locator('#messages [data-sticker=heart]').waitFor();
  assert.ok(await b.page.locator('#messages [data-sticker=heart] svg').evaluate(svg=>svg.getBBox().width>50));
  await shot(b.page,'06-two-account-chat');
  pass('Two browser accounts exchange text, emoji and stickers without navigation; unread badges, draft preservation and reload persistence work.');

  await a.page.bringToFront();await a.page.route('**/api/conversations/*/messages',route=>route.request().method()==='POST'?route.abort('failed'):route.continue());
  await a.page.locator('#body').fill('网络恢复后再发送');await a.page.locator('#message-form button').click();
  await a.page.locator('#chat-status').filter({hasText:'草稿已保留'}).waitFor();
  assert.equal(await a.page.locator('#body').inputValue(),'网络恢复后再发送');
  await a.page.unroute('**/api/conversations/*/messages');await message(a.page,'网络恢复后再发送');
  assert.equal(await a.page.locator('#messages .message>p').filter({hasText:'网络恢复后再发送'}).count(),1);
  await a.page.locator('#body').fill('');await a.page.locator('#body').press('Enter');
  assert.equal(await a.page.locator('#messages .message>p').filter({hasText:'网络恢复后再发送'}).count(),1);
  pass('Failed sends preserve drafts for explicit retry; empty Enter cannot create a message.');

  await a.page.evaluate(()=>{window.firstBubble=document.querySelector('#messages .message');});
  await message(b.page,'再发一条，看看消息会不会跳动');await a.page.bringToFront();
  await a.page.locator('#messages .message>p').filter({hasText:'再发一条，看看消息会不会跳动'}).waitFor({timeout:10000});
  assert.equal(await a.page.evaluate(()=>window.firstBubble===document.querySelector('#messages .message')),true);
  pass('Incoming polling appends messages while preserving existing message DOM.');

  for(const width of [1280,1024,768,390,320]){
    await a.page.setViewportSize({width,height:900});
    for(const route of ['/explore','/discover','/connections',conversation,'/profile']){
      await a.page.goto(base+route);await noOverflow(a.page,width+' '+route);
      if(route===conversation){
        const fit=await a.page.locator('#message-form button').evaluate(button=>{const r=button.getBoundingClientRect();return {bottom:r.bottom,height:innerHeight,left:r.left,right:r.right,width:innerWidth};});
        assert.ok(fit.bottom<=fit.height+1&&fit.left>=0&&fit.right<=fit.width,width+' composer outside viewport '+JSON.stringify(fit));
      }
    }
    if(width===390){await a.page.goto(base+'/explore');await shot(a.page,'07-planet-mobile',true);await a.page.goto(base+conversation);await shot(a.page,'08-chat-mobile');}
  }
  pass('Five main pages fit 1280, 1024, 768, 390 and 320 pixel widths; the send button stays visible.');

  const native=await session({javaScriptEnabled:false,viewport:{width:1024,height:900}});
  await login(native.page,'demo_zhou');await native.page.goto(base+conversation);
  await native.page.locator('#body').fill('无脚本表单也可以发送');
  await native.page.locator('#body').press('Tab');
  assert.equal(await native.page.locator('#message-form button').evaluate(button=>button===document.activeElement),true);
  await Promise.all([native.page.waitForNavigation(),native.page.keyboard.press('Enter')]);
  assert.equal(await native.page.locator('#messages .message>p').filter({hasText:'无脚本表单也可以发送'}).count(),1);
  pass('The original server form sends with JavaScript disabled.');

  await a.page.setViewportSize({width:1440,height:900});await a.page.goto(base+'/explore?lang=en');
  assert.equal(await a.page.locator('html').getAttribute('lang'),'en');assert.equal((await a.page.locator('body').innerText()).includes('??experience.'),false);
  await shot(a.page,'09-planet-english');
  const gallery=await browser.newPage({viewport:{width:1200,height:800}});
  await gallery.setContent('<html><body style="margin:0;padding:20px;background:#eee9f4;font:14px Segoe UI;display:grid;grid-template-columns:repeat(5,1fr);gap:15px">'+Array.from({length:10},(_,i)=>'<figure style="margin:0"><img style="display:block;width:210px;height:280px;object-fit:cover;object-position:center 30%;border-radius:15px" src="'+base+'/images/demo-portraits/portrait-'+String(i+1).padStart(2,'0')+'.jpg"><figcaption style="padding:10px">Demo portrait '+(i+1)+'</figcaption></figure>').join('')+'</body></html>');
  await gallery.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));await shot(gallery,'10-photo-contact-sheet');
  assert.deepEqual(errors,[]);pass('English and Chinese render without missing new copy, browser exceptions or server errors.');
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({status:'passed',checks,errors,screenshots,accounts:['demo_zhou','demo_lin'],browser:'Independent Edge / Chromium contexts',database:'Isolated file database; not the user preview database'},null,2)+'\n');
  console.log(JSON.stringify({output,passed:checks.length,screenshots},null,2));
}catch(error){
  if(current&&!current.isClosed())await shot(current,'failure',true).catch(()=>{});
  await fs.writeFile(path.join(output,'results.json'),JSON.stringify({status:'failed',checks,errors,failure:error.stack,screenshots},null,2)+'\n');
  console.error(error.stack);console.error('Evidence: '+output);process.exitCode=1;
}finally{
  if(browser)await browser.close();server.kill();
  await new Promise(resolve=>{if(server.exitCode!==null)return resolve();server.once('exit',resolve);setTimeout(resolve,5000);});
}
