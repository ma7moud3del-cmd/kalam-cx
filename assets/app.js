/* Kalam CX Academy: static, data-driven learning platform (public pilot).
   Content lives in data/catalog.json and courses/<id>/course.json. This file is presentation only.
   Learner state is kept in this browser through the Store below, which a backend can replace later
   (same method names: enroll, setDone, setAnswer, setNote ...). Nothing is sent anywhere. */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const App = { cat: null, courses: {}, order: [], instructors: {}, cats: {}, booted: false };
const LETTERS = 'ABCDEFGH';
const ICON = {
  chev: '<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4L18 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="currentColor"/></svg>',
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 10l5-3v10l-5-3z" fill="currentColor"/></svg>',
  practice: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 10h16M10 4v16" stroke="currentColor" stroke-width="1.6"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5V14M12 17h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>',
  exam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 12l2 2 3-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
};
ICON.youtube = ICON.video;

/* ---------------- learner store (this browser only) ---------------- */
const Store = (() => {
  const KEY = 'kalam.academy.v2';
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== 2) s = { v: 2, courses: {}, enrolled: [], saved: [], last: {}, migrated: {} };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* storage blocked: keep in memory */ } };
  const C = id => s.courses[id] || (s.courses[id] = { done: {}, answers: {}, notes: {} });
  return {
    isEnrolled: id => s.enrolled.includes(id),
    enroll(id) { if (!s.enrolled.includes(id)) { s.enrolled.push(id); save(); } },
    isSaved: id => s.saved.includes(id),
    toggleSave(id) { s.saved = s.saved.includes(id) ? s.saved.filter(x => x !== id) : [...s.saved, id]; save(); return s.saved.includes(id); },
    isDone: (c, l) => !!C(c).done[l],
    setDone(c, l, v = true) { if (v) C(c).done[l] = Date.now(); else delete C(c).done[l]; save(); },
    answer(c, qid, rev) { const a = C(c).answers[qid]; return a && a.r === (rev || 1) ? a.c : undefined; },
    setAnswer(c, qid, rev, choice) { C(c).answers[qid] = { c: choice, r: rev || 1 }; save(); },
    resetAnswers(c, qids) { qids.forEach(q => delete C(c).answers[q]); save(); },
    note: (c, l) => C(c).notes[l] || '',
    setNote(c, l, t) { if (t) C(c).notes[l] = t; else delete C(c).notes[l]; save(); },
    last: c => s.last[c],
    setLast(c, l) { s.last[c] = l; save(); },
    enrolledIds: () => [...s.enrolled], savedIds: () => [...s.saved],
    clearAll() { s = { v: 2, courses: {}, enrolled: [], saved: [], last: {}, migrated: {} }; try { localStorage.removeItem(KEY); localStorage.removeItem('kalamAcademy'); } catch (e) {} },
    /* One-time import of progress from the earlier single-course Excel site (key "kalamAcademy"). */
    migrateLegacy(course) {
      if (course.id !== 'excel' || s.migrated.excel) return;
      let old = null; try { old = JSON.parse(localStorage.getItem('kalamAcademy') || 'null'); } catch (e) {}
      s.migrated.excel = true;
      if (old && (old.w || old.q)) {
        let any = false;
        Object.entries(old.w || {}).forEach(([n, list]) => {
          const sec = course.sections.find(x => x.id === 's' + n); if (!sec) return;
          const vids = sec.lessons.filter(l => l.type === 'video');
          (list || []).forEach(i => { if (vids[i]) { C('excel').done[vids[i].id] = Date.now(); any = true; } });
        });
        Object.entries(old.q || {}).forEach(([name, ans]) => {
          const n = (name.match(/\d+/) || [])[0];
          Object.entries(ans || {}).forEach(([i, c]) => { C('excel').answers[`s${n}-q${String(+i + 1).padStart(2, '0')}`] = { c, r: 1 }; any = true; });
        });
        if (any && !s.enrolled.includes('excel')) s.enrolled.push('excel');
      }
      save();
    }
  };
})();

/* ---------------- data ---------------- */
const url = (c, p) => !p ? '' : /^(https?:)?\/\//.test(p) ? p : (c.base || '') + p;
const lessonsOf = c => c.sections.flatMap(sec => sec.lessons.map(l => ({ ...l, section: sec })));
function stats(c) {
  const all = lessonsOf(c), vids = all.filter(l => l.type === 'video' || l.type === 'youtube');
  const done = all.filter(l => Store.isDone(c.id, l.id)).length;
  return { all, items: all.length, videos: vids.length, minutes: c.videoMinutes || 0, quizzes: all.filter(l => l.type === 'quiz').length,
    exams: all.filter(l => l.type === 'exam').length, done, pct: all.length ? Math.round(100 * done / all.length) : 0 };
}
const durationText = c => c.durationLabel || (c.videoMinutes ? `${(c.videoMinutes / 60).toFixed(1)} hours` : 'Self-paced');
const priceText = c => (c.price ? `${c.price}` : 'Free');
const instr = c => (c.instructors || []).map(id => App.instructors[id]).filter(Boolean);
async function boot() {
  try {
    const r = await fetch('data/catalog.json', { cache: 'no-cache' }); if (!r.ok) throw new Error('catalog ' + r.status);
    App.cat = await r.json();
    App.cat.instructors.forEach(i => (App.instructors[i.id] = i)); App.cat.categories.forEach(k => (App.cats[k.id] = k));
    const loaded = await Promise.all(App.cat.courses.map(async ref => {
      try { const rr = await fetch(ref.data, { cache: 'no-cache' }); const c = await rr.json(); c.base = c.base || ref.data.replace(/course\.json$/, ''); return c; }
      catch (e) { console.warn('course failed to load', ref.id, e); return null; }
    }));
    loaded.filter(Boolean).forEach(c => { App.courses[c.id] = c; App.order.push(c.id); Store.migrateLegacy(c); });
  } catch (e) {
    $('#app').innerHTML = `<section class="wrap narrow"><h1 tabindex="-1">The Academy couldn't load</h1><p>Check your connection and reload the page.</p></section>`; return;
  }
  App.booted = true; route();
}

