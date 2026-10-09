/* Local programming rules. Exercise identities and instructions always come from the API.
   These conservative filters are not medical screening or provider difficulty ratings. */
(function (root) {
  'use strict';
  const styles = {
    auto: 'Auto — Choose for Me', hiit: 'HIIT', strength: 'Traditional Strength Training',
    hypertrophy: 'Hypertrophy', circuit: 'Circuit Training', calisthenics: 'Calisthenics',
    isometric: 'Isometric Training', plyometrics: 'Plyometrics', supersets: 'Supersets', mobility: 'Mobility & Flexibility'
  };
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const impact = /jump|hop|burpee|plyo|sprint|skip|bound/;
  const complex = /pistol|sissy|snatch|clean|jerk|muscle.?up|handstand|one.arm push|single.arm push|one hand|one leg.*squat|single leg.*squat|clap|depth jump|drop jump|neck|headstand|somersault|kipping|behind.*neck|weighted.*jump|barbell.*jump|planche|suspended|superman push|archer|chest tap|extreme/;
  const staticNames = new Set(['bodyweight incline side plank', 'power point plank', 'side bridge v. 2', 'isometric chest squeeze']);
  const hold = /plank|wall sit|isometric|static hold|side bridge/;
  const stretch = /stretch|mobility|cat.*cow/;
  const basics = new Set(['squat to overhead reach', 'push-up (wall)', 'push-up (wall) v. 2', 'push-up', 'crunch floor', 'reverse crunch', 'tuck crunch', 'pelvic tilt into bridge', 'low glute bridge on floor', 'dumbbell squat', 'dumbbell goblet squat', 'dumbbell biceps curl', 'dumbbell standing biceps curl', 'dumbbell alternate biceps curl', 'dumbbell hammer curl', 'band squat', 'band alternating biceps curl', 'dumbbell bent over row', 'dumbbell bench press']);
  const equipmentMap = {
    bodyweight: 'none', 'body weight': 'none', dumbbell: 'dumbbell', barbell: 'barbell', kettlebell: 'kettlebell',
    band: 'resistance band', 'resistance band': 'resistance band', cable: 'cable machine',
    'smith machine': 'smith machine', 'leverage machine': 'leverage machine', 'stability ball': 'stability ball',
    'medicine ball': 'medicine ball', 'ez barbell': 'ez barbell', 'trap bar': 'trap bar',
    rope: 'jump-rope', 'stationary bike': 'stationary bike', treadmill: 'treadmill', elliptical: 'elliptical'
  };
  function normalizedName(e) { return String(e.name || '').normalize('NFKC').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g,' ').trim(); }
  function sameExercise(a,b) { return (a.exerciseId && a.exerciseId === b.exerciseId) || normalizedName(a) === normalizedName(b); }
  function unique(pool) {
    const result=[];
    for(const e of pool) if(e?.exerciseId && !result.some(x=>sameExercise(x,e))) result.push(e);
    return result;
  }
  function pattern(e) {
    const n=normalizedName(e);
    if(/push up|push ups|chest press|bench press/.test(n))return 'horizontal-push';
    if(/crunch|sit up/.test(n))return 'trunk-flexion';
    if(/bridge/.test(n))return 'hip-extension';
    if(/squat|lunge/.test(n))return 'knee-dominant';
    if(/row|pull up|pulldown/.test(n))return 'pull';
    if(/curl/.test(n))return 'arm-flexion';
    return group(e)+':'+n;
  }
  function alternatives(pool,p,current,others) {
    return unique(pool.filter(e=>eligible(e,p))).filter(e=>!sameExercise(e,current)&&!others.some(x=>sameExercise(x,e))&&eligible(e,p)&&e.targetMuscles.some(m=>current.targetMuscles.includes(m))&&group(e)===group(current))
      .sort((a,b)=>Number(others.some(x=>pattern(x)===pattern(a)))-Number(others.some(x=>pattern(x)===pattern(b))));
  }
  function resolve(p) {
    p = { ...p, stretching: p.stretching || 'solo' };
    if (!Number.isFinite(p.age) || p.age < 1 || p.age > 120) throw Error('Enter your age from 1 to 120.');
    if (![30, 45, 60].includes(p.duration)) throw Error('Choose 30 Minutes, 45 Minutes, or 1 Hour+.');
    if (!styles[p.style]) throw Error('Choose a workout style.');
    if (!['solo','partner','both'].includes(p.stretching || 'solo')) throw Error('Choose a stretching preference.');
    const notes = [];
    let style = p.style;
    if (style === 'auto') {
      style = p.goal === 'flexibility-mobility' ? 'mobility' : p.goal === 'strength' ? 'strength'
        : ['muscle', 'muscle-toning'].includes(p.goal) ? 'hypertrophy'
        : p.goal === 'athletic-performance' && p.experience === 'advanced' && !p.limitations.length && p.age >= 18 ? 'plyometrics'
        : ['weight-loss', 'endurance-cardio', 'overall-conditioning'].includes(p.goal) && p.experience !== 'beginner' && p.age >= 18 ? 'circuit'
        : 'calisthenics';
      notes.push('Auto selected ' + styles[style] + ' for your goal and experience.');
    }
    if (p.age < 13) return { ...p, style: 'activity', notes: ['Ages under 13 use supervised play and activity, not an automated adult lifting plan.'] };
    if (p.age < 18) {
      notes.push('Ages 13–17: adult supervision, technique practice, bodyweight only, no maximal effort or training to failure.');
      if (p.goal === 'weight-loss') notes.push('For teens, this plan focuses on enjoyable movement and skill practice, without weight-loss or calorie targets.');
      if (style !== 'mobility' && style !== 'isometric') style = 'calisthenics';
    }
    if ((style === 'plyometrics' || style === 'hiit') && (p.experience === 'beginner' || p.limitations.length)) {
      notes.push(styles[style] + ' changed to controlled calisthenics for your experience or reported limitations.');
      style = 'calisthenics';
    }
    if (style === 'plyometrics' && !['athletic-performance', 'overall-conditioning', 'general-fitness'].includes(p.goal)) {
      notes.push('Plyometrics is not the primary match for this goal; using a goal-focused style.');
      style = p.goal === 'flexibility-mobility' ? 'mobility' : p.goal === 'strength' ? 'strength' : p.goal === 'muscle' ? 'hypertrophy' : 'circuit';
    }
    if (p.goal === 'flexibility-mobility' && style !== 'mobility') {
      notes.push('Your mobility goal takes priority; using Mobility & Flexibility.'); style = 'mobility';
    }
    if (['strength', 'muscle'].includes(p.goal) && ['hiit', 'mobility', 'isometric'].includes(style)) notes.push('This style is supplemental for your goal; progressive resistance sessions are also needed.');
    if (p.limitations.length) notes.push('Filters exclude movements associated with your selected limitations; they cannot determine what is medically appropriate for you.');
    if (p.age >= 65) notes.push('Age alone does not determine ability. Your experience and reported limitations set the exercise filters; use a comfortable effort and take extra recovery when needed.');
    return { ...p, style, notes };
  }
  function group(e) {
    const t = e.targetMuscles.join(' ').toLowerCase();
    if (/quadriceps|quads|glute|hamstring|calf|calves|adductor|abductor/.test(t)) return 'lower';
    if (/pector|chest|triceps|deltoid|shoulder/.test(t)) return 'push';
    if (/lat|back|bicep|trapez|traps|forearm/.test(t)) return 'pull';
    if (/abdom|abs|core|oblique|spine/.test(t)) return 'core';
    return 'conditioning';
  }
  // Reviewed provider instruction versions: knees remain stationary during this
  // floor crunch. This narrow exception is not clearance for a knee injury.
  // A changed/unknown instruction version retains the conservative knee exclusion.
  const stationaryKneeCrunch = new Set([
    'lie flat on your back with your knees bent and feet flat on the ground. place your hands behind your head with your elbows pointing outwards. engage your abs and lift your shoulders off the ground, curling forward towards your knees. pause for a moment at the top, then slowly lower your shoulders back down to the starting position. repeat for the desired number of repetitions.',
    'settle onto your back with your knees bent and feet planted. set your hands behind your head with your elbows pointing outwards. set the pelvis and keep the neck relaxed before curling upward. curl your rib cage toward your pelvis, letting the abdominals move the torso. leave a little space between the chin and chest; keep the movement in the torso. lower the shoulders or torso with control before the next curl.'
  ]);
  function reviewedKneePosition(e) {
    return e.exerciseId === 'TFqbd8t' && e.name.toLowerCase() === 'crunch floor'
      && e.equipments.every(x=>/^(bodyweight|body weight)$/i.test(x))
      && e.targetMuscles.every(x=>/^(abs|abdominals)$/i.test(x))
      && !(e.secondaryMuscles || []).some(x=>/quad|glute|calf|hamstring/i.test(x))
      && stationaryKneeCrunch.has(e.instructions.map(x=>x.replace(/^Step:\s*\d+\s*/i,'').trim().toLowerCase()).join(' '));
  }
  function eligible(e, p) {
    if (!e || !e.exerciseId || !e.name || !e.equipments?.length || !e.targetMuscles?.length || !e.instructions?.length) return false;
    const n = e.name.toLowerCase(), text = [n, ...e.instructions].join(' ').toLowerCase();
    if (complex.test(n)) return false;
    const available = new Set(['none', ...p.equipment]);
    if (p.age < 18 || ['calisthenics','hiit','plyometrics','isometric','mobility'].includes(p.style)) {
      if (!e.equipments.every(x => ['bodyweight','body weight'].includes(x.toLowerCase()))) return false;
    }
    if (!e.equipments.every(x => equipmentMap[x.toLowerCase()] && available.has(equipmentMap[x.toLowerCase()]))) return false;
    // Provider bodyweight tags can conceal required supports; check instructions too.
    const supports = [[/bench/, 'weight-bench'], [/pull.?up bar|chin.?up bar|hang.*bar/, 'pull-up-bar'], [/dumbbell/, 'dumbbell'], [/barbell/, 'barbell'], [/kettlebell/, 'kettlebell'], [/resistance band|elastic band/, 'resistance band'], [/cable/, 'cable machine'], [/smith machine/, 'smith machine'], [/stability ball|exercise ball|swiss ball/, 'stability ball'], [/medicine ball/, 'medicine ball'], [/treadmill/, 'treadmill'], [/stationary bike|exercise bike/, 'stationary bike'], [/elliptical/, 'elliptical'], [/squat rack|power rack/, 'squat rack']];
    if (supports.some(([rx, key]) => rx.test(text) && !available.has(key))) return false;
    if (/suspension|rings|parallel bars|dip bars|bosu|step platform|plyo box|sturdy object|chair|partner|assisted machine|weight plate|weighted vest|towel|arm blaster|elevated surface|raised platform/.test(text)) return false;
    if (p.age < 18 && /barbell|dumbbell|kettlebell|weight|band|cable|machine/.test(text.replace(/bodyweight|body weight/g,''))) return false;
    if (p.experience === 'beginner' && /decline|hanging|single.arm|single.leg|diamond|archer|dragon|ab wheel|rollout/.test(n)) return false;
    const steadyCardio = p.age >= 18 && p.goal === 'endurance-cardio' && p.style === 'circuit' && e.equipments.some(x => /^(treadmill|stationary bike|elliptical)$/.test(x));
    if ((p.experience === 'beginner' || p.age < 18 || ['hiit','circuit'].includes(p.style)) && !['mobility','isometric','plyometrics'].includes(p.style) && !basics.has(n) && !steadyCardio && !(p.style === 'hiit' && /^(mountain climber|jack jump \(male\)|jump squat)$/.test(n))) return false;
    const g = group(e), allMuscles = [...e.targetMuscles, ...(e.secondaryMuscles || [])].join(' ').toLowerCase();
    for (const limitation of p.limitations) {
      if (!['low-impact','knee','back','shoulder','wrist','balance'].includes(limitation)) return false;
      if (limitation === 'low-impact' && impact.test(text)) return false;
      if (limitation === 'knee' && (g === 'lower' || /quadriceps|quads|hamstring/.test(allMuscles) || (!reviewedKneePosition(e) && /squat|lunge|kneel|knee|jump|run/.test(text)))) return false;
      if (limitation === 'back' && (/back|spin|erector|core|abs|abdom|oblique/.test(allMuscles) || /bend|twist|hinge|deadlift|squat|row|crunch|sit.up|plank|jump|brace|core|trunk|spine|bridge|hip.thrust|extension|arch|lower back/.test(text))) return false;
      if (limitation === 'shoulder' && (g === 'push' || g === 'pull' || /shoulder|arm|plank|push|hand|palm|wall|support/.test(text))) return false;
      if (limitation === 'wrist' && (g === 'push' || g === 'pull' || /hand|grip|plank|crawl|palm|wrist|knuckle|fist/.test(text))) return false;
      if (limitation === 'balance' && (/standing|stand |single|lunge|jump|run|balance|face a wall|feet hip|feet shoulder|upright|plank|climber|crawl|bird.?dog|march|one (arm|leg|hand|foot)/.test(text))) return false;
    }
    const excluded = p.exclude.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
    if (excluded.some(x => n.includes(x))) return false;
    if (p.style === 'mobility') return stretch.test(n) && !/dynamic|rocking|world greatest|iron cross|circles|deep|elite|extended/.test(n);
    if (p.style === 'isometric') return staticNames.has(n) && !(p.age < 18 && /as hard as/.test(text));
    if (p.style === 'plyometrics') return impact.test(n) && !/barbell|dumbbell|weighted|box/.test(text);
    if (stretch.test(n) || hold.test(n)) return false;
    if (p.style !== 'hiit' && impact.test(n)) return false;
    return true;
  }
  function terms(p) {
    if (p.style === 'mobility') return ['stretch'];
    if (p.style === 'isometric') return ['plank', 'side bridge', 'isometric chest'];
    if (p.style === 'plyometrics') return ['jump', 'hop'];
    if (p.style === 'hiit') return ['jumping jack', 'mountain climber', 'squat', 'push'];
    const base = ['squat', 'push', 'bridge', 'crunch'];
    if (p.goal === 'endurance-cardio' && p.style === 'circuit' && p.equipment.includes('cardio-equipment')) {
      for (const term of ['treadmill', 'stationary bike', 'elliptical']) if (p.equipment.includes(term)) base.push(term);
    }
    if (p.style !== 'calisthenics' && p.equipment.some(x => ['dumbbell','barbell','resistance band','cable machine'].includes(x))) base.push('row', 'curl');
    return base;
  }
  function dose(p) {
    const sets = p.experience === 'beginner' || p.age < 18 || p.duration === 30 ? 2 : p.duration === 45 ? 3 : 4;
    const table = {
      strength: [sets, p.experience === 'beginner' ? '8–10 reps' : '6–8 reps', 120, 'Complete each exercise before moving on. Use a controlled load; no maximum attempts.'],
      hypertrophy: [sets, '8–12 reps', 90, 'Complete all sets with controlled lowering; stop with repetitions in reserve.'],
      circuit: [sets, '10–15 reps', 30, 'One set at each station, then repeat the circuit. Rest 90 seconds between rounds.'],
      calisthenics: [sets, '8–12 reps', 60, 'Controlled bodyweight sets; stop before technique breaks down.'],
      hiit: [sets, p.experience === 'advanced' ? '30 sec work' : '20 sec work', 60, 'Alternate work and recovery intervals. Repeat the sequence; do not use all-out effort.'],
      isometric: [sets, p.age < 18 ? '10–15 sec hold' : '15–25 sec hold', 60, 'Hold a comfortable position and keep breathing. Rest fully between holds.'],
      plyometrics: [2, '3–5 quality reps', 120, 'Reset between repetitions. Stop when landing control deteriorates.'],
      supersets: [sets, '8–12 reps', 90, 'Alternate the two exercises in each labeled pair (A1/A2, B1/B2, and so on). Take 20 seconds to transition, then 90 seconds after each pair.'],
      mobility: [2, '20–30 sec gently per side', 20, 'Move gently within a comfortable range; no bouncing or forced end positions.']
    };
    const [s, reps, rest, structure] = table[p.style];
    const workSeconds = p.style === 'hiit' ? (p.experience === 'advanced' ? 30 : 20) : p.style === 'isometric' ? (p.age < 18 ? 15 : 25) : p.style === 'plyometrics' ? 20 : p.style === 'mobility' ? 60 : p.style === 'strength' ? 32 : 40;
    return { sets: s, reps, rest, structure, workSeconds };
  }
  function timing(workout, p) {
    const n = workout.exercises.length, d = workout;
    const warmup = p.duration === 30 ? 5 : p.duration === 45 ? 7 : 10;
    const cooldown = p.duration === 30 ? 4 : p.duration === 45 ? 5 : 7;
    let seconds;
    if (p.style === 'circuit') seconds = n * d.sets * d.workSeconds + n * d.sets * d.rest + (d.sets - 1) * 90;
    else if (p.style === 'supersets') seconds = n * d.sets * d.workSeconds + (n / 2) * d.sets * (20 + d.rest);
    else seconds = n * (d.sets * d.workSeconds + (d.sets - 1) * d.rest) + Math.max(0, n - 1) * 30;
    // Machine cardio cards prescribe 2 x (2 min work + 1 min easy recovery).
    for (const e of workout.exercises) if (e.equipments.some(x => /treadmill|stationary bike|elliptical/.test(x))) seconds += 360 - (d.sets * d.workSeconds + (d.sets - 1) * d.rest);
    const mainMinutes = Math.ceil(seconds / 60);
    const easyMinutes = Math.max(0, p.duration - warmup - cooldown - mainMinutes);
    return { warmup, cooldown, mainMinutes, easyMinutes, estimatedMinutes: warmup + cooldown + mainMinutes + easyMinutes };
  }
  function countFor(p) {
    if (p.age < 18) return 4;
    if (p.style === 'plyometrics') return 3;
    if (p.style === 'isometric') return 4;
    if (p.style === 'hiit') return p.duration === 30 ? 4 : 6;
    return p.duration === 30 ? 4 : p.duration === 45 ? 6 : 8;
  }
  function choose(pool, p, used = [], avoid = [], random = Math.random) {
    const count = countFor(p);
    const candidates = unique(pool.filter(e => eligible(e, p))).map(e => ({ e, score: random() + (avoid.includes(e.exerciseId) ? -4 : 0) + (used.includes(e.exerciseId) ? -2 : 0) + (p.style === 'strength' && /squat|push|press|row/.test(e.name) ? 2 : 0) + (['strength','hypertrophy','supersets'].includes(p.style) && e.equipments.some(x => !/body.?weight/.test(x)) ? 1 : 0) }));
    const result = [], groups = new Map(), patterns = new Map();
    while (result.length < count && candidates.length) {
      candidates.sort((a,b) => (b.score - (groups.get(group(b.e)) || 0) * 3 - (patterns.get(pattern(b.e)) || 0) * 8) - (a.score - (groups.get(group(a.e)) || 0) * 3 - (patterns.get(pattern(a.e)) || 0) * 8));
      const e = candidates.shift().e;
      if (result.some(x => sameExercise(x,e))) continue;
      // Prefer a shorter varied session over redundant versions of the same movement.
      const distinctFocus = p.experience === 'advanced' && ['hypertrophy','supersets'].includes(p.style) && (patterns.get(pattern(e)) || 0) < 2 && result.filter(x=>pattern(x)===pattern(e)).every(x=>!x.targetMuscles.some(m=>e.targetMuscles.includes(m)));
      if (patterns.has(pattern(e)) && !['mobility','isometric'].includes(p.style) && !distinctFocus) continue;
      result.push(e); groups.set(group(e), (groups.get(group(e)) || 0) + 1); patterns.set(pattern(e),(patterns.get(pattern(e))||0)+1);
    }
    if (result.length < 2) throw Error('Only ' + result.length + ' distinct matching movement(s) were found in the fetched exercise pool for this style, confirmed equipment, and restrictions' + (p.limitations.length ? ' (' + p.limitations.join(', ') + ')' : '') + '. At least two are needed; restrictions have not been relaxed. Try another style or equipment you actually have. For an injury or unclear suitability, ask a qualified professional for an adapted plan.');
    if (p.style === 'supersets' && result.length % 2) result.pop();
    const workout = { exercises: result, ...dose(p), partial: result.length < count };
    if(root.GymStretching) Object.assign(workout, root.GymStretching.plan(pool,p,result));
    return { ...workout, ...timing(workout, p) };
  }
  function schedule(selected) {
    // Monday–Sunday plan, also check the Sunday-to-Monday boundary for repeatability.
    const training = new Set();
    return days.map((day, i) => {
      if (!selected.includes(i)) return { day, index: i, kind: 'rest' };
      const recovery = training.has(i - 1) || (i === 6 && training.has(0));
      if (!recovery) training.add(i);
      return { day, index: i, kind: recovery ? 'recovery' : 'training' };
    });
  }
  root.GymEngine = { styles, days, resolve, eligible, group, terms, dose, timing, choose, schedule, sameExercise, normalizedName, unique, pattern, alternatives };
  if (typeof module !== 'undefined') module.exports = root.GymEngine;
})(typeof window === 'undefined' ? globalThis : window);
