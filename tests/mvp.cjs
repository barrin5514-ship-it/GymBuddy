const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.env.GYMBUDDY_ROOT||path.resolve(__dirname,'..');
const E=require(path.join(root,'workout-engine.js')),fixture=require(process.env.GYMBUDDY_FIXTURE);
let checks=0;const ok=(v,label)=>{assert.ok(v,label);checks++};
const base={age:30,goal:'general-fitness',experience:'intermediate',equipment:['none'],limitations:[],exclude:''};
for(const style of Object.keys(E.styles))for(const duration of [30,45,60]){
 const p=E.resolve({...base,style,duration,goal:style==='plyometrics'?'athletic-performance':'general-fitness'}),w=E.choose(fixture,p);
 ok(w.estimatedMinutes>=duration,style+' target '+duration);
 ok(w.estimatedMinutes===w.mainMinutes+w.warmup+w.cooldown+w.easyMinutes,'duration sums');
 ok(w.sets<=4,'bounded sets');
 if(style==='plyometrics')ok(w.sets===2&&w.exercises.length===3,'plyometric volume capped');
 if(style==='supersets')ok(w.exercises.length%2===0,'complete pairs');
}
for(const age of [13,17]){const p=E.resolve({...base,age,style:'hiit',duration:60}),w=E.choose(fixture,p);ok(w.sets===2&&w.exercises.length<=4,'youth volume preserved');}
assert.throws(()=>E.resolve({...base,style:'auto',duration:15}),/Choose/);checks++;
(async()=>{const b=await chromium.launch(),p=await b.newPage({viewport:{width:1280,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 // Explicitly controlled transport with genuine historical records and a test-only 1px GIF.
 await p.route('https://oss.exercisedb.dev/**',route=>{const u=new URL(route.request().url()),term=u.searchParams.get('name');const all=fixture.filter(e=>e.name.includes(term)).sort((a,b)=>a.exerciseId<b.exerciseId?-1:1),start=u.searchParams.has('after')?all.findIndex(e=>e.exerciseId===u.searchParams.get('after'))+1:0,data=all.slice(start,start+25);return route.fulfill({json:{success:true,data,meta:{hasNextPage:start+25<all.length,nextCursor:data.at(-1)?.exerciseId}}});});
 await p.route('https://static.exercisedb.dev/**',r=>r.fulfill({contentType:'image/gif',body:Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64')}));
 await p.goto(process.env.GYMBUDDY_URL||'http://127.0.0.1:8878');
 ok(JSON.stringify(await p.locator('#duration option').allTextContents())===JSON.stringify(['30 Minutes','45 Minutes','1 Hour+']),'exact options');
 ok(!await p.locator('#limitations-dropdown').evaluate(e=>e.open),'collapsed limitations');
 await p.locator('#limitations-toggle').focus();await p.keyboard.press('Enter');ok(await p.locator('#limitations-dropdown').evaluate(e=>e.open),'keyboard opens');
 await p.locator('[name="limitation"][value="low-impact"]').check();await p.locator('[name="limitation"][value="knee"]').check();ok(await p.locator('#limitations-summary').innerText()==='2 limitations selected','summary count');
 await p.keyboard.press('Escape');ok(!await p.locator('#limitations-dropdown').evaluate(e=>e.open),'escape closes');ok(await p.locator('[name="limitation"]:checked').count()===2,'selections retained');ok(await p.locator('#exercise-exclusions').isVisible(),'skip separate and visible');
 await p.locator('#limitations-toggle').click();await p.locator('[name="limitation"][value="knee"]').uncheck();await p.locator('#limitations-toggle').click();
 await p.locator('#workout-age').fill('30');
 for(const duration of ['30','45','60']){await p.locator('#duration').selectOption(duration);await p.locator('#generate-workout').click();await p.waitForFunction(()=>!document.querySelector('#generate-workout').disabled,{},{timeout:90000});ok((await p.locator('#builder-status').innerText()).includes('is ready'),'browser duration '+duration);ok((await p.locator('.session-breakdown').innerText()).includes('Approximately '+duration),'visible timing '+duration);}
 ok((await p.locator('.exercise-card h4').allTextContents()).every(n=>!/jump|hop|burpee/.test(n)),'limitation filters applied');
 ok(await p.locator('.exercise-card .exercise-media img').evaluateAll(es=>es.every(img=>img.loading==='lazy'&&new URL(img.src).pathname==='/media/'+img.closest('.exercise-card').dataset.exerciseId+'.gif')),'lazy exact-ID media');
 const valid=fixture[0];ok(await p.evaluate(e=>GymExercises.mediaUrl(e.gifUrl,e.exerciseId)===e.gifUrl,valid),'valid media accepted');
 for(const url of ['javascript:alert(1)','https://evil.example/media/'+valid.exerciseId+'.gif','https://static.exercisedb.dev/media/wrong.gif',valid.gifUrl+'?redirect=bad'])ok(await p.evaluate(({url,id})=>GymExercises.mediaUrl(url,id)===null,{url,id:valid.exerciseId}),'unsafe/mismatched URL rejected');
 await p.locator('#duration').selectOption('30');await p.locator('#generate-workout').click();await p.waitForFunction(()=>!document.querySelector('#generate-workout').disabled);
 const old=await p.locator('.exercise-card').evaluateAll(es=>es.map(e=>e.dataset.exerciseId));let replaced=false;
 for(let i=0;i<old.length;i++){const card=p.locator('.exercise-card').nth(i);await card.getByRole('button',{name:'Replace exercise',exact:true}).click();if(await card.locator('.alternatives button').count()>1){await card.locator('.alternatives button').first().click();const now=p.locator('.exercise-card').nth(i);ok(await now.getAttribute('data-exercise-id')!==old[i],'replacement changes id');await now.scrollIntoViewIfNeeded();await now.locator('img').waitFor();ok(await now.locator('img').evaluate(img=>new URL(img.src).pathname==='/media/'+img.closest('.exercise-card').dataset.exerciseId+'.gif'),'replacement changes image');replaced=true;break;}}
 ok(replaced,'replacement tested');
 await p.locator('.exercise-card .exercise-media img').first().evaluate(img=>img.dispatchEvent(new Event('error')));ok(await p.locator('.exercise-card .media-fallback').count()===1,'broken image fallback');
 // Force a missing media field in a genuine exercise record; never alter its identity.
 await p.reload();await p.evaluate(()=>{const load=GymExercises.load;GymExercises.load=async(...args)=>(await load(...args)).map(e=>({...e,gifUrl:null}));});await p.locator('#workout-age').fill('30');await p.locator('#generate-workout').click();await p.waitForFunction(()=>!document.querySelector('#generate-workout').disabled,{},{timeout:90000});ok(await p.locator('.exercise-card .media-fallback').count()===await p.locator('.exercise-card').count(),'missing image fallback');
 for(const width of [1280,375,320]){await p.setViewportSize({width,height:900});ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'responsive '+width);}
 ok(errors.length===0,'no runtime errors');console.log('PASS '+checks+' new MVP assertions (controlled).');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
