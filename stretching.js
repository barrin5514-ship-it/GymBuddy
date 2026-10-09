/* GymBuddy-authored coaching is explicitly separate from ExerciseDB records.
   Guide IDs are local; no provider identity or demonstration is invented. */
(function(root) {
  'use strict';
  const guide = (guideId, name, groups, avoid, instructions, partner = false) => ({ guideId, name, groups, avoid, instructions, partner, source: 'GymBuddy guided movement' });
  const warmups = [
    guide('arm-circles', 'Small, controlled arm circles', ['push','pull'], ['shoulder','wrist','balance'], ['Stand comfortably with space around you. Keep your shoulders relaxed.', 'Make small, slow circles with your arms within a comfortable range; gradually reverse direction.', 'Keep moving gently rather than holding a stretch. Stop if there is pain.']),
    guide('ankle-mobility', 'Seated ankle mobility', ['lower'], ['knee'], ['Sit securely with both feet resting on the floor.', 'Lift one heel gently while keeping the toes on the floor, then lower it. Alternate feet slowly.', 'Keep the movement small and comfortable; do not force the ankle.']),
    guide('shoulder-glide', 'Gentle shoulder-blade glides', ['push','pull'], ['shoulder','back'], ['Sit securely with your arms relaxed.', 'Gently draw the shoulder blades slightly together, then release. Keep the neck relaxed.', 'Move slowly without arching the back, shrugging, or forcing the range.']),
    guide('hip-prep', 'Gentle standing hip preparation', ['lower','core'], ['knee','back','balance','wrist','shoulder'], ['Stand near a stable wall and touch it lightly for balance if needed.', 'Keeping your trunk upright, move one leg a short distance behind you and return it. Alternate sides.', 'Use a small, controlled range without swinging, leaning back, or holding a stretch. Stop for pain.'])
  ];
  const cooldowns = [
    guide('solo-calf', 'Gentle wall-supported calf stretch', ['lower'], ['knee','balance','wrist','shoulder'], ['Face a stable wall and rest your hands lightly against it.', 'Place one foot a comfortable step behind you, keeping its heel down. Gently move forward until there is a light calf stretch.', 'Hold without bouncing for 20 seconds, release, and switch sides. Back off immediately if there is pain.']),
    guide('solo-chest', 'Gentle seated chest opening', ['push','pull'], ['shoulder','back'], ['Sit securely with feet supported and hands resting loosely by your sides.', 'Lengthen your spine comfortably and let the shoulders move gently back, without arching or pulling the arms.', 'Hold the comfortable position for 20 seconds while breathing, then relax. Do not force a stretch.']),
    guide('partner-calf', 'Partner-supported calf stretch', ['lower'], ['knee','balance','wrist','shoulder'], ['Ask a willing partner to help and agree on a clear stop signal. A supervising adult must assist a teen.', 'Face each other. Your partner offers steady hands or forearms for light support only; they do not pull, push, or move your joints.', 'Place one foot a small step behind you with its heel down. You control a gentle forward shift to a light calf stretch.', 'Communicate throughout. Hold for 20 seconds, release, and change sides. Stop for pain or any request to stop. Never add pressure or force range.'], true),
    guide('partner-chest', 'Partner-supported seated chest opening', ['push','pull'], ['shoulder','back','wrist'], ['Sit securely. Obtain consent and agree on a stop signal with a willing partner; teens need an adult supervisor.', 'Let the partner lightly support your relaxed forearms from below. They must not pull your arms backward or press your shoulders.', 'You gently let the shoulders settle back within your own comfortable range, keeping the ribs relaxed.', 'Hold for 20 seconds while communicating, then release. No joint forcing, bouncing, or extra pressure; stop immediately for pain.'], true)
  ];
  const soloNames = new Set(['hamstring stretch','standing lateral stretch','lying (side) quads stretch','triceps stretch','upper back stretch','rear deltoid stretch','calf stretch with hands against wall','chest and front of shoulder stretch']);
  function plan(pool, p, main) {
    if (p.age < 13 || p.limitations.some(x=>!['low-impact','knee','back','shoulder','wrist','balance'].includes(x))) return { warmupExercises: [], cooldownExercises: [] };
    const E = root.GymEngine, groups = new Set(main.map(E.group));
    const suitable = g => !g.avoid.some(x => p.limitations.includes(x)) && !p.exclude.split(',').map(x=>x.trim().toLowerCase()).filter(Boolean).some(x=>g.name.toLowerCase().includes(x));
    const ranked = list => list.filter(suitable).sort((a,b)=>b.groups.filter(x=>groups.has(x)).length-a.groups.filter(x=>groups.has(x)).length);
    const warmupExercises = ranked(warmups).slice(0,2);
    const solos = E.unique(pool.filter(e=>E.eligible(e,{...p,style:'mobility'}))).filter(e => soloNames.has(e.name.toLowerCase()) && !main.some(x=>E.sameExercise(x,e)))
      .sort((a,b)=>Number(groups.has(E.group(b)))-Number(groups.has(E.group(a))))
      .map(e=>({...e,source:'ExerciseDB',partner:false}));
    const preference = p.stretching || 'solo';
    const localSolo = ranked(cooldowns.filter(x=>!x.partner));
    const partners = ranked(cooldowns.filter(x=>x.partner));
    let cooldownExercises;
    if(preference==='partner') cooldownExercises=partners.slice(0,2);
    else if(preference==='both') cooldownExercises=[...(solos.length?solos:localSolo).slice(0,1),...partners.slice(0,1)];
    else cooldownExercises=[...solos,...localSolo].slice(0,2);
    return { warmupExercises, cooldownExercises };
  }
  root.GymStretching={plan};
  if(typeof module!=='undefined')module.exports=root.GymStretching;
})(typeof window==='undefined'?globalThis:window);
