(function () {
  'use strict';
  const $ = s => document.querySelector(s), E = window.GymEngine;
  const form = $('#workout-form'), status = $('#builder-status'), results = $('#workout-results');
  let plan = null, pool = [], busy = false, revision = 0;
  function node(tag, text, cls) { const n = document.createElement(tag); if (text) n.textContent = text; if (cls) n.className = cls; return n; }
  function button(text, action) { const b = node('button', text, 'secondary'); b.type = 'button'; b.addEventListener('click', action); return b; }
  function profile() {
    const ageInput = $('#workout-age');
    if (!ageInput.checkValidity() || !ageInput.value.trim()) { ageInput.reportValidity(); throw Error('Enter your age from 1 to 120.'); }
    if ($('#gym-membership-yes').checked && !$('#gym').value) throw Error('Choose your gym or select No gym membership.');
    const equipment = [...form.querySelectorAll('[name="equipment"]:checked')].map(x => x.value);
    if (equipment.includes('other')) {
      const known = ['cable machine', 'smith machine', 'leverage machine', 'stability ball', 'medicine ball', 'ez barbell', 'trap bar', 'squat rack'];
      const custom = $('#other-equipment').value.split(',').map(x => x.trim().toLowerCase());
      if (custom.some(x => !known.includes(x))) throw Error('For Other Equipment, use the supported names listed below the field, separated by commas.');
      equipment.push(...custom);
    }
    if (equipment.includes('cardio-equipment')) equipment.push(...[...form.querySelectorAll('[name="cardio-type"]:checked')].map(x => x.value));
    const p = E.resolve({ age: Number(ageInput.value), goal: $('#goal').value, experience: $('#experience').value,
      style: $('#workout-style').value, stretching: $('#stretching-preference').value, equipment, duration: Number($('#duration').value),
      limitations: [...form.querySelectorAll('[name="limitation"]:checked')].map(x => x.value), exclude: $('#exercise-exclusions').value.trim() });
    if (p.limitations.includes('other')) throw Error('Automated matching cannot assess an unlisted limitation or injury. Ask a qualified professional to help choose activities before generating.');
    if (p.age < 18 && !$('#supervision').checked) throw Error('A parent, guardian, or qualified instructor must supervise youth activity. Confirm supervision to continue.');
    return p;
  }
  function lock(value) {
    busy = value; $('#generate-workout').disabled = value;
    results.querySelectorAll('button').forEach(x => x.disabled = value);
    results.setAttribute('aria-busy', String(value));
  }
  function markStale() {
    if (plan) { $('#profile-changed').hidden = false; results.querySelectorAll('button').forEach(x => x.disabled = true); }
  }
  function activityText(p) {
    if (p.limitations.length) return 'Ask the supervising adult or qualified instructor to choose enjoyable, age-appropriate activities that accommodate the reported limitations. This app does not prescribe movements for a child with those limitations.';
    return p.age < 3 ? 'With a caregiver, explore age-appropriate movement and floor play in a clear space. Follow the child’s cues; no sets, loads, or timed adult workout.'
      : 'With an adult, choose enjoyable play such as a movement game, dancing, or a comfortable walk. Alternate activities with breaks and follow the child’s interest. No weights, calorie targets, or adult lifting prescription.';
  }
  function render() {
    results.replaceChildren(); $('#profile-changed').hidden = true;
    const summary = node('div', '', 'plan-summary');
    summary.append(node('span', plan.mode === 'weekly' ? 'YOUR WEEK, YOUR PACE' : 'BUILT AROUND YOU', 'eyebrow'),
      node('h3', plan.profile.style === 'activity' ? 'Supervised activity' : E.styles[plan.profile.style]),
      node('p', plan.profile.style === 'activity' ? 'Enjoyable movement with an adult.' : 'Session window: ' + (plan.profile.duration === 60 ? '1 Hour+' : plan.profile.duration + ' minutes') + '. Each workout includes a timed breakdown; estimates depend on your pace.'));
    for (const note of plan.profile.notes) summary.append(node('p', note, 'notice'));
    if (plan.profile.style !== 'activity') summary.append(node('p', 'Follow the warm-up and cooldown times on each workout. Use comfortable effort, stop for pain or dizziness, and finish gently. Sets, repetitions, and rest are GymBuddy programming suggestions.'));
    results.append(summary);
    for (const day of plan.days) {
      const card = node('article', '', 'day-card'); card.dataset.day = day.day;
      const top = node('div', '', 'day-top');
      top.append(node('h3', day.day), node('span', day.kind === 'training' ? 'WORKOUT' : day.kind === 'activity' ? 'SUPERVISED' : 'RECOVERY', 'badge')); card.append(top);
      if (day.kind !== 'training') card.append(node('p', day.kind === 'activity' ? activityText(plan.profile) : day.kind === 'rest' ? 'Rest day. Optional easy movement if comfortable.' : 'Recovery session: rest, or use movements already established as suitable for your limitations. No repeated hard session on consecutive days.'));
      else {
        const w = day.workout; card.append(node('p', w.structure));
        card.append(node('p', 'Approximately ' + w.estimatedMinutes + ' minutes: ' + w.warmup + ' min gradual warm-up + ' + w.mainMinutes + ' min exercise block + ' + w.easyMinutes + ' min easy movement / recovery + ' + w.cooldown + ' min gentle cooldown.', 'session-breakdown'));
        if (w.easyMinutes) card.append(node('p', 'Easy block: ' + w.easyMinutes + ' minutes of rest or movement already established as suitable for your limitations, with breaks as needed. Keep it easy; do not add extra hard sets. If you skip this block, the session will be shorter. ' + (plan.profile.age < 18 ? 'The supervising adult should decide its appropriate length.' : ''), 'muted'));
        if (w.partial) card.append(node('p', 'Fewer distinct movements matched your restrictions and preferences. The timing includes the recovery block shown; restrictions were not relaxed.', 'notice'));
        card.append(preparation(day,'warmup'));
        const list = node('div', '', 'exercise-cards');
        w.exercises.forEach((e, i) => {
          const item = node('section', '', 'exercise-card'); item.dataset.exerciseId = e.exerciseId;
          const pair = plan.profile.style === 'supersets' ? String.fromCharCode(65 + Math.floor(i / 2)) + (i % 2 + 1) : String(i + 1).padStart(2, '0');
          item.append(node('span', pair, 'exercise-number'), node('h4', e.name), node('p', e.targetMuscles.join(' · ') + ' / ' + e.equipments.join(', '), 'muted'));
          item.append(exerciseMedia(e));
          const cardio = e.equipments.some(x => /treadmill|stationary bike|elliptical/.test(x));
          item.append(node('p', (cardio ? '2 rounds / 2 min comfortable effort / 60 sec easy recovery' : w.sets + ' sets / ' + w.reps + ' / ' + (plan.profile.style === 'supersets' && i % 2 === 0 ? '20 sec transition' : w.rest + ' sec rest')), 'prescription'));
          const details = node('details'); details.append(node('summary', 'How to perform'));
          const ol = node('ol'); e.instructions.forEach(x => ol.append(node('li', x.replace(/^Step:\s*\d+\s*/i, '')))); details.append(ol); item.append(details);
          item.append(button('Replace exercise', () => alternatives(day, i, item))); list.append(item);
        });
        card.append(list, preparation(day,'cooldown'), button('Regenerate ' + day.day.toLowerCase(), () => regenerate(day)));
      }
      results.append(card);
    }
  }
  function exerciseMedia(e) { return window.GymMedia.create(e); }
  function preparation(day,phase) {
    const w=day.workout, warm=phase==='warmup', entries=warm?w.warmupExercises:w.cooldownExercises;
    const section=node('section','','preparation');section.dataset.phase=phase;
    section.append(node('h4',(warm?'Warm-up':'Cooldown')+' · '+(warm?w.warmup:w.cooldown)+' minutes'));
    if(!entries?.length) { section.append(node('p','No matching stretches were available for your preferences. Rest during this block instead of substituting an unverified movement; do not force an unsuitable stretch.','notice'));return section; }
    section.append(node('p',warm?'Start with 3 minutes of easy movement that suits your limitations, then use the gentle movements below. Keep moving; do not force or hold end ranges.':'Slow down for 1 minute, then use comfortable stretches below. No bouncing, forced range, or painful movement.'));
    const eachSeconds=Math.floor(((warm?w.warmup-3:w.cooldown-1)*60)/entries.length);
    for(const e of entries) {
      const detail=node('details','','prep-exercise');detail.dataset.exerciseId=e.exerciseId||'';detail.dataset.guideId=e.guideId||'';
      detail.append(node('summary',e.name+(e.partner?' · partner-supported':'')));
      detail.append(node('p',(e.source||'ExerciseDB')+' · '+eachSeconds+' sec block including sides, transitions, and rests. '+(warm?'Move slowly for 20 seconds, then rest; repeat gently within the block.':'Use 20-second comfortable holds per side with relaxed breaks. Do not hold continuously for the whole block.')));
      if(e.partner)detail.append(node('p','Partner assistance requires consent and continuous communication. Support only—no pushing, pulling, joint forcing, or extra pressure. Stop immediately for pain. Teens need a supervising adult.','notice'));
      detail.append(exerciseMedia(e),node('h5','How to Perform'));
      const list=node('ol');e.instructions.forEach(x=>list.append(node('li',x.replace(/^Step:\s*\d+\s*/i,''))));detail.append(list);section.append(detail);
    }
    return section;
  }
  function alternatives(day, index, item) {
    if (busy || !$('#profile-changed').hidden) return;
    item.querySelector('.alternatives')?.remove();
    const current = day.workout.exercises[index];
    const options = E.alternatives(pool,plan.profile,current,day.workout.exercises.filter((e,i)=>i!==index));
    const panel = node('div', '', 'alternatives'); panel.append(node('p', 'Alternatives with a similar target and purpose:'));
    if (!options.length) panel.append(node('p', 'No matching alternative is available with these preferences. Your exercise is unchanged.', 'notice'));
    options.slice(0, 8).forEach(e => panel.append(button(e.name, () => { day.workout.exercises[index] = e; Object.assign(day.workout, window.GymStretching.plan(pool,plan.profile,day.workout.exercises), E.timing(day.workout, plan.profile)); render(); status.textContent = 'Exercise replaced. The rest of your plan is unchanged.'; })));
    panel.append(button('Close alternatives', () => panel.remove())); item.append(panel);
  }
  function regenerate(day) {
    if (busy || !$('#profile-changed').hidden) return;
    try {
      const old = day.workout.exercises.map(x => x.exerciseId), others = plan.days.filter(x => x !== day && x.workout).flatMap(x => x.workout.exercises.map(e => e.exerciseId));
      const next = E.choose(pool, plan.profile, others, old);
      if (next.exercises.every(e => old.includes(e.exerciseId))) { status.textContent = 'No new matching exercises are available for this day. Your plan is unchanged.'; return; }
      day.workout = next; render(); status.textContent = day.day + ' regenerated. Other days are unchanged.';
    } catch (e) { status.textContent = e.message + ' Your plan is unchanged.'; }
  }
  form.addEventListener('submit', async event => {
    event.preventDefault(); if (busy) return;
    const startRevision = revision;
    try {
      const p = profile(), mode = $('#plan-mode').value, selected = [...form.querySelectorAll('[name="training-day"]:checked')].map(x => Number(x.value));
      if (mode === 'weekly' && !selected.length) throw Error('Select at least one day for your weekly plan.');
      lock(true);
      const days = mode === 'weekly' ? E.schedule(selected) : [{ day: 'Quick workout', index: 0, kind: 'training' }];
      const freshPool = p.style === 'activity' ? [] : await window.GymExercises.load([...new Set([...E.terms(p), ...(p.stretching !== 'partner' ? ['stretch'] : [])])], message => status.textContent = message);
      const used = [];
      for (const day of days) {
        if (p.style === 'activity' && day.kind === 'training') day.kind = 'activity';
        if (day.kind === 'training') { day.workout = E.choose(freshPool, p, used); used.push(...day.workout.exercises.map(e => e.exerciseId)); }
      }
      plan = { profile: p, mode, days }; pool = freshPool; render();
      status.textContent = 'Your ' + (mode === 'weekly' ? 'weekly plan' : 'workout') + ' is ready.'; $('#workout-heading').focus();
    } catch (e) { status.textContent = e.message + (plan ? ' Your existing plan has been preserved.' : ''); }
    finally { lock(false); if (startRevision !== revision || !$('#profile-changed').hidden) markStale(); }
  });
  const limitationDropdown = $('#limitations-dropdown');
  function limitationSummary() {
    const selected = [...form.querySelectorAll('[name="limitation"]:checked')];
    $('#limitations-summary').textContent = selected.length === 0 ? 'No limitations selected' : selected.length === 1 ? selected[0].parentElement.textContent.trim() : selected.length + ' limitations selected';
  }
  limitationDropdown.addEventListener('change', limitationSummary);
  limitationDropdown.addEventListener('keydown', event => {
    if (event.key === 'Escape') { limitationDropdown.open = false; $('#limitations-toggle').focus(); event.preventDefault(); }
  });
  limitationSummary();
  $('#plan-mode').addEventListener('change', () => { $('#weekly-days').hidden = $('#plan-mode').value !== 'weekly'; });
  $('#workout-age').addEventListener('input', () => { $('#supervision-label').hidden = !$('#workout-age').value || Number($('#workout-age').value) >= 18; });
  for (const type of ['input', 'change']) form.addEventListener(type, e => { if (!e.target.closest('#bmi-section')) { revision++; markStale(); } });
})();
