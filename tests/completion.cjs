const assert=require('node:assert/strict'),path=require('node:path');
const root=process.env.GYMBUDDY_ROOT||path.resolve(__dirname,'..');
const E=require(path.join(root,'workout-engine.js')),S=require(path.join(root,'stretching.js')),fixture=require(process.env.GYMBUDDY_FIXTURE);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
let checks=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
const base={age:30,style:'calisthenics',goal:'general-fitness',experience:'beginner',equipment:['none'],limitations:[],exclude:'',duration:30};
const bridge=fixture.find(e=>e.exerciseId==='D9qe7CM'),other=fixture.find(e=>e.exerciseId==='vpleANJ');
ok(bridge&&other,'genuine provider identities available');
// Reproduce the identical names observed in the live dataset, without equating their media identities.
const duplicated=[bridge,{...other,name:bridge.name},{...bridge,name:'alias'}, {...other,name:'  PELVIC-TILT INTO BRIDGE  '}];
ok(E.unique(duplicated).length===1,'ID and normalized-name uniqueness');
for(const duration of [30,45,60])for(const style of Object.keys(E.styles)){
 const p=E.resolve({...base,duration,style,experience:'intermediate',goal:style==='plyometrics'?'athletic-performance':'general-fitness'}),w=E.choose([...E.terms(p).flatMap(t=>fixture.filter(e=>e.name.includes(t)).slice(0,50)),...fixture.filter(e=>e.name.includes('stretch')).slice(0,50),...duplicated],p);
 ok(new Set(w.exercises.map(E.normalizedName)).size===w.exercises.length,'unique names '+style);
 ok(new Set(w.exercises.map(e=>e.exerciseId)).size===w.exercises.length,'unique IDs '+style);
 ok(w.warmupExercises.length>0&&w.cooldownExercises.length>0,'actual phase exercises '+style);
 ok(w.estimatedMinutes>=duration && w.estimatedMinutes===w.mainMinutes+w.warmup+w.cooldown+w.easyMinutes,'phases included in duration '+style);
 if(!['mobility','isometric'].includes(p.style))ok(new Set(w.exercises.map(E.pattern)).size===w.exercises.length,'movement variety '+style);
 const a=E.alternatives(E.terms(p).flatMap(t=>fixture.filter(e=>e.name.includes(t)).slice(0,50)),p,w.exercises[0],w.exercises.slice(1));
 ok(a.every(e=>!w.exercises.some(x=>E.sameExercise(x,e))),'replacement excludes all session identities');
}
for(const stretching of ['solo','partner','both']){
 const p=E.resolve({...base,stretching}),w=E.choose(E.terms(p).flatMap(t=>fixture.filter(e=>e.name.includes(t)).slice(0,50)),p),phases=S.plan(fixture,p,w.exercises);
 ok(phases.cooldownExercises.length===2,'two cooldown choices '+stretching);
 ok(phases.cooldownExercises.some(e=>e.partner)===(stretching!=='solo'),'partner opt-in '+stretching);
 ok(phases.cooldownExercises.some(e=>!e.partner)===(stretching!=='partner'),'solo preference '+stretching);
 ok([...phases.warmupExercises,...phases.cooldownExercises].every(e=>e.instructions.length>=3),'instructions '+stretching);
 ok(phases.cooldownExercises.filter(e=>e.partner).every(e=>/consent|willing/.test(e.instructions.join(' '))&&/pain/.test(e.instructions.join(' '))),'partner guidance '+stretching);
}
ok(E.resolve(base).stretching==='solo','default solo');
ok(S.plan(fixture,{...base,age:8},[]).warmupExercises.length===0,'child no adult phases');
const restricted=S.plan(fixture,{...base,stretching:'partner',limitations:['shoulder','knee','back','wrist','balance']},[]);
ok(restricted.cooldownExercises.length===0,'no unsuitable partner fallback');
ok(S.plan([],{...base,exclude:'calf,chest,arm,ankle,shoulder,hip'},[]).cooldownExercises.length===0,'guide exclusions');
(async()=>{const b=await chromium.launch();try{const p=await b.newPage({viewport:{width:1280,height:1800}});p.setDefaultTimeout(15000);
 await p.route('https://static.exercisedb.dev/**',r=>r.fulfill({contentType:'image/gif',body:Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7','base64')}));
 await p.goto(process.env.GYMBUDDY_URL||'http://127.0.0.1:8879');
 ok(await p.locator('#stretching-preference').inputValue()==='solo','UI default solo');
 await p.evaluate(({a,b})=>{document.body.replaceChildren();const host=document.createElement('main');host.id='media-test';document.body.append(host);for(const e of [a,a,{...b,name:a.name}])host.append(GymMedia.create(e));},{a:bridge,b:other});
 await p.waitForFunction(()=>document.querySelectorAll('#media-test img').length===3,{},{timeout:15000});
 const urls=await p.locator('#media-test img').evaluateAll(es=>es.map(e=>e.src));ok(urls[0]===urls[1]&&urls[0]!==urls[2],'same ID shares exact media, names never share');
 await p.evaluate(e=>document.querySelector('#media-test').append(GymMedia.create({...e,gifUrl:null})),bridge);
 ok(await p.locator('#media-test img').count()===4,'known same-ID media retained if later field absent');
 await p.locator('#media-test img').first().evaluate(e=>e.dispatchEvent(new Event('error')));
 ok(await p.locator('#media-test .media-fallback').count()===3,'shared failure across same ID');
 ok(await p.locator('#media-test img').count()===1,'different ID unaffected');
 console.log('PASS '+checks+' completion assertions (controlled).');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
