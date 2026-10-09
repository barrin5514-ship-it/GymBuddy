const fs=require('node:fs'),path=require('node:path');
const output=name=>path.join(process.env.TEMP||process.cwd(),'gymbuddy-'+name);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const b=await chromium.launch(),p=await b.newPage({viewport:{width:1365,height:900}}),errors=[],requests=[],records=new Map();
 p.on('pageerror',e=>errors.push(e.message));
 p.on('response',async r=>{if(r.url().startsWith('https://oss.exercisedb.dev/api/')) {requests.push({url:r.url(),status:r.status()});if(r.ok()){try{const body=await r.json();for(const e of body.data||[])records.set(e.exerciseId,e);fs.writeFileSync(output('live-records.json'),JSON.stringify([...records.values()],null,2));}catch{}}}});
 async function generate(label){await p.locator('#generate-workout').click();await p.waitForFunction(()=>!document.querySelector('#generate-workout').disabled,{},{timeout:150000});const status=await p.locator('#builder-status').innerText();console.log(label+': '+status);if(!status.includes('is ready'))throw Error(label+' failed');}
 try{
 await p.goto(process.env.GYMBUDDY_URL||'http://127.0.0.1:8878');await p.locator('#workout-age').fill('30');await generate('LIVE quick');
 const ids=await p.locator('.exercise-card').evaluateAll(es=>es.map(e=>e.dataset.exerciseId));
 console.log('Live quick IDs: '+ids.join(','));
 let changed=false;
 for(let i=0;i<ids.length;i++){const c=p.locator('.exercise-card').nth(i);await c.getByRole('button',{name:'Replace exercise',exact:true}).click();if(await c.locator('.alternatives button').count()>1){await c.locator('.alternatives button').first().click();const next=await p.locator('.exercise-card').evaluateAll(es=>es.map(e=>e.dataset.exerciseId));if(next.filter((e,j)=>e!==ids[j]).length!==1)throw Error('Replacement did not isolate one exercise');changed=true;break;}}
 if(!changed)throw Error('No live replacement available');console.log('LIVE replacement: passed');
 await p.locator('#plan-mode').selectOption('weekly');await generate('LIVE weekly');if(await p.locator('.day-card').count()!==7)throw Error('Missing weekly days');
 await p.locator('#equipment-dropdown').evaluate(e=>e.open=true);await p.locator('#equipment-dumbbell').check();await p.locator('#workout-style').selectOption('hypertrophy');await p.locator('#goal').selectOption('muscle');await p.locator('#plan-mode').selectOption('quick');await generate('LIVE dumbbell workout');
 const equipments=await p.locator('.exercise-card .muted').allTextContents();if(equipments.some(x=>!/bodyweight|body weight|dumbbell/.test(x)))throw Error('Equipment mismatch');console.log('LIVE equipment: '+equipments.join('; '));
 const media=p.locator('.exercise-media img');for(let i=0;i<await media.count();i++){await media.nth(i).scrollIntoViewIfNeeded();await media.nth(i).evaluate(img=>new Promise(r=>{if(img.complete)return r();img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true});setTimeout(r,10000)})).catch(()=>{});}
 console.log('LIVE media loaded: '+await p.locator('.exercise-media img').evaluateAll(es=>es.filter(e=>e.complete&&e.naturalWidth>0).length)+'; fallbacks: '+await p.locator('.media-fallback').count());
 await p.screenshot({path:output('live-workout.png'),fullPage:true});
 console.log(JSON.stringify({requests,records:records.size,runtimeErrors:errors},null,2));
 fs.writeFileSync(output('live-report.json'),JSON.stringify({passed:true,requests,records:records.size,runtimeErrors:errors},null,2));
 }catch(e){console.log('LIVE BLOCKER: '+e.message);fs.writeFileSync(output('live-report.json'),JSON.stringify({passed:false,error:e.message,requests,records:records.size,runtimeErrors:errors},null,2));process.exitCode=1;}
 finally{await b.close();}
})();
