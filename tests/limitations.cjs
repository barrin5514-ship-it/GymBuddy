const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),E=require(path.join(root,'workout-engine')),S=require(path.join(root,'stretching'));
const fixture=JSON.parse(fs.readFileSync(process.env.GYMBUDDY_LIMITATION_FIXTURE));
let checks=0,generated=0,insufficient=0,weekly=0,replacements=0;const ok=(v,m)=>{assert.ok(v,m);checks++};
const base={age:30,style:'auto',goal:'general-fitness',experience:'advanced',equipment:['none'],limitations:['knee'],exclude:'',duration:30,stretching:'solo'};
const poolFor=p=>[...new Map([...E.terms(p),'stretch'].flatMap(t=>fixture.filter(e=>e.name.toLowerCase().includes(t)).sort((a,b)=>a.exerciseId.localeCompare(b.exerciseId)).slice(0,50)).map(e=>[e.exerciseId,e])).values()];
const p=E.resolve(base),pool=poolFor(p),w=E.choose(pool,p,[],[],()=>.5);
ok(w.exercises.length>=2,'reported advanced 30-minute knee case');
ok(w.exercises.some(e=>e.exerciseId==='TFqbd8t'),'reviewed stationary-knee crunch admitted');
const crunch=fixture.find(e=>e.exerciseId==='TFqbd8t'),wall=fixture.find(e=>e.exerciseId==='LEH9jxP');
ok(!E.eligible({...crunch,instructions:[...crunch.instructions,'Raise the knees toward the chest.']},p),'changed instructions fail closed');
ok(!E.eligible({...crunch,targetMuscles:['quadriceps']},p),'conflicting metadata excluded');
ok(!E.eligible({...crunch,exerciseId:'unreviewed-test-id'},p),'same name is not enough');
ok(!E.eligible({...crunch,instructions:[]},p),'missing evidence excluded');
const duplicatePool=[{...crunch,equipments:['barbell']},crunch,wall];
ok(E.choose(duplicatePool,p).exercises.some(e=>e.exerciseId===crunch.exerciseId),'filter before deduplication');
const pair=E.choose([crunch,wall],E.resolve({...base,style:'supersets'}));ok(pair.exercises.length===2,'one complete superset pair');
ok(pair.estimatedMinutes===30,'single pair timing accounts for recovery');
const bridge=fixture.find(e=>e.name==='glute bridge march');if(bridge){ok(!E.eligible(bridge,{...p,limitations:['back']}),'bridge trunk load excluded for back');ok(!E.eligible(bridge,{...p,limitations:['balance']}),'march excludes balance demand');}
const configurations=[...['low-impact','knee','back','shoulder','wrist','balance','other'].map(x=>[x]),['knee','low-impact'],['knee','balance'],['back','knee'],['shoulder','wrist'],['knee','wrist','balance']];
const coverage={};
for(const limitations of configurations){coverage[limitations.join('+')]={generated:0,insufficient:0};
 for(const experience of ['beginner','intermediate','advanced'])for(const duration of [30,45,60])for(const style of Object.keys(E.styles))for(const equipment of [['none'],['dumbbell']]){
  const q=E.resolve({...base,limitations,experience,duration,style,equipment}),pool=poolFor(q);let workout;
  try{workout=E.choose(pool,q,[],[],()=>.5);}catch(e){ok(e.message.includes('restrictions have not been relaxed'),'helpful insufficiency');insufficient++;coverage[limitations.join('+')].insufficient++;continue;}
  generated++;coverage[limitations.join('+')].generated++;
  ok(new Set(workout.exercises.map(E.normalizedName)).size===workout.exercises.length,'no duplicate names');
  ok(new Set(workout.exercises.map(e=>e.exerciseId)).size===workout.exercises.length,'no duplicate IDs');
  ok(workout.exercises.every(e=>limitations.every(l=>E.eligible(e,{...q,limitations:[l]}))),'all restrictions intersect');
  ok(workout.estimatedMinutes===workout.warmup+workout.cooldown+workout.mainMinutes+workout.easyMinutes&&workout.estimatedMinutes>=duration,'timing');
  for(const stretching of ['solo','partner','both']){const phase=S.plan(pool,{...q,stretching},workout.exercises);for(const e of [...phase.warmupExercises,...phase.cooldownExercises]){ok(e.guideId?!e.avoid.some(l=>limitations.includes(l)):E.eligible(e,{...q,style:'mobility'}),'phases respect restrictions');}ok(!phase.cooldownExercises.some(e=>e.partner)||stretching!=='solo','partner opt-in');}
  const options=E.alternatives(pool,q,workout.exercises[0],workout.exercises.slice(1));for(const e of options){ok(limitations.every(l=>E.eligible(e,{...q,limitations:[l]}))&&!workout.exercises.some(x=>E.sameExercise(x,e)),'replacement restrictions and uniqueness');replacements++;}
  // Weekly generation uses the same chooser for each selected training day.
  const used=[];for(const day of E.schedule([0,1,2,4,6]))if(day.kind==='training'){const next=E.choose(pool,q,used,[],()=>.5);ok(next.exercises.every(e=>E.eligible(e,q)),'weekly restriction preservation');used.push(...next.exercises.map(e=>e.exerciseId));weekly++;}
 }
}
ok(S.plan(pool,{...p,limitations:['other']},w.exercises).warmupExercises.length===0,'unknown restriction blocks authored guidance');
ok(S.plan(pool,{...p,limitations:['wrist'],stretching:'both'},w.exercises).warmupExercises.every(e=>e.guideId!=='hip-prep'),'wrist-loaded wall support excluded');
console.log(JSON.stringify({checks,profiles:generated+insufficient,generated,expectedInsufficient:insufficient,weeklyTrainingDays:weekly,replacementCandidates:replacements,coverage},null,2));