/* ---------------- router ---------------- */
const LEGACY = { home: '/', exam: '/learn/excel/final-exam', experts: '/course/excel-expert-picks', library: '/course/excel' };
function parse() {
  let h = decodeURIComponent(location.hash.replace(/^#/, ''));
  if (!h.startsWith('/')) {
    let to = LEGACY[h];
    const m = h.match(/^(session|test)-(\d)$/); if (m) to = `/learn/excel/s${m[2]}-${m[1] === 'test' ? 'quiz' : 'quick'}`;
    if (to) { history.replaceState(null, '', '#' + to); h = to; } else h = '/';
  }
  const [path, qs] = h.split('?'); const parts = path.split('/').filter(Boolean);
  return { parts, q: new URLSearchParams(qs || '') };
}
let lastPath = '';
function route() {
  if (!App.booted) return;
  const { parts, q } = parse(); const [a, b, c] = parts; let out;
  if (!a) out = viewHome();
  else if (a === 'courses') out = viewCatalog(q);
  else if (a === 'course' && App.courses[b]) out = viewCourse(App.courses[b]);
  else if (a === 'learn' && App.courses[b]) out = viewPlayer(App.courses[b], c);
  else if (a === 'my') out = viewMy();
  else if (a === 'instructor' && App.instructors[b]) out = viewInstructor(App.instructors[b]);
  else if (a === 'studio') out = viewStudio();
  else if (a === 'about') out = viewAbout();
  else out = { title: 'Page not found', html: `<section class="wrap narrow pad"><h1 tabindex="-1" data-focus>Page not found</h1><p class="sub">That link doesn't match a page in the Academy.</p><a class="btn" href="#/courses">Browse all courses</a></section>` };
  $('#app').innerHTML = out.html;
  document.title = out.title === 'Kalam CX Academy' ? out.title : `${out.title} · Kalam CX Academy`;
  $$('#nav a').forEach(x => { const on = x.dataset.nav === a || (a === 'course' && x.dataset.nav === 'courses') || (a === 'instructor' && x.dataset.nav === 'courses');
    if (on) x.setAttribute('aria-current', 'page'); else x.removeAttribute('aria-current'); });
  closeMenu();
  const samePage = lastPath === parts.join('/'); lastPath = parts.join('/');
  if (out.after) out.after();
  if (!samePage) {
    window.scrollTo(0, 0);
    const f = $('[data-focus]'); if (f && document.readyState === 'complete' && App.routed) f.focus({ preventScroll: true });
    announce(out.title);
  }
  App.routed = true;
}
addEventListener('hashchange', route);
const announce = t => { const s = $('#sr-status'); s.textContent = ''; setTimeout(() => (s.textContent = t), 60); };

/* ---------------- shared pieces ---------------- */
function cover(c, cls = '') {
  if (c.cover) return `<span class="cover ${cls}"><img src="${esc(url(c, c.cover))}" alt="" loading="lazy"></span>`;
  return `<span class="cover gen ${cls}" aria-hidden="true"><span class="genbadge">${ICON.play}</span><b>${esc(c.title)}</b></span>`;
}
function card(c) {
  const st = stats(c), started = st.done > 0, names = instr(c).map(i => i.name).join(', ');
  return `<article class="ccard">
  <a class="ccover" href="#/course/${c.id}" tabindex="-1" aria-hidden="true">${cover(c)}</a>
  <div class="cbody">
   <p class="ccat">${esc(App.cats[c.category]?.name || '')}${c.type === 'collection' ? ' · Curated collection' : ''}</p>
   <h3><a href="#/course/${c.id}">${esc(c.title)}</a></h3>
   <p class="cby">${esc(names)}</p>
   <ul class="cmeta" aria-label="Course details"><li>${esc(c.levelRange || c.level)}</li><li>${esc(durationText(c))}</li><li>${esc(c.languageLabel)}</li></ul>
   ${started ? `<div class="pbar" role="progressbar" aria-label="Your progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.pct}"><i style="width:${st.pct}%"></i></div><p class="ptext">${st.pct}% complete</p>` : ''}
   <div class="cfoot"><span class="price">${priceText(c)}</span><span class="avail">Available</span>
    <button class="save" data-action="save" data-id="${c.id}" aria-pressed="${Store.isSaved(c.id)}" aria-label="Save ${esc(c.title)}">${ICON.heart}</button></div>
  </div></article>`;
}
const crumbs = list => `<nav class="crumbs" aria-label="Breadcrumb"><ol>${list.map(([t, h], i) => i === list.length - 1 ? `<li aria-current="page">${esc(t)}</li>` : `<li><a href="${h}">${esc(t)}</a></li>`).join('')}</ol></nav>`;
const resList = (c, items) => !items?.length ? '' : `<ul class="res">${items.map(r => `<li><a href="${esc(url(c, r.href))}" ${r.type === 'pdf' ? 'target="_blank" rel="noopener"' : ''}><span class="badge ${esc(r.type)}">${esc((r.type || 'file').toUpperCase())}</span><span><b>${esc(r.title)}</b>${r.summary ? `<small>${esc(r.summary)}</small>` : ''}</span></a></li>`).join('')}</ul>`;

/* ---------------- home ---------------- */
function viewHome() {
  const P = App.cat.platform, cs = App.order.map(id => App.courses[id]);
  const totalVid = cs.reduce((n, c) => n + stats(c).videos, 0), totalMin = cs.reduce((n, c) => n + (c.videoMinutes || 0), 0);
  const featured = [...cs].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const mine = Store.enrolledIds().map(id => App.courses[id]).filter(Boolean);
  const cats = App.cat.categories.map(k => ({ ...k, n: cs.filter(c => c.category === k.id).length }));
  return { title: 'Kalam CX Academy', html: `
<section class="hero"><div class="wrap">
 <p class="eyebrow">Kalam CX Academy</p>
 <h1 tabindex="-1" data-focus>${esc(P.tagline)}</h1>
 <p class="lead">${esc(P.intro)}</p>
 <form class="bigsearch" role="search" data-action="search">
  <label for="hq" class="sr">Search courses and lessons</label>
  <input id="hq" name="q" type="search" placeholder="What do you want to learn? Try “VLOOKUP” or “PivotTable”">
  <button class="btn">Search</button>
 </form>
 <ul class="stats" aria-label="Academy at a glance"><li><b>${cs.length}</b> courses</li><li><b>${totalVid}</b> video lessons</li><li><b>${(totalMin / 60).toFixed(1)}</b> hours of trainer video</li><li><b>Free</b> for every learner</li></ul>
</div></section>
${mine.length ? `<section class="band"><div class="wrap"><div class="head"><h2>Continue learning</h2><a class="link" href="#/my">My learning ${ICON.chev}</a></div><div class="grid">${mine.map(card).join('')}</div></div></section>` : ''}
<section class="band"><div class="wrap">
 <div class="head"><h2>Featured courses</h2><a class="link" href="#/courses">See all courses ${ICON.chev}</a></div>
 <div class="grid">${featured.map(card).join('')}</div>
</div></section>
<section class="band gray"><div class="wrap">
 <h2>Browse by category</h2>
 <div class="cats">${cats.map(k => `<a class="cat" href="#/courses?cat=${k.id}"><b>${esc(k.name)}</b><span>${esc(k.blurb)}</span><small>${k.n} course${k.n === 1 ? '' : 's'}</small></a>`).join('')}
  <div class="cat soon" aria-disabled="true"><b>More subjects</b><span>New categories appear here as courses are added.</span><small>Coming soon</small></div></div>
</div></section>
<section class="band"><div class="wrap two">
 <div><h2>Who it's for</h2><ul class="ticks">${P.audience.map(x => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join('')}</ul></div>
 <div><h2>How to get started</h2><ol class="steps"><li><b>Pick a course</b><span>Search or browse the catalog. Every course is free.</span></li><li><b>Learn in short lessons</b><span>Videos of 4–17 minutes, with slides and files beside them.</span></li><li><b>Practise and test</b><span>Do the Excel tasks, then a self-marking test for each section.</span></li></ol>
 <a class="btn" href="#/courses">Start learning</a></div>
</div></section>
<section class="band dark"><div class="wrap two">
 <div><h2>A public pilot</h2><p>${esc(P.mode)}</p></div>
 <div class="pilot"><p><b>Works now:</b> courses, video lessons, practice files, quizzes, notes, saved courses and progress on this device.</p><p><b>Coming with accounts:</b> sign-in, progress across devices, verified certificates, reviews and instructor tools.</p><a class="link" href="#/about">How the pilot works ${ICON.chev}</a></div>
</div></section>` };
}

/* ---------------- catalog + search ---------------- */
const FILTERS = [
  ['cat', 'Category', () => App.cat.categories.map(k => [k.id, k.name])],
  ['level', 'Level', () => [['Beginner', 'Beginner'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']]],
  ['lang', 'Language', () => [...new Set(App.order.map(id => App.courses[id].language))].map(l => [l, { ar: 'Arabic', en: 'English' }[l] || l])],
  ['dur', 'Video length', () => [['short', 'Under 2 hours'], ['mid', '2 to 6 hours'], ['long', 'Over 6 hours']]],
  ['price', 'Price', () => [['free', 'Free'], ['paid', 'Paid']]]
];
function matchCourse(c, q) {
  const words = (q.get('q') || '').toLowerCase().split(/\s+/).filter(Boolean);
  const hay = [c.title, c.subtitle, ...(c.description || []), ...(c.outcomes || []), App.cats[c.category]?.name, ...instr(c).map(i => i.name), ...lessonsOf(c).map(l => l.title + ' ' + (l.by || ''))].join(' ').toLowerCase();
  if (words.some(w => !hay.includes(w))) return false;
  if (q.get('cat') && c.category !== q.get('cat')) return false;
  if (q.get('level') && c.level !== q.get('level')) return false;
  if (q.get('lang') && c.language !== q.get('lang')) return false;
  if (q.get('price') && (q.get('price') === 'free') !== !c.price) return false;
  const d = q.get('dur'), m = c.videoMinutes;
  if (d && (!m || (d === 'short' && m >= 120) || (d === 'mid' && (m < 120 || m > 360)) || (d === 'long' && m <= 360))) return false;
  return true;
}
function lessonHits(q) {
  const words = (q.get('q') || '').toLowerCase().split(/\s+/).filter(Boolean); if (!words.length) return [];
  return App.order.flatMap(id => lessonsOf(App.courses[id]).map(l => ({ c: App.courses[id], l })))
    .filter(({ l }) => words.every(w => `${l.title} ${l.summary || ''} ${l.by || ''} ${l.section.title}`.toLowerCase().includes(w))).slice(0, 30);
}
function catalogResults(q) {
  const list = App.order.map(id => App.courses[id]).filter(c => matchCourse(c, q)), hits = lessonHits(q), term = q.get('q');
  return `<h2 class="count" id="count">${list.length} course${list.length === 1 ? '' : 's'}${term ? ` for “${esc(term)}”` : ''}</h2>
  ${list.length ? `<div class="grid">${list.map(card).join('')}</div>` : `<div class="empty"><p>No courses match these filters.</p><button class="btn ghost" data-action="clear-filters">Clear filters</button></div>`}
  ${hits.length ? `<h2 class="sub2">Lessons matching “${esc(term)}”</h2><ul class="hits">${hits.map(({ c, l }) => `<li><a href="#/learn/${c.id}/${l.id}"><span class="ico">${ICON[l.type] || ICON.video}</span><span><b>${esc(l.title)}</b><small>${esc(c.title)} · ${esc(l.section.title)}${l.minutes ? ` · ${l.minutes} min` : ''}</small></span></a></li>`).join('')}</ul>` : ''}`;
}
function viewCatalog(q) {
  const sel = ([k, label, opts]) => `<div class="f"><label for="f-${k}">${label}</label><select id="f-${k}" data-filter="${k}"><option value="">Any</option>${opts().map(([v, t]) => `<option value="${esc(v)}" ${q.get(k) === v ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>`;
  return { title: 'All courses', html: `
<section class="wrap pad">
 ${crumbs([['Home', '#/'], ['Courses', '']])}
 <h1 tabindex="-1" data-focus>All courses</h1>
 <form class="filters" role="search" aria-label="Filter courses" data-action="filter">
  <div class="f fq"><label for="f-q">Search</label><input id="f-q" type="search" data-filter="q" value="${esc(q.get('q') || '')}" placeholder="Course, skill or lesson"></div>
  ${FILTERS.map(sel).join('')}
 </form>
 <div id="results" aria-live="polite">${catalogResults(q)}</div>
</section>` };
}
function applyFilters() {
  const p = new URLSearchParams();
  $$('[data-filter]').forEach(el => { if (el.value.trim()) p.set(el.dataset.filter, el.value.trim()); });
  const h = '#/courses' + (p.toString() ? '?' + p : '');
  history.replaceState(null, '', h); $('#results').innerHTML = catalogResults(p);
}

/* ---------------- course detail ---------------- */
function viewCourse(c) {
  const st = stats(c), ins = instr(c), enrolled = Store.isEnrolled(c.id);
  const next = Store.last(c.id) || st.all.find(l => !Store.isDone(c.id, l.id))?.id || st.all[0]?.id;
  const cta = enrolled ? `<a class="btn big" href="#/learn/${c.id}/${next}">${st.done ? 'Continue learning' : 'Start learning'}</a>` : `<button class="btn big" data-action="enroll" data-id="${c.id}">Enroll for free</button>`;
  const lessonRow = l => `<li><a href="#/learn/${c.id}/${l.id}"><span class="ico">${ICON[l.type] || ICON.video}</span><span class="lt">${esc(l.title)}${l.by ? `<small>${esc(l.by)}</small>` : ''}</span><span class="lm">${l.type === 'quiz' ? `${l.questions.length} questions` : l.minutes ? `${l.minutes} min` : ''}</span>${Store.isDone(c.id, l.id) ? `<span class="tick" title="Completed">${ICON.check}<span class="sr">Completed</span></span>` : ''}</a></li>`;
  const rel = (c.related || []).map(id => App.courses[id]).filter(Boolean);
  return { title: c.title, html: `
<section class="chero"><div class="wrap chgrid">
 <div class="chtext">
  ${crumbs([['Courses', '#/courses'], [App.cats[c.category]?.name || 'Course', `#/courses?cat=${c.category}`], [c.title, '']])}
  <h1 tabindex="-1" data-focus>${esc(c.title)}</h1>
  <p class="lead">${esc(c.subtitle)}</p>
  <p class="by">${c.type === 'collection' ? 'Curated from' : 'Taught by'} ${ins.map(i => `<a href="#/instructor/${i.id}">${esc(i.name)}</a>`).join(', ')}</p>
  <ul class="chips" aria-label="Course details"><li>${esc(c.levelRange || c.level)}</li><li>${esc(durationText(c))}</li><li>${esc(c.languageLabel)}</li><li>Updated ${esc(c.updated)}</li></ul>
 </div>
 <aside class="buy" aria-label="Enrollment">
  ${cover(c, 'buycover')}
  <div class="buyin">
   <p class="bigprice">${priceText(c)}</p>
   ${cta}
   <button class="btn ghost" data-action="save" data-id="${c.id}" aria-pressed="${Store.isSaved(c.id)}">${Store.isSaved(c.id) ? 'Saved' : 'Save for later'}</button>
   ${st.done ? `<div class="pbar" role="progressbar" aria-label="Your progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.pct}"><i style="width:${st.pct}%"></i></div><p class="ptext">${st.pct}% complete on this device</p>` : `<p class="fine">Free. Your progress is saved in this browser.</p>`}
   <h2 class="h4">This course includes</h2>
   <ul class="incl"><li>${st.videos} video lessons${c.videoMinutes ? ` (${durationText(c)})` : ''}</li>${st.quizzes ? `<li>${st.quizzes} self-marking tests</li>` : ''}${st.exams ? `<li>A practical final exam</li>` : ''}${(c.resources || []).length ? `<li>${c.resources.length} downloadable files and guides</li>` : ''}<li class="muted">${ICON.lock} Certificate: coming with learner accounts</li></ul>
  </div>
 </aside>
</div></section>
<div class="wrap cdgrid">
 <div class="cdmain">
  <section class="box"><h2>What you'll learn</h2><ul class="ticks two">${(c.outcomes || []).map(x => `<li>${ICON.check}<span>${esc(x)}</span></li>`).join('')}</ul></section>
  <section><h2>Course content</h2><p class="muted">${c.sections.length} sections · ${st.items} items · ${esc(durationText(c))}</p>
   <div class="curr">${c.sections.map((sec, i) => `<details ${i === 0 ? 'open' : ''}><summary><span><b>${esc(sec.title)}</b><small>${sec.lessons.length} items${sec.lessons.some(l => l.minutes) ? ` · ${sec.lessons.reduce((n, l) => n + (l.minutes || 0), 0)} min` : ''}</small></span></summary>
    ${sec.note ? `<p class="secnote">${esc(sec.note)}</p>` : ''}<ul class="lessons">${sec.lessons.map(lessonRow).join('')}</ul></details>`).join('')}</div>
  </section>
  <section><h2>Requirements</h2><ul class="dots">${(c.requirements || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>
  <section><h2>Description</h2>${(c.description || []).map(p => `<p>${esc(p)}</p>`).join('')}<h3>Who this course is for</h3><ul class="dots">${(c.audience || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>
  ${(c.resources || []).length ? `<section id="resources"><h2>Files and guides</h2>${resList(c, c.resources)}</section>` : ''}
  <section><h2>${ins.length > 1 ? 'Instructors' : 'Instructor'}</h2>${ins.map(i => `<div class="inst"><span class="avatar" aria-hidden="true">${esc(i.name.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span><div><h3><a href="#/instructor/${i.id}">${esc(i.name)}</a></h3><p class="muted">${esc(i.title)}</p><p>${esc(i.bio)}</p></div></div>`).join('')}</section>
  <section><h2>Reviews</h2><div class="empty"><p><b>No reviews yet.</b> Ratings and reviews open when learner accounts are available, so every review comes from someone who really took the course.</p></div></section>
  ${rel.length ? `<section><h2>Learners also take</h2><div class="grid">${rel.map(card).join('')}</div></section>` : ''}
 </div>
</div>` };
}

/* ---------------- course player ---------------- */
function viewPlayer(c, lid) {
  const all = lessonsOf(c); const i = Math.max(0, all.findIndex(l => l.id === lid)); const L = all[i];
  if (!lid || lid !== L.id) history.replaceState(null, '', `#/learn/${c.id}/${L.id}`);
  Store.enroll(c.id); Store.setLast(c.id, L.id);
  const prev = all[i - 1], next = all[i + 1], st = stats(c);
  let body = '';
  if (L.type === 'video') body = `<div class="screen"><video id="vid" controls playsinline preload="metadata" poster="${esc(url(c, L.poster))}" src="${esc(url(c, L.src))}" aria-label="Video: ${esc(L.title)}"></video></div>
    <p class="vnote">${esc(c.languageLabel)}. Captions aren't available yet.</p>`;
  else if (L.type === 'youtube') body = `<div class="screen yt" id="ytbox"><button class="ytstart" data-action="yt" data-yt="${esc(L.yt)}" data-title="${esc(L.title)}"><img src="https://i.ytimg.com/vi/${esc(L.yt)}/hqdefault.jpg" alt=""><span class="play">${ICON.play}</span><span class="sr">Play “${esc(L.title)}” from YouTube</span></button></div>
    <p class="vnote">Plays from YouTube. Video by ${esc(L.by)}. <a href="https://www.youtube.com/watch?v=${esc(L.yt)}" target="_blank" rel="noopener">Open on YouTube</a></p>`;
  else if (L.type === 'practice') body = `<div class="panel"><h2>Practice in Excel</h2><ol class="steps2">${L.body.map(x => `<li>${esc(x)}</li>`).join('')}</ol>${resList(c, L.resources)}</div>`;
  else if (L.type === 'quiz') body = quizHtml(c, L);
  else if (L.type === 'exam') body = `<div class="panel exam">${L.html}<div class="row"><button class="btn ghost" data-action="key" aria-expanded="false" aria-controls="key">Show the answer key</button></div><div id="key" class="examkey" hidden>${L.keyHtml}</div></div>`;
  const doneBtn = L.type !== 'quiz' ? `<button class="btn ghost" data-action="done" data-c="${c.id}" data-l="${L.id}" aria-pressed="${Store.isDone(c.id, L.id)}">${Store.isDone(c.id, L.id) ? `${ICON.check} Completed` : 'Mark as complete'}</button>` : '';
  const side = c.sections.map(sec => {
    const n = sec.lessons.filter(l => Store.isDone(c.id, l.id)).length;
    return `<details ${sec.lessons.some(l => l.id === L.id) ? 'open' : ''}><summary><span><b>${esc(sec.title)}</b><small>${n} / ${sec.lessons.length} done</small></span></summary>
   <ol>${sec.lessons.map(l => `<li><a href="#/learn/${c.id}/${l.id}" ${l.id === L.id ? 'aria-current="page"' : ''} data-l="${l.id}"><span class="st ${Store.isDone(c.id, l.id) ? 'on' : ''}">${Store.isDone(c.id, l.id) ? ICON.check + '<span class="sr">Completed: </span>' : ''}</span><span class="lt">${esc(l.title)}<small>${esc(l.kind || { practice: 'Practice', quiz: 'Section test', exam: 'Final exam', youtube: l.by }[l.type] || '')}${l.minutes ? ` · ${l.minutes} min` : ''}</small></span></a></li>`).join('')}</ol></details>`;
  }).join('');
  return { title: `${L.title} · ${c.title}`, html: `
<div class="pbarhead"><div class="wrap ph"><a class="link" href="#/course/${c.id}">${ICON.chev.replace('class="chev"', 'class="chev back"')} ${esc(c.title)}</a>
 <div class="phprog"><span id="pct">${st.pct}% complete</span><div class="pbar" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.pct}"><i style="width:${st.pct}%"></i></div></div></div></div>
<div class="wrap player">
 <div class="pmain">
  ${body}
  <div class="ltitle"><p class="eyebrow">${esc(L.section.title)}${L.kind ? ` · ${esc(L.kind)}` : ''}</p><h1 tabindex="-1" data-focus>${esc(L.title)}</h1></div>
  <div class="row">${doneBtn}${L.type === 'video' ? `<label class="auto"><input type="checkbox" id="autonext" ${localStorage.getItem('kalam.autonext') === '0' ? '' : 'checked'}> Play the next video automatically</label>` : ''}</div>
  ${L.section.note && L.section.lessons[0].id === L.id ? `<p class="secnote">${esc(L.section.note)}</p>` : ''}
  ${L.summary ? `<section class="pblock"><h2>About this lesson</h2><p>${esc(L.summary)}</p></section>` : ''}
  ${L.resources?.length && L.type !== 'practice' ? `<section class="pblock"><h2>Resources</h2>${resList(c, L.resources)}</section>` : ''}
  <section class="pblock"><h2><label for="note">My notes</label></h2><textarea id="note" rows="4" data-c="${c.id}" data-l="${L.id}" placeholder="Write what you want to remember from this lesson">${esc(Store.note(c.id, L.id))}</textarea><p class="fine" id="notestat" aria-live="polite">Saved on this device only.</p></section>
  <nav class="pn" aria-label="Lesson navigation">${prev ? `<a class="btn ghost" href="#/learn/${c.id}/${prev.id}" rel="prev"><span class="sr">Previous lesson: </span>← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/learn/${c.id}/${next.id}" rel="next"><span class="sr">Next lesson: </span>${esc(next.title)} →</a>` : `<a class="btn" href="#/my">Finish: go to My learning</a>`}</nav>
 </div>
 <aside class="pside" aria-label="Course content"><h2 class="h4">Course content</h2>${side}</aside>
</div>`, after() { bindPlayer(c, L, next); } };
}
function bindPlayer(c, L, next) {
  const v = $('#vid');
  if (v) {
    const mark = () => { if (!Store.isDone(c.id, L.id)) { Store.setDone(c.id, L.id); refreshDone(c, L); } };
    v.addEventListener('timeupdate', () => { if (v.duration && v.currentTime / v.duration > 0.9) mark(); });
    v.addEventListener('ended', () => { mark(); const a = $('#autonext'); if (a && a.checked && next && (next.type === 'video')) { App.autoplayNext = true; location.hash = `#/learn/${c.id}/${next.id}`; } });
    const a = $('#autonext'); if (a) a.addEventListener('change', () => { try { localStorage.setItem('kalam.autonext', a.checked ? '1' : '0'); } catch (e) {} });
    if (App.autoplayNext) { App.autoplayNext = false; v.play().catch(() => {}); }
  }
  const t = $('#note'); let tm;
  if (t) t.addEventListener('input', () => { clearTimeout(tm); tm = setTimeout(() => { Store.setNote(t.dataset.c, t.dataset.l, t.value.trim()); $('#notestat').textContent = 'Saved on this device only.'; }, 400); $('#notestat').textContent = 'Saving…'; });
}
function refreshDone(c, L) {
  const st = stats(c); $('#pct') && ($('#pct').textContent = `${st.pct}% complete`);
  const pb = $('.pbarhead .pbar'); if (pb) { pb.setAttribute('aria-valuenow', st.pct); pb.firstElementChild.style.width = st.pct + '%'; }
  const a = $(`.pside a[data-l="${L.id}"] .st`); if (a) { a.classList.toggle('on', Store.isDone(c.id, L.id)); a.innerHTML = Store.isDone(c.id, L.id) ? ICON.check + '<span class="sr">Completed: </span>' : ''; }
  const b = $('[data-action="done"]'); if (b) { const d = Store.isDone(c.id, L.id); b.setAttribute('aria-pressed', d); b.innerHTML = d ? `${ICON.check} Completed` : 'Mark as complete'; }
}

/* ---------------- quiz ---------------- */
function quizState(c, L) {
  const ans = L.questions.map(q => Store.answer(c.id, q.id, q.rev));
  const n = ans.filter(a => a !== undefined).length, ok = L.questions.filter((q, i) => ans[i] === q.a).length;
  return { ans, n, ok, total: L.questions.length };
}
function scoreHtml(c, L) {
  const s = quizState(c, L), pct = Math.round(100 * s.ok / s.total);
  const msg = s.n === 0 ? 'Answer the first question to begin.' : s.n < s.total ? `${s.ok} of ${s.n} correct · ${s.total - s.n} to go` : s.ok >= L.pass ? `${s.ok} / ${s.total}: passed` : `${s.ok} / ${s.total}: the pass mark is ${L.pass}. Review the lessons and try again.`;
  return `<div class="ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="trk"/><circle cx="18" cy="18" r="15.9" class="val" style="stroke-dasharray:${pct} 100"/></svg><b>${s.ok}</b></div><p><b class="${s.n === s.total ? (s.ok >= L.pass ? 'pass' : 'fail') : ''}">${msg}</b><button class="linkbtn" data-action="reset-quiz" data-c="${c.id}" data-l="${L.id}">Start over</button></p>`;
}
function qHtml(c, L, q, i) {
  const a = Store.answer(c.id, q.id, q.rev), answered = a !== undefined;
  return `<fieldset class="q" id="q-${q.id}"><legend><span class="qn">Question ${i + 1} of ${L.questions.length}</span><span class="qt">${esc(q.q)}</span></legend>
  <div class="opts">${q.o.map((o, j) => {
    const cls = answered ? (j === q.a ? 'ok' : j === a ? 'no' : '') : '';
    const tag = answered ? (j === q.a ? '<span class="sr"> (correct answer)</span>' : j === a ? '<span class="sr"> (your answer, incorrect)</span>' : '') : '';
    return `<button type="button" class="o ${cls}" data-action="answer" data-c="${c.id}" data-l="${L.id}" data-q="${q.id}" data-j="${j}" ${answered ? 'aria-disabled="true"' : ''}><span class="k" aria-hidden="true">${LETTERS[j]}</span><span>${esc(o)}${tag}</span></button>`;
  }).join('')}</div>
  ${answered ? `<p class="ex" tabindex="-1"><b>${a === q.a ? 'Correct.' : 'Not quite.'}</b> ${esc(q.e)}</p>` : ''}</fieldset>`;
}
function quizHtml(c, L) {
  return `<div class="panel quiz"><h2>Section test</h2><p>${L.questions.length} questions · pass mark ${L.pass}. Each answer is marked straight away, with the reason.</p>${L.note ? `<p class="secnote">${esc(L.note)}</p>` : ''}
  <div class="score" id="score" role="status" aria-live="polite">${scoreHtml(c, L)}</div>
  ${L.questions.map((q, i) => qHtml(c, L, q, i)).join('')}${resList(c, L.resources)}</div>`;
}
function onAnswer(btn) {
  if (btn.getAttribute('aria-disabled') === 'true') return;
  const c = App.courses[btn.dataset.c], L = lessonsOf(c).find(l => l.id === btn.dataset.l), q = L.questions.find(x => x.id === btn.dataset.q), i = L.questions.indexOf(q);
  Store.setAnswer(c.id, q.id, q.rev, +btn.dataset.j);
  const s = quizState(c, L); if (s.n === s.total) Store.setDone(c.id, L.id);
  $(`#q-${q.id}`).outerHTML = qHtml(c, L, q, i); $('#score').innerHTML = scoreHtml(c, L); refreshDone(c, L);
  $(`#q-${q.id} .ex`).focus();
}

/* ---------------- my learning ---------------- */
function viewMy() {
  const en = Store.enrolledIds().map(id => App.courses[id]).filter(Boolean), sv = Store.savedIds().map(id => App.courses[id]).filter(Boolean);
  const done = en.filter(c => stats(c).pct === 100);
  const row = c => { const st = stats(c), nx = Store.last(c.id) || st.all[0].id; return `<li class="myrow">${cover(c, 'mini')}<div><h3><a href="#/course/${c.id}">${esc(c.title)}</a></h3><div class="pbar" role="progressbar" aria-label="Progress in ${esc(c.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${st.pct}"><i style="width:${st.pct}%"></i></div><p class="ptext">${st.done} of ${st.items} items · ${st.pct}%</p></div><a class="btn" href="#/learn/${c.id}/${nx}">${st.done ? 'Continue' : 'Start'}</a></li>`; };
  return { title: 'My learning', html: `
<section class="wrap pad">
 ${crumbs([['Home', '#/'], ['My learning', '']])}
 <h1 tabindex="-1" data-focus>My learning</h1>
 <p class="notice">${ICON.lock}<span>Your learning is saved <b>only in this browser on this device</b>. Sign-in and progress across devices are planned for when learner accounts are available.</span></p>
 <h2>In progress</h2>${en.length ? `<ul class="mylist">${en.map(row).join('')}</ul>` : `<div class="empty"><p>You haven't started a course yet.</p><a class="btn" href="#/courses">Browse courses</a></div>`}
 <h2>Saved for later</h2>${sv.length ? `<div class="grid">${sv.map(card).join('')}</div>` : `<div class="empty"><p>Tap the heart on any course to save it here.</p></div>`}
 <h2>Certificates</h2>
 <div class="certs">
  <div class="cert preview" aria-label="Certificate design preview"><p class="eyebrow">Design preview</p><p class="cname">Certificate of completion</p><p class="muted">Your name · Course title · Date · Verification link</p></div>
  <div><p><b>Verified certificates are coming with learner accounts.</b> A certificate needs a confirmed identity and a record that can be checked, which this static pilot can't provide yet.</p>
  ${done.length ? `<p>Completed on this device: ${done.map(c => `<b>${esc(c.title)}</b>`).join(', ')}.</p>` : '<p class="muted">Finish every item in a course to see it listed here.</p>'}</div>
 </div>
 <h2>Your data</h2><p class="muted">Clearing removes your progress, answers, notes and saved courses from this browser.</p>
 <div id="clearbox"><button class="btn ghost" data-action="clear-ask">Clear my data on this device</button></div>
</section>` };
}

/* ---------------- instructor, studio, about ---------------- */
function viewInstructor(i) {
  const cs = App.order.map(id => App.courses[id]).filter(c => (c.instructors || []).includes(i.id));
  return { title: i.name, html: `<section class="wrap pad narrow2">${crumbs([['Home', '#/'], ['Instructors', ''], [i.name, '']])}
  <div class="iprof"><span class="avatar big" aria-hidden="true">${esc(i.name.split(' ').map(w => w[0]).slice(0, 2).join(''))}</span><div><p class="eyebrow">${i.external ? 'Curated creators' : 'Instructor'}</p><h1 tabindex="-1" data-focus>${esc(i.name)}</h1><p class="lead">${esc(i.title)}</p></div></div>
  <p>${esc(i.bio)}</p><h2>Courses</h2><div class="grid">${cs.map(card).join('')}</div></section>` };
}
function viewStudio() {
  const rows = App.order.map(id => { const c = App.courses[id], st = stats(c); return `<tr><th scope="row">${esc(c.title)}</th><td>${c.sections.length}</td><td>${st.items}</td><td>${st.videos}</td><td>${st.quizzes + st.exams}</td><td>${c.videoMinutes ? Math.round(c.videoMinutes) + ' min' : '—'}</td><td><span class="pill ok">Published</span></td><td><button class="linkbtn" aria-disabled="true" title="Needs accounts and a backend">Edit</button></td></tr>`; }).join('');
  return { title: 'For instructors', html: `<section class="wrap pad">
 ${crumbs([['Home', '#/'], ['For instructors', '']])}
 <h1 tabindex="-1" data-focus>Instructor studio</h1>
 <p class="notice warn">${ICON.lock}<span><b>Design preview.</b> Editing courses in the browser needs instructor accounts and a backend. Nothing on this page saves. Courses are added today by the L&amp;D team with the Academy Builder (see below).</span></p>
 <div class="head"><h2>Your courses</h2><button class="btn" aria-disabled="true" title="Needs accounts and a backend">New course</button></div>
 <div class="tablewrap"><table><caption class="sr">Published courses</caption><thead><tr><th scope="col">Course</th><th scope="col">Sections</th><th scope="col">Items</th><th scope="col">Videos</th><th scope="col">Assessments</th><th scope="col">Video time</th><th scope="col">Status</th><th scope="col"><span class="sr">Actions</span></th></tr></thead><tbody>${rows}</tbody></table></div>
 <h2>How every course is structured</h2>
 <ol class="model"><li><b>Course</b><span>Title, category, level, language, price, instructors, outcomes, requirements</span></li><li><b>Sections</b><span>One topic each, in order</span></li><li><b>Lessons</b><span>Video, YouTube video, practice task, section test or practical exam</span></li><li><b>Resources and assessments</b><span>Slides, workbooks and guides; quizzes with explanations; a final exam</span></li></ol>
 <h2>Adding a course today</h2>
 <ol class="steps"><li><b>Prepare the content</b><span>Recordings or videos, slides, practice files and test questions.</span></li><li><b>Write the course data</b><span>One <code>course.json</code> per course, following the structure above, plus one line in <code>data/catalog.json</code>.</span></li><li><b>Publish</b><span>Upload the files and data. The platform's code doesn't change: the new course appears in search, the catalog and its own pages.</span></li></ol>
 <h2>Planned for instructors (needs a backend)</h2>
 <ul class="dots"><li>Sign in and manage your own courses</li><li>Upload videos to a media service, edit lessons and quizzes in the browser</li><li>See enrollments, completion and quiz results</li><li>Reply to learner questions and reviews</li></ul>
</section>` };
}
function viewAbout() {
  const rows = [['Course catalog, search and filters', 'now'], ['Course pages and curriculum', 'now'], ['Video lessons, practice files, slides', 'now'], ['Self-marking section tests and practical exam', 'now'], ['Progress, notes and saved courses', 'now', 'This browser only'],
    ['Sign-in and learner accounts', 'later', 'Identity provider (for example Microsoft Entra ID for Kalam staff)'], ['Progress across devices', 'later', 'Backend API + database'], ['Verified certificates', 'later', 'Accounts + certificate records + verification page'],
    ['Reviews and ratings', 'later', 'Accounts + moderation'], ['Instructor course editing', 'later', 'Accounts with roles + content API + media upload'], ['Private or paid courses', 'later', 'Access control; payments only through a payment provider, never in this site']];
  return { title: 'How it works', html: `<section class="wrap pad narrow2">
 ${crumbs([['Home', '#/'], ['How it works', '']])}
 <h1 tabindex="-1" data-focus>How the pilot works</h1>
 <p class="lead">Kalam CX Academy is a public pilot hosted as a static website. That keeps it fast, free and simple, and it also sets clear limits.</p>
 <div class="tablewrap"><table><caption>What works now and what needs a backend</caption><thead><tr><th scope="col">Feature</th><th scope="col">Status</th><th scope="col">Notes</th></tr></thead><tbody>
 ${rows.map(([f, s, n]) => `<tr><th scope="row">${esc(f)}</th><td><span class="pill ${s === 'now' ? 'ok' : 'later'}">${s === 'now' ? 'Works now' : 'Needs a backend'}</span></td><td>${esc(n || '')}</td></tr>`).join('')}</tbody></table></div>
 <h2>Your privacy</h2><p>The Academy has no sign-in and collects nothing. Progress, test answers, notes and saved courses are stored in your own browser and never leave your device. Clearing your browser data, or using another device, starts you fresh. You can also clear it from <a href="#/my">My learning</a>.</p>
 <h2>Who can see the courses</h2><p>The pilot is public: anyone with the link can open it, and search engines are asked not to list it. Don't put confidential or client data in a course while it's public.</p>
</section>` };
}

/* ---------------- global events ---------------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-action]'); if (!t) return;
  const act = t.dataset.action;
  if (act === 'save') { e.preventDefault(); const on = Store.toggleSave(t.dataset.id); t.setAttribute('aria-pressed', on); if (t.classList.contains('ghost')) t.textContent = on ? 'Saved' : 'Save for later'; announce(on ? 'Saved for later' : 'Removed from saved'); }
  else if (act === 'enroll') { Store.enroll(t.dataset.id); const c = App.courses[t.dataset.id]; location.hash = `#/learn/${c.id}/${lessonsOf(c)[0].id}`; }
  else if (act === 'answer') onAnswer(t);
  else if (act === 'reset-quiz') { const c = App.courses[t.dataset.c], L = lessonsOf(c).find(l => l.id === t.dataset.l); Store.resetAnswers(c.id, L.questions.map(q => q.id)); Store.setDone(c.id, L.id, false); route(); const f = $('.q'); if (f) f.querySelector('button').focus(); announce('Test cleared'); }
  else if (act === 'done') { const d = !Store.isDone(t.dataset.c, t.dataset.l); Store.setDone(t.dataset.c, t.dataset.l, d); const c = App.courses[t.dataset.c]; refreshDone(c, lessonsOf(c).find(l => l.id === t.dataset.l)); announce(d ? 'Marked as complete' : 'Marked as not complete'); }
  else if (act === 'key') { const k = $('#key'); k.hidden = !k.hidden; t.setAttribute('aria-expanded', !k.hidden); t.textContent = k.hidden ? 'Show the answer key' : 'Hide the answer key'; }
  else if (act === 'yt') { const box = $('#ytbox'); box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(t.dataset.yt)}?autoplay=1&rel=0" title="${esc(t.dataset.title)} (YouTube video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`; box.querySelector('iframe').focus(); }
  else if (act === 'clear-filters') { location.hash = '#/courses'; }
  else if (act === 'clear-ask') { $('#clearbox').innerHTML = `<p role="alert"><b>Clear all your Academy data from this browser?</b> This can't be undone.</p><div class="row"><button class="btn danger" data-action="clear-yes">Yes, clear it</button><button class="btn ghost" data-action="clear-no">Keep my data</button></div>`; $('#clearbox .danger').focus(); }
  else if (act === 'clear-yes') { Store.clearAll(); route(); announce('Your data was cleared from this browser'); }
  else if (act === 'clear-no') { $('#clearbox').innerHTML = `<button class="btn ghost" data-action="clear-ask">Clear my data on this device</button>`; $('#clearbox button').focus(); }
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'gsearch' || f.dataset.action === 'search') { e.preventDefault(); const v = f.querySelector('input').value.trim(); location.hash = '#/courses' + (v ? '?q=' + encodeURIComponent(v) : ''); }
  else if (f.dataset.action === 'filter') { e.preventDefault(); applyFilters(); }
});
document.addEventListener('change', e => { if (e.target.matches('select[data-filter]')) applyFilters(); });
let ft; document.addEventListener('input', e => { if (e.target.matches('input[data-filter]')) { clearTimeout(ft); ft = setTimeout(applyFilters, 250); } });
const menu = $('#menu'), nav = $('#nav');
function closeMenu() { nav.classList.remove('open'); menu.setAttribute('aria-expanded', 'false'); }
menu.addEventListener('click', () => { const o = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', o); if (o) nav.querySelector('a').focus(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('open')) { closeMenu(); menu.focus(); } });
$('#skip').addEventListener('click', e => { e.preventDefault(); const f = $('[data-focus]') || $('#main'); f.focus(); });
boot();
