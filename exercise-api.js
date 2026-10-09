/* Public ExerciseDB integration: bounded requests, session cache, no synthetic fallback. */
(function () {
  'use strict';
  const endpoint = 'https://oss.exercisedb.dev/api/v1/exercises', cache = new Map();
  let nextRequestAt = 0;
  function strings(a) { return Array.isArray(a) ? a.filter(x => typeof x === 'string' && x.trim()) : []; }
  function mediaUrl(value, id) {
    try {
      const url = new URL(value);
      return url.origin === 'https://static.exercisedb.dev' && url.pathname === '/media/' + encodeURIComponent(id) + '.gif' && !url.search && !url.hash && !url.username && !url.password ? url.href : null;
    } catch { return null; }
  }
  function record(e) {
    if (!e || typeof e.exerciseId !== 'string' || !e.exerciseId.trim() || typeof e.name !== 'string' || !e.name.trim()) return null;
    const result = { exerciseId: e.exerciseId, name: e.name, gifUrl: mediaUrl(e.gifUrl, e.exerciseId) };
    for (const key of ['equipments', 'targetMuscles', 'secondaryMuscles', 'bodyParts', 'instructions']) result[key] = strings(e[key]);
    return result.equipments.length && result.targetMuscles.length && result.instructions.length ? result : null;
  }
  async function search(name) {
    if (cache.has(name)) return cache.get(name);
    if (nextRequestAt - Date.now() > 5000) throw Error('The exercise service is busy. Wait one minute, then try again.');
    const found = new Map(), cursors = new Set(); let after = null;
    for (let page = 0; page < 2; page++) {
      await new Promise(r => setTimeout(r, Math.max(0, nextRequestAt - Date.now())));
      const url = new URL(endpoint);
      url.searchParams.set('limit', '25'); url.searchParams.set('name', name);
      if (after) url.searchParams.set('after', after);
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(url, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
        if (!response.ok) {
          const body = typeof response.text === 'function' ? (await response.text()).slice(0, 1000) : '';
          if (response.status === 429 || /\b1015\b/.test(body)) {
            const header = response.headers?.get('Retry-After');
            const seconds = header && /^\d+$/.test(header) ? Number(header) : header ? Math.max(0, (Date.parse(header) - Date.now()) / 1000) : 60;
            nextRequestAt = Date.now() + Math.max(60000, Number.isFinite(seconds) ? seconds * 1000 : 60000);
            throw Error('The exercise service is busy. Wait one minute or the service’s retry period, then try again.');
          }
          if (/\b1102\b/.test(body)) throw Error('The exercise provider reached its server resource limit (1102). Please try again later.');
          throw Error('The exercise service is unavailable (HTTP ' + response.status + '). Please try again later.');
        }
        const payload = await response.json();
        if (payload?.success !== true || !Array.isArray(payload.data)) throw Error('The exercise service returned an unreadable response. Please retry.');
        for (const item of payload.data) { const e = record(item); if (e) found.set(e.exerciseId, e); }
        const next = payload.meta?.nextCursor;
        if (payload.meta?.hasNextPage !== true || typeof next !== 'string' || !next.trim() || cursors.has(next)) break;
        cursors.add(next); after = next;
      } catch (error) {
        if (error.name === 'AbortError') throw Error('The exercise service took too long. Please retry.');
        if (error instanceof TypeError) throw Error('Cannot reach the exercise service. Check your connection and retry.');
        if (error instanceof SyntaxError) throw Error('The exercise service returned invalid data. Please retry.');
        throw error;
      } finally { clearTimeout(timeout); nextRequestAt = Math.max(nextRequestAt, Date.now() + 1200); }
    }
    const result = [...found.values()]; if (result.length) cache.set(name, result); return result;
  }
  window.GymExercises = {
    mediaUrl,
    async load(terms, progress) {
      const all = new Map();
      for (let i = 0; i < terms.length; i++) {
        progress?.('Finding exercises… ' + (i + 1) + ' of ' + terms.length);
        for (const e of await search(terms[i])) all.set(e.exerciseId, e);
      }
      return [...all.values()];
    }
  };
})();
