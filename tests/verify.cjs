const fs=require('node:fs'),http=require('node:http'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const project=path.resolve(__dirname,'..');
if(!process.env.GYMBUDDY_FIXTURE) throw Error('Set GYMBUDDY_FIXTURE to the historical ExerciseDB JSON test fixture.');
const E=require('../workout-engine'), fixture=require(path.resolve(process.env.GYMBUDDY_FIXTURE));
let checks=0;function ok(v,label){assert.ok(v,label);checks++;}
const base={age:30,style:'auto',goal:'general-fitness',experience:'beginner',equipment:['none'],limitations:[],exclude:'',duration:30};
function search(term){return fixture.filter(e=>e.name.toLowerCase().includes(term)).sort((a,b)=>a.exerciseId<b.exerciseId?-1:1)}
function pool(p){return [...new Map(E.terms(p).flatMap(t=>search(t).slice(0,50)).map(e=>[e.exerciseId,e])).values()]}
for(const style of Object.keys(E.styles)){
 const p=E.resolve({...base,style,experience:'intermediate',goal:style==='plyometrics'?'athletic-performance':'general-fitness'}), w=E.choose(pool(p),p);
 ok(w.exercises.length>=2,style+' has genuine matches');ok(w.exercises.every(e=>fixture.some(f=>f.exerciseId===e.exerciseId)),style+' real ids');console.log(style+': '+w.exercises.length+' exercises');
 if(style==='isometric')ok(w.exercises.every(e=>['bodyweight incline side plank','power point plank','side bridge v. 2','isometric chest squeeze'].includes(e.name)),'static holds only');
}
for(const age of [1,7,12])ok(E.resolve({...base,age}).style==='activity','child activity');
for(const age of [13,17]){const p=E.resolve({...base,age,style:'hiit'});ok(p.style==='calisthenics','teen adaptation');ok(E.choose(pool(p),p).exercises.every(e=>e.equipments.every(x=>/body.?weight/.test(x))),'teen bodyweight');}
ok(E.resolve({...base,age:75,experience:'advanced',style:'strength'}).style==='strength','no age-only downgrade');
ok(E.resolve({...base,style:'plyometrics'}).style==='calisthenics','beginner jumping fallback');
ok(E.resolve({...base,style:'strength',goal:'flexibility-mobility'}).style==='mobility','goal conflict');
for(const limitation of ['knee','back','shoulder','wrist','balance','low-impact','other']){
 const p=E.resolve({...base,limitations:[limitation]});const eligible=fixture.filter(e=>E.eligible(e,p));
 if(limitation==='knee')ok(eligible.every(e=>E.group(e)!=='lower'),'knee restrictions');
 if(limitation==='other')ok(eligible.length===0,'unknown limitation blocks');
 if(limitation==='low-impact')ok(eligible.every(e=>!/jump|hop|burpee|plyo/.test(e.name)),'low impact');
}
const noGear=E.resolve(base);ok(fixture.filter(e=>E.eligible(e,noGear)).every(e=>e.equipments.every(x=>/body.?weight/.test(x))),'bodyweight equipment');
const bench=fixture.find(e=>e.name==='dumbbell bench press');ok(!E.eligible(bench,E.resolve({...base,style:'strength',equipment:['dumbbell']})),'bench required');
ok(E.eligible(bench,E.resolve({...base,style:'strength',equipment:['dumbbell','weight-bench']})),'confirmed bench allowed');
for(let mask=1;mask<128;mask++){const s=E.schedule(E.days.map((d,i)=>i).filter(i=>mask&(1<<i)));const ids=s.filter(d=>d.kind==='training').map(d=>d.index);ok(!ids.some(i=>ids.includes((i+1)%7)),'recovery schedule '+mask);}
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg'};
const server=http.createServer((req,res)=>{let f=path.join(project,decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!f.startsWith(project)){res.writeHead(403);return res.end()};fs.readFile(f,(e,data)=>{res.writeHead(e?404:200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});res.end(e?'Not found':data)})});
(async()=>{
 await new Promise(r=>server.listen(8876,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 let requests=0,mode='good';
 await page.route('https://oss.exercisedb.dev/**',async route=>{
  requests++;const url=new URL(route.request().url());ok([...url.searchParams.keys()].every(k=>['limit','name','after'].includes(k)),'only exercise queries transmitted');
  if(mode==='error')return route.fulfill({status:503,body:'service unavailable'});
  if(mode==='empty')return route.fulfill({json:{success:true,data:[],meta:{hasNextPage:false}}});
  const all=search(url.searchParams.get('name')),start=url.searchParams.has('after')?all.findIndex(e=>e.exerciseId===url.searchParams.get('after'))+1:0, data=all.slice(start,start+25);
  return route.fulfill({json:{success:true,data,meta:{hasNextPage:start+25<all.length,nextCursor:data.at(-1)?.exerciseId}}});
 });
 await page.goto('http://127.0.0.1:8876');await page.locator('#workout-age').fill('30');
 ok(await page.locator('#exercise-library').count()===0,'library removed');ok(await page.locator('#workout-style option').count()===10,'ten style options');
 await page.locator('#generate-workout').click();await page.waitForFunction(()=>!document.querySelector('#generate-workout').disabled,{},{timeout:90000});
 ok((await page.locator('.exercise-card').count())>=2,'quick generation');console.log('Quick: '+await page.locator('#builder-status').innerText());
 const ids=await page.locator('.exercise-card').evaluateAll(es=>es.map(e=>e.dataset.exerciseId));
 let replaced=false;
 for(let i=0;i<ids.length;i++){
  const c=page.locator('.exercise-card').nth(i);await c.getByRole('button',{name:'Replace exercise',exact:true}).click();
  const b=c.locator('.alternatives button');if(await b.count()>1){await b.first().click();const after=await page.locator('.exercise-card').evaluateAll(es=>es.map(e=>e.dataset.exerciseId));ok(after[i]!==ids[i]&&after.filter((v,j)=>v!==ids[j]).length===1,'replace preserves other exercises');replaced=true;break;}
 }
 ok(replaced,'replacement offered');
 await page.locator('#plan-mode').selectOption('weekly');await page.locator('[name="training-day"][value="1"]').check();await page.locator('#generate-workout').click();await page.waitForFunction(()=>!document.querySelector('#generate-workout').disabled);
 ok(await page.locator('.day-card').count()===7,'full weekly plan');
 ok((await page.locator('[data-day="Tuesday"]').innerText()).includes('Recovery session'),'adjacent day recovery');
 const before=await page.locator('.day-card').evaluateAll(es=>es.map(e=>e.innerHTML));
 await page.getByRole('button',{name:'Regenerate monday',exact:true}).click();
 const after=await page.locator('.day-card').evaluateAll(es=>es.map(e=>e.innerHTML));ok(after.slice(1).every((v,i)=>v===before[i+1]),'day regeneration preserves others');
 await page.locator('.bmi-disclosure summary').click();await page.locator('#age-adult').check();await page.locator('#height-unit').selectOption('cm');await page.locator('#height-cm').fill('175');await page.locator('#weight-unit').selectOption('kg');await page.locator('#weight').fill('70');await page.locator('#calculate-bmi').click();ok((await page.locator('#bmi-result').innerText()).includes('22.9'),'BMI 175/70');
 await page.locator('#height-unit').selectOption('ft-in');await page.locator('#weight-unit').selectOption('lb');await page.locator('#calculate-bmi').click();ok((await page.locator('#bmi-result').innerText()).includes('22.9'),'BMI unit conversion');
 await page.locator('#age-under20').check();await page.locator('#exact-age').fill('12');await page.locator('#calculate-bmi').click();ok((await page.locator('#bmi-result').innerText()).includes('No adult category'),'pediatric BMI');
 await page.locator('#exact-age').fill('1.5');await page.locator('#calculate-bmi').click();ok((await page.locator('#bmi-result').innerText()).includes('under 2'),'infant BMI interpretation');
 await page.locator('#weight').fill('0');await page.locator('#calculate-bmi').click();ok((await page.locator('#bmi-result').innerText()).includes('Check'),'BMI invalid input');
 await page.locator('#workout-age').fill('8');const reqBefore=requests;await page.locator('#generate-workout').click();ok((await page.locator('#builder-status').innerText()).includes('supervise'),'supervision required');await page.locator('#supervision').check();await page.locator('#generate-workout').click();ok(await page.locator('.exercise-card').count()===0,'child no adult lifts');ok(requests===reqBefore,'child no API calls');
 await page.locator('#workout-age').fill('30');await page.locator('#plan-mode').selectOption('quick');await page.locator('#workout-style').selectOption('isometric');mode='error';const preserved=await page.locator('#workout-results').innerHTML();await page.locator('#generate-workout').click();await page.waitForFunction(()=>!document.querySelector('#generate-workout').disabled);ok((await page.locator('#builder-status').innerText()).includes('503'),'API error surfaced');ok(await page.locator('#workout-results').innerHTML()===preserved,'failed generation preserves plan');
 mode='good';await page.locator('#generate-workout').click();await page.waitForFunction(()=>!document.querySelector('#generate-workout').disabled,{},{timeout:30000});ok(await page.locator('.exercise-card').count()>0,'retry succeeds');
 await page.locator('#experience').selectOption('intermediate');
 for(const style of Object.keys(E.styles)) {
  await page.locator('#goal').selectOption(style==='plyometrics'?'athletic-performance':'general-fitness');await page.locator('#workout-style').selectOption(style);await page.locator('#generate-workout').click();await page.waitForFunction(()=>!document.querySelector('#generate-workout').disabled,{},{timeout:45000});
  ok((await page.locator('#builder-status').innerText()).includes('is ready'), 'browser style '+style);
 }
 await page.locator('#workout-age').fill('16');await page.locator('#workout-style').selectOption('hiit');await page.locator('#generate-workout').click();await page.waitForFunction(()=>!document.querySelector('#generate-workout').disabled);ok((await page.locator('.plan-summary').innerText()).includes('Ages 13–17'),'teen browser safeguard');
 await page.locator('#equipment-dropdown').evaluate(e=>e.open=true);await page.locator('#equipment-dumbbell').check();ok(!await page.locator('#equipment-none').isChecked(),'equipment exclusivity');await page.locator('#gym-membership-yes').check();await page.locator('#gym').selectOption('planet-fitness');await page.locator('#add-gym-equipment').click();ok(await page.locator('#equipment-bench').isChecked(),'gym suggestions');
 await page.locator('#gym-membership-no').check();ok(await page.locator('#equipment-dumbbell').isChecked(),'equipment preserved across gym switch');
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(process.env.TEMP || project,'gymbuddy-desktop.png')});
 for(const width of [1440,375,320]){await page.setViewportSize({width,height:900});ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'no horizontal overflow '+width);if(width===375)await page.screenshot({path:path.join(process.env.TEMP || project,'gymbuddy-mobile.png')});}
 ok(await page.evaluate(async()=>{const u=getComputedStyle(document.querySelector('.hero')).backgroundImage.match(/url\("?([^"\)]+)/)[1];const i=new Image();i.src=u;await i.decode();return i.naturalWidth>=1500;}),'local real hero photo loads');
 ok(errors.length===0,'no browser runtime errors: '+errors.join(','));
 console.log('PASS '+checks+' focused assertions; controlled browser uses genuine historical records.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
