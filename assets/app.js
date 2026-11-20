/* Kalam CX Academy: a multi-course learning platform in a simple, Apple-style look.
   Learner journey: Home › Explore or Categories › Course overview › Learning view (player + curriculum) › Final assessment.
   Content lives in data only: data/catalog.json lists categories (topics), instructors and courses; each course is
   courses/<id>/course.json (course → modules → lessons → resources / tests). Adding a course = adding data, no code changes.
   See CONTENT.md in the builder repo. There are no accounts: learner progress stays in this browser (localStorage). */
'use strict';
document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CHEV = '<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" opacity=".12"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ICON = {
  video: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 8.5v7l5.5-3.5z" fill="currentColor"/></svg>',
  practice: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.8-.9 1.4v.3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="16.8" r="1" fill="currentColor"/></svg>',
  exam: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>'
};
ICON.youtube = ICON.embed = ICON.video;
ICON.reading = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1v13c-3-1-6-1-9 1-3-2-6-2-9-1z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 6.5v13" stroke="currentColor" stroke-width="1.6"/></svg>';
const App = { cat: null, courses: {}, entries: {}, order: [], people: {}, topics: [] };
const RESERVED = ['explore', 'categories', 'my', 'trainings', 'topics'];

/* ---------- progress (this browser only) ---------- */
const Store = (() => {
  const KEY = 'kalam.academy.v2'; let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!s || s.v !== 2) s = { v: 2, courses: {} };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const C = id => s.courses[id] || (s.courses[id] = { done: {}, answers: {} });
  return {
    isDone: (c, l) => !!C(c).done[l],
    setDone(c, l) { if (!C(c).done[l]) { C(c).done[l] = Date.now(); C(c).at = Date.now(); save(); } },
    unsetDone(c, l) { delete C(c).done[l]; save(); },
    answer(c, q, rev) { const a = C(c).answers[q]; return a && a.r === (rev || 1) ? a.c : undefined; },
    setAnswer(c, q, rev, v) { C(c).answers[q] = { c: v, r: rev || 1 }; C(c).at = Date.now(); save(); },
    reset(c, qs) { qs.forEach(q => delete C(c).answers[q]); save(); },
    /* where the learner was last: powers "Resume" and "Continue learning" */
    visit(c, sec, lesson) { const x = C(c); x.last = { s: sec, l: lesson || '' }; x.at = Date.now(); save(); },
    last: c => C(c).last || null, at: c => C(c).at || Math.max(0, ...Object.values(C(c).done).map(Number)),
    started: c => !!(s.courses[c] && (s.courses[c].last || Object.keys(s.courses[c].done).length || Object.keys(s.courses[c].answers).length)),
    /* merge progress saved by the earlier one-course Excel site (key "kalamAcademy"); safe to run every visit */
    mergeLegacy(course) {
      if (course.id !== 'excel') return;
      let old = null; try { old = JSON.parse(localStorage.getItem('kalamAcademy') || 'null'); } catch (e) {}
      if (!old) return;
      Object.entries(old.w || {}).forEach(([n, list]) => {
        const sec = course.sections.find(x => x.id === 's' + n); if (!sec) return;
        const vs = sec.lessons.filter(l => l.type === 'video');
        (list || []).forEach(i => { if (vs[i] && !C('excel').done[vs[i].id]) C('excel').done[vs[i].id] = 1; });
      });
      Object.entries(old.q || {}).forEach(([name, ans]) => {
        const n = (name.match(/\d+/) || [])[0];
        Object.entries(ans || {}).forEach(([i, v]) => { const id = `s${n}-q${String(+i + 1).padStart(2, '0')}`; if (!C('excel').answers[id]) C('excel').answers[id] = { c: v, r: 1 }; });
      });
      save();
    }
  };
})();

/* ---------- data helpers ---------- */
const url = (c, p) => !p ? '' : /^(https?:)?\/\//.test(p) ? p : (c.base || '') + p;
const isVid = l => l.type === 'video' || l.type === 'youtube' || l.type === 'embed';
const vids = sec => sec.lessons.filter(isVid);
const quizOf = sec => sec.lessons.find(l => l.type === 'quiz');
const isExamSec = s => s.id === 'final' || (s.lessons.length && s.lessons.every(l => l.type === 'exam'));
const secsOf = c => c.sections.filter(s => !isExamSec(s));
const examOf = c => c.sections.find(isExamSec);
const people = c => (c.instructors || []).map(i => App.people[i]).filter(Boolean);
const word = c => (c.labels && c.labels.section) || 'Module';                  /* "Module", "Session", "Week"… */
const LANG = { ar: 'Arabic', en: 'English', fr: 'French' };
const langShort = c => c.languageShort || LANG[c.language] || c.languageLabel || '';
const hrs = m => m >= 60 ? `${+(m / 60).toFixed(1)} h` : `${m} min`;
const hours = m => m >= 60 ? `${+(m / 60).toFixed(1)} hours` : `${m} minutes`;
const free = c => !+(c.price || 0);
const topicId = c => App.entries[c.id]?.topic || c.category;
const topicOf = c => App.topics.find(t => t.id === topicId(c));
const extrasOf = c => App.order.map(id => App.courses[id]).filter(x => x.partOf === c.id);
/* video files: relative paths come from the site, or from "mediaBase" when videos move to another host */
const media = (c, p) => !p ? '' : /^(https?:)?\/\//.test(p) ? p : (c.mediaBase || App.cat.platform.mediaBase || '') + (c.base || '') + p;
/* players that are web pages (YouTube, Bunny or Cloudflare Stream, Vimeo…) play in an iframe */
const frameSrc = (L, auto) => L.type === 'youtube' ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(L.yt)}?rel=0${auto ? '&autoplay=1' : ''}` : L.type === 'embed' ? L.embed : '';
const thumbOf = (c, L) => L.type === 'youtube' ? `https://i.ytimg.com/vi/${esc(L.yt)}/hqdefault.jpg` : L.poster ? esc(media(c, L.poster)) : 'img/kalam-mark.png';
/* time: video minutes are measured; practice, test and exam minutes are the course's own estimates */
function timeOf(c) {
  const all = c.sections.flatMap(s => s.lessons), v = all.filter(isVid);
  const t = k => all.filter(l => l.type === k).reduce((a, l) => a + (+l.minutes || 0), 0);
  const video = v.reduce((a, l) => a + (+l.minutes || 0), 0), practice = t('practice'), tests = t('quiz'), exam = t('exam'), reading = t('reading');
  return { video, videos: v.length, practice, tests, exam, reading, readings: all.filter(l => l.type === 'reading').length, total: video + practice + tests + exam + reading,
    nPractice: all.filter(l => l.type === 'practice').length, nTests: all.filter(l => l.type === 'quiz').length, nExam: all.filter(l => l.type === 'exam').length };
}
/* files for a module: explicit "files" in course.json, else the older convention (first workbook, PDF titled "slides", test PDF) */
function filesOf(c, sec) {
  const f = sec.files || {}, pr = sec.lessons.find(l => l.type === 'practice'), q = quizOf(sec);
  const R = (pr && pr.resources) || [];
  const wb = f.workbook || (R.find(r => r.type === 'xlsx') || {}).href, sl = f.slides || (R.find(r => /slides/i.test(r.title)) || {}).href;
  const tp = f.testPdf || ((q && q.resources) || [])[0]?.href;
  return { workbook: wb && url(c, wb), slides: sl && url(c, sl), testPdf: tp && url(c, tp), practice: f.practice || pr?.body?.[0] };
}
/* the learning path: every lesson of every module in order, then the final assessment */
function path(c) {
  if (c._path) return c._path;
  const out = [];
  secsOf(c).forEach((s, i) => s.lessons.forEach(L => out.push({ L, sec: s, mi: i })));
  const ex = examOf(c); if (ex) ex.lessons.forEach(L => out.push({ L, sec: ex, mi: -1 }));
  return (c._path = out);
}
function passed(c, q) { const ok = q.questions.filter(x => Store.answer(c.id, x.id, x.rev) === x.a).length; return ok >= q.pass; }
const lessonDone = (c, L) => L.type === 'quiz' ? passed(c, L) : Store.isDone(c.id, L.id);
function progress(c) {
  const P = path(c), done = P.filter(x => lessonDone(c, x.L)).length, vs = P.filter(x => isVid(x.L));
  const qs = P.filter(x => x.L.type === 'quiz');
  const last = Store.last(c.id); let at = last && P.find(x => x.L.id === last.l) || (last && P.find(x => x.sec.id === last.s));
  if (!at) at = P.find(x => !lessonDone(c, x.L)) || P[0];
  return { done, total: P.length, pct: P.length ? Math.round(100 * done / P.length) : 0, started: Store.started(c.id),
    watched: vs.filter(x => Store.isDone(c.id, x.L.id)).length, videos: vs.length, pass: qs.filter(x => passed(c, x.L)).length, tests: qs.length,
    resume: at ? `#/${c.id}/learn/${at.L.id}` : `#/${c.id}`, at };
}
const bar = p => `<span class="pbar" role="img" aria-label="${p}% complete"><i style="width:${p}%"></i></span>`;
const modName = (c, x) => x.mi < 0 ? 'Final assessment' : `${word(c)} ${x.mi + 1} · ${x.sec.title}`;

async function boot() {
  try {
    App.cat = await (await fetch('data/catalog.json', { cache: 'no-cache' })).json();
    App.cat.instructors.forEach(p => (App.people[p.id] = p));
    App.topics = App.cat.topics || App.cat.categories || [];
    const list = await Promise.all(App.cat.courses.map(async r => {
      App.entries[r.id] = r;
      if (r.status === 'soon' || !r.data) return { id: r.id, soon: true, title: r.title, subtitle: r.subtitle, category: r.topic, level: r.level, cover: r.cover, sections: [] };
      try { const c = await (await fetch(r.data, { cache: 'no-cache' })).json(); c.base = c.base || r.data.replace(/course\.json$/, ''); if (r.partOf) c.partOf = r.partOf; return c; } catch (e) { return null; }
    }));
    list.filter(Boolean).forEach(c => { App.courses[c.id] = c; App.order.push(c.id); if (!c.soon) Store.mergeLegacy(c); });
  } catch (e) { $('#app').innerHTML = '<section class="band"><div class="in"><h1 class="display">The Academy couldn\'t load.</h1><p class="sub">Check your connection and reload the page.</p></div></section>'; return; }
  if (App.cat.platform && App.cat.platform.footer) $('#foot').textContent = App.cat.platform.footer;
  route();
}
/* courses shown in lists: live and planned, but not collections that belong to another course (Expert Picks = Excel's extra videos) */
const listed = () => App.order.map(id => App.courses[id]).filter(c => !c.partOf);
const live = () => listed().filter(c => !c.soon && c.type !== 'collection');

/* ---------- routes ----------
   #/  #/explore[?q=&topic=&level=&lang=&dur=&price=]  #/categories[/<id>]  #/my
   #/<course>  #/<course>/learn[/<lesson>]  #/<course>/resources  #/<course>/extras */
function legacy(h) {
  if (h === '' || h === '#' || h === '#home') return '#/';
  let m = h.match(/^#(session|test)-(\d)$/); if (m) return `#/excel/s${m[2]}${m[1] === 'test' ? '/test' : ''}`;
  if (h === '#exam') return '#/excel/exam'; if (h === '#library') return '#/excel/library'; if (h === '#experts') return '#/excel/extras';
  if ((m = h.match(/^#\/course\/([\w-]+)/))) return '#/' + m[1];
  if ((m = h.match(/^#\/learn\/([\w-]+)\/(s\d)-quiz/))) return `#/${m[1]}/${m[2]}/test`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/final-exam/))) return `#/${m[1]}/exam`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((s\d)-[\w-]+)/))) return `#/${m[1]}/${m[3]}/${m[2]}`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((e\d)-\d+)/))) return `#/${m[1]}`;
  if (/^#\/(courses|trainings)\/?$/.test(h)) return '#/explore';
  if ((m = h.match(/^#\/topics\/([\w-]+)/))) return `#/categories/${m[1]}`;
  if (/^#\/(studio|about|instructor)/.test(h)) return '#/';
  if ((m = h.match(/^#\/([\w-]+)\/?$/)) && App.courses[m[1]]?.partOf) return `#/${App.courses[m[1]].partOf}/extras`;
  /* course pages from the session layout → the learning view */
  if ((m = h.match(/^#\/([\w-]+)\/([\w-]+)(?:\/([\w-]+))?$/)) && App.courses[m[1]] && !App.courses[m[1]].soon) {
    const c = App.courses[m[1]], P = path(c);
    if (m[2] === 'exam') { const x = P.find(y => y.L.type === 'exam'); return x ? `#/${c.id}/learn/${x.L.id}` : `#/${c.id}`; }
    if (m[2] === 'library') return `#/${c.id}/resources`;
    const sec = secsOf(c).find(s => s.id === m[2]);
    if (sec) {
      const L = m[3] === 'test' ? quizOf(sec) : m[3] ? sec.lessons.find(l => l.id === m[3]) : sec.lessons[0];
      return `#/${c.id}/learn/${(L || sec.lessons[0]).id}`;
    }
  }
  return null;
}
let shown = null;   /* null = nothing drawn yet */
function route() {
  if (!App.cat) return;
  let fix, n = 0; while ((fix = legacy(location.hash)) && fix !== location.hash && n++ < 4) history.replaceState(null, '', fix);
  const [pth, qs] = location.hash.replace(/^#\/?/, '').split('?');
  const parts = pth.split('/').filter(Boolean).map(decodeURIComponent), Q = new URLSearchParams(qs || '');
  const c = RESERVED.includes(parts[0]) ? null : App.courses[parts[0]]; let v;
  if (!parts.length) v = home();
  else if (parts[0] === 'explore') v = explore(Q);
  else if (parts[0] === 'categories') v = parts[1] ? category(parts[1]) : categories();
  else if (parts[0] === 'my') v = myLearning();
  else if (!c) v = notFound();
  else if (c.soon) v = soonPage(c);
  else if (c.type === 'collection') v = grid(c);
  else if (!parts[1]) v = overview(c);
  else if (parts[1] === 'learn') v = learn(c, parts[2]);
  else if (parts[1] === 'resources') v = resources(c);
  else if (parts[1] === 'extras') v = extras(c);
  else v = notFound();
  const key = parts.slice(0, 2).join('/');
  if (key !== shown || !$('#app').firstElementChild || !v.update) {
    $('#app').innerHTML = v.html; v.after && v.after(); window.scrollTo({ top: 0, behavior: 'instant' });
    if (shown !== null) { const h = $('#app h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  } else v.update();
  shown = key;
  document.title = v.title === 'Kalam CX Academy' ? v.title : `${v.title} · Kalam CX Academy`;
  nav(parts[0] || '', c && !c.soon && c.type !== 'collection' ? c : null, parts[1], v.crumbs);
  reveal($('#app'));
}
addEventListener('hashchange', route);
/* main nav (Home · Explore courses · Categories · My learning) + a course bar inside a course: breadcrumb left, course pages right */
function nav(top, c, cur, crumbs) {
  const g = [['Home', '#/', top === ''], ['Courses', '#/explore', top === 'explore' || top === 'categories' || !!c], ['My learning', '#/my', top === 'my']];
  $('#nav').innerHTML = g.map(([t, h, on]) => `<a href="${h}"${on ? ' aria-current="page" class="on"' : ''}>${esc(t)}</a>`).join('');
  $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false');
  const ln = $('#lnav');
  if (!crumbs && !c) { ln.hidden = true; ln.innerHTML = ''; return; }
  const trail = crumbs || [];
  const links = c ? [['Overview', `#/${c.id}`, !cur], ['Learn', progress(c).resume, cur === 'learn'], ['Resources', `#/${c.id}/resources`, cur === 'resources'],
    ...(extrasOf(c).length ? [['Extra videos', `#/${c.id}/extras`, cur === 'extras']] : [])] : [];
  ln.innerHTML = `<div class="in"><nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map(([t, h], i) => `<li>${h && i < trail.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>
  ${links.length ? `<nav class="lpages" aria-label="Course: ${esc(c.title)}">${links.map(([t, h, on]) => `<a href="${h}"${on ? ' aria-current="page" class="on"' : ''}>${esc(t)}</a>`).join('')}</nav>` : ''}</div>`;
  ln.hidden = false;
}
/* breadcrumb trail for a course page: Academy › Category › Course [› page] */
function trail(c, ...more) {
  const t = topicOf(c), out = [['Academy', '#/']];
  if (t) out.push([t.name, `#/categories/${t.id}`]);
  out.push([c.navTitle || c.title, `#/${c.id}`]);
  return out.concat(more);
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
function reveal(scope) { $$('.rv:not(.seen)', scope).forEach(el => io ? io.observe(el) : el.classList.add('seen')); setTimeout(() => { if (!$('.rv.seen', scope)) $$('.rv', scope).forEach(el => el.classList.add('seen')); }, 2500); }
const notFound = () => ({ title: 'Page not found', html: '<section class="band"><div class="in narrow center"><h1 class="display">This page isn\'t here.</h1><p class="sub center">The link may be old.</p><a class="pill big" href="#/">Go to the Academy</a></div></section>' });

/* ---------- course cards ---------- */
function coverOf(c) {
  if (c.cover) return `<img src="${esc(url(c, c.cover))}" alt="" loading="lazy">`;
  const yt = c.sections.length ? vids(c.sections[0]).filter(v => v.yt).slice(0, 4) : [];
  if (yt.length) return `<span class="ytmosaic">${yt.map(v => `<img src="https://i.ytimg.com/vi/${esc(v.yt)}/hqdefault.jpg" alt="" loading="lazy">`).join('')}</span>`;
  return '<span class="blank"><img src="img/kalam-mark.png" alt=""></span>';
}
function ccard(c, hits) {
  const t = topicOf(c);
  if (c.soon) return `<div class="ccard soon rv"><span class="cimg">${coverOf(c)}<span class="tag">Planned</span></span><span class="cx"><small>${esc(t?.name || 'Course')}</small><b>${esc(c.title)}</b><span class="cs">${esc(c.subtitle || 'Not available yet.')}</span><span class="cm">Planned · not available yet</span></span></div>`;
  const T = timeOf(c), p = progress(c), who = people(c).map(x => x.name).join(', ');
  return `<a class="ccard rv" href="#/${c.id}"><span class="cimg">${coverOf(c)}<span class="play">${PLAY}</span></span><span class="cx"><small>${esc(t?.name || 'Course')}</small><b>${esc(c.title)}</b>
  ${who ? `<span class="cwho">${esc(who)}</span>` : ''}<span class="cs">${esc(c.subtitle || '')}</span>
  <span class="cm"><span>${esc(c.level || 'All levels')}</span><span>${T.video ? `${hrs(T.video)} video` : `${T.readings} lessons · ${hrs(T.reading)}`}</span><span>${esc(langShort(c))}</span><span class="${free(c) ? 'free' : ''}">${free(c) ? 'Free' : 'Paid'}</span></span>
  ${hits && hits.length ? `<span class="chits">Includes: ${hits.slice(0, 3).map(esc).join(' · ')}</span>` : ''}
  ${p.started ? `<span class="cp">${bar(p.pct)}<span>${p.pct}% done</span></span>` : ''}</span></a>`;
}
function catTile(t) {
  const n = live().filter(c => topicId(c) === t.id).length, planned = listed().filter(c => c.soon && topicId(c) === t.id).length;
  return `<a class="cat rv" href="#/categories/${esc(t.id)}"><b>${esc(t.name)}</b><span>${esc(t.blurb || '')}</span>
  <small class="${n ? '' : 'plan'}">${n ? `${n} course${n > 1 ? 's' : ''}` : planned ? 'Planned · coming later' : 'Planned · no courses yet'}</small></a>`;
}
function resumeRow(c) {
  const p = progress(c);
  return `<div class="rrow rv"><a class="rimg" href="#/${c.id}" tabindex="-1" aria-hidden="true">${coverOf(c)}</a><div class="rx"><small>${esc(topicOf(c)?.name || 'Course')}</small><a class="rt" href="#/${c.id}">${esc(c.title)}</a>
  <span class="cp">${bar(p.pct)}<span>${p.done} of ${p.total} steps · ${p.watched} of ${p.videos} videos${p.tests ? ` · ${p.pass} of ${p.tests} tests passed` : ''}</span></span>
  ${p.at ? `<span class="rnext">Next: ${esc(p.at.L.title)}</span>` : ''}</div>
  <a class="pill" href="${p.resume}">${p.done ? 'Resume' : 'Start'}<span class="sr"> ${esc(c.title)}</span></a></div>`;
}

/* ---------- home ---------- */
const searchForm = (q, big) => `<form class="search ${big ? 'big' : ''}" role="search" action="#/explore" data-search>
  <label class="sr" for="q${big ? 'h' : ''}">Search courses</label><input id="q${big ? 'h' : ''}" name="q" type="search" value="${esc(q || '')}" placeholder="Search courses and lessons, e.g. VLOOKUP" autocomplete="off">
  <button class="pill" type="submit">Search</button></form>`;
function wireSearch() { $$('[data-search]').forEach(f => f.addEventListener('submit', e => { e.preventDefault(); const q = $('input', f).value.trim(); location.hash = '#/explore' + (q ? '?q=' + encodeURIComponent(q) : ''); })); }
function home() {
  const P = App.cat.platform, L = live(), planned = listed().filter(c => c.soon);
  const started = L.filter(c => Store.started(c.id)).sort((a, b) => Store.at(b.id) - Store.at(a.id)).slice(0, 3);
  const empty = App.topics.filter(t => !listed().some(c => topicId(c) === t.id));
  return { title: 'Kalam CX Academy', html: `<section class="hero compact"><div class="in">
  <p class="eyebrow center rv">${esc(P.name || 'Kalam CX Academy')}</p>
  <h1 class="mega center rv">Learn it.<br><span class="grad">Use it on the floor.</span></h1>
  <p class="sub center wide rv">${esc(P.intro)}</p></div></section>
 ${started.length ? `<div class="band tight"><div class="in"><h2 class="headline small2 rv">Continue learning.</h2><div class="rows">${started.map(resumeRow).join('')}</div></div></div>` : ''}
 <div class="band tight"><div class="in"><div class="th2"><h2 class="headline small2 rv">Courses.</h2><a class="link rv" href="#/explore">Search all courses ${CHEV}</a></div>
  <div class="cgrid two">${L.map(c => ccard(c)).join('')}${planned.map(c => ccard(c)).join('')}</div>
  ${empty.length ? `<p class="note left rv">Planned topics, no courses yet: ${empty.map(t => esc(t.name)).join(' · ')}.</p>` : ''}</div></div>
 <div class="band gray"><div class="in"><h2 class="headline center rv">How a course works.</h2>
  <div class="steps three"><div class="rv"><b>1</b><h3>Watch</h3><p>Short videos, one skill at a time, in the trainer's own voice.</p></div><div class="rv"><b>2</b><h3>Practise</h3><p>Do it yourself in the session workbook.</p></div><div class="rv"><b>3</b><h3>Check</h3><p>A self-marking test after each session, then a final task. Progress is saved in this browser only.</p></div></div></div></div>` };
}

/* ---------- explore: search + filters over real course data ---------- */
const DUR = [['short', 'Under 2 hours of video', m => m < 120], ['medium', '2 to 6 hours of video', m => m >= 120 && m <= 360], ['long', 'Over 6 hours of video', m => m > 360]];
function searchHits(c, q) {
  if (!q) return { ok: true, hits: [] };
  const words = q.toLowerCase().split(/\s+/).filter(Boolean), t = topicOf(c);
  const head = [c.title, c.subtitle, c.intro, ...(c.description || []), ...(c.outcomes || []), t?.name, ...people(c).map(p => p.name), ...secsOf(c).map(s => `${s.title} ${s.covers || ''}`)].join(' ').toLowerCase();
  const lessons = c.sections.flatMap(s => s.lessons).filter(l => l.title);
  const hits = lessons.filter(l => words.every(w => l.title.toLowerCase().includes(w))).map(l => l.title);
  const ok = words.every(w => head.includes(w) || lessons.some(l => l.title.toLowerCase().includes(w)));
  return { ok, hits: [...new Set(hits)] };
}
function explore(Q) {
  const all = live(), planned = listed().filter(c => c.soon);
  const opt = (name, label, items, cur) => `<label class="flt"><span>${label}</span><select name="${name}"><option value="">Any</option>${items.map(([v, t]) => `<option value="${esc(v)}"${cur === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
  const levels = [...new Set(all.map(c => c.level).filter(Boolean))], langs = [...new Set(all.map(c => c.language).filter(Boolean))];
  const html = `<section><div class="band slim"><div class="in">
  <h1 class="display rv">Courses.</h1><p class="sub wide rv">Search every course and lesson, or narrow by topic, level, language, length and price.</p>
  ${searchForm(Q.get('q'))}
  <form class="filters" id="flt" aria-label="Filter courses">
   ${opt('topic', 'Topic', App.topics.map(t => [t.id, t.name]), Q.get('topic') || '')}
   ${opt('level', 'Level', levels.map(l => [l, l]), Q.get('level') || '')}
   ${opt('lang', 'Language', langs.map(l => [l, LANG[l] || l]), Q.get('lang') || '')}
   ${opt('dur', 'Video length', DUR.map(([v, t]) => [v, t]), Q.get('dur') || '')}
   ${opt('price', 'Price', [['free', 'Free'], ['paid', 'Paid']], Q.get('price') || '')}
   <button type="button" class="link btnlink" id="clr">Clear filters</button></form>
  <p class="count" id="count" role="status" aria-live="polite"></p>
  <div class="cgrid" id="results"></div>
  ${planned.length ? `<h2 class="headline small2 rv">Planned.</h2><p class="tblurb">Not available yet. Shown so you know what's coming.</p><div class="cgrid">${planned.map(c => ccard(c)).join('')}</div>` : ''}
  </div></div></section>`;
  function draw() {
    const P = new URLSearchParams(location.hash.split('?')[1] || ''), q = (P.get('q') || '').trim();
    const d = DUR.find(x => x[0] === P.get('dur'));
    const res = all.map(c => [c, searchHits(c, q)]).filter(([c, s]) => s.ok
      && (!P.get('topic') || topicId(c) === P.get('topic')) && (!P.get('level') || c.level === P.get('level')) && (!P.get('lang') || c.language === P.get('lang'))
      && (!d || d[2](timeOf(c).video)) && (!P.get('price') || (P.get('price') === 'free') === free(c)));
    $('#results').innerHTML = res.map(([c, s]) => ccard(c, s.hits)).join('') || `<div class="empty"><h3>No courses match.</h3><p>${App.topics.find(t => t.id === P.get('topic')) && !all.some(c => topicId(c) === P.get('topic')) ? 'This topic is planned and has no courses yet. ' : ''}Try fewer filters or another word.</p></div>`;
    $('#count').textContent = `${res.length} course${res.length === 1 ? '' : 's'}${q ? ` for "${q}"` : ''}`;
    $$('#results .rv').forEach(e => e.classList.add('seen'));
  }
  function push() {
    const P = new URLSearchParams(); const q = $('#q').value.trim(); if (q) P.set('q', q);
    $$('#flt select').forEach(s => s.value && P.set(s.name, s.value));
    history.replaceState(null, '', '#/explore' + (P.toString() ? '?' + P : '')); draw();
  }
  let timer = 0;
  return { title: 'Courses', crumbs: [['Academy', '#/'], ['Courses']], html, after() {
    draw();
    $('#flt').addEventListener('change', push);
    $('[data-search]').addEventListener('submit', e => { e.preventDefault(); push(); });
    $('#q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(push, 250); });
    $('#clr').addEventListener('click', () => { $$('#flt select').forEach(s => (s.value = '')); push(); });
  } };
}

/* ---------- categories ---------- */
function categories() {
  return { title: 'Categories', crumbs: [['Academy', '#/'], ['Categories']], html: `<section><div class="band slim"><div class="in">
  <h1 class="display rv">Categories.</h1><p class="sub wide rv">Courses grouped by topic. Topics without courses yet are marked as planned.</p>
  <div class="cats big">${App.topics.map(catTile).join('')}</div></div></div></section>` };
}
function category(id) {
  const t = App.topics.find(x => x.id === id); if (!t) return notFound();
  const L = listed().filter(c => topicId(c) === id), n = L.filter(c => !c.soon).length;
  return { title: t.name, crumbs: [['Academy', '#/'], ['Categories', '#/categories'], [t.name]], html: `<section><div class="band slim"><div class="in">
  <p class="eyebrow rv">Category</p><h1 class="display rv">${esc(t.name)}.</h1>${t.blurb ? `<p class="sub wide rv">${esc(t.blurb)}</p>` : ''}
  ${L.length ? `<div class="cgrid">${L.map(c => ccard(c)).join('')}</div>` : ''}
  ${!n ? `<div class="empty"><h3>No courses here yet.</h3><p>This topic is planned. Courses will appear here when they are published.</p><a class="pill" href="#/explore">See available courses</a></div>` : ''}</div></div></section>` };
}

/* ---------- my learning ---------- */
function myLearning() {
  const l = live().filter(c => Store.started(c.id)).sort((a, b) => Store.at(b.id) - Store.at(a.id));
  const ext = App.order.map(id => App.courses[id]).filter(c => c.partOf && Store.started(c.id));
  return { title: 'My learning', crumbs: [['Academy', '#/'], ['My learning']], html: `<section><div class="band slim"><div class="in narrow">
  <h1 class="display rv">My learning.</h1><p class="sub wide rv">Saved in this browser only. There are no accounts yet, so on another phone or laptop you start fresh.</p>
  ${l.length ? `<div class="rows">${l.map(resumeRow).join('')}</div>` : `<div class="empty"><h3>Nothing started yet.</h3><p>Pick a course and press Start. It will show up here with your progress.</p><a class="pill" href="#/explore">Explore courses</a></div>`}
  ${ext.length ? `<p class="note left">Also watched: ${ext.map(c => `<a href="#/${c.partOf}/extras">${esc(c.title)}</a>`).join(', ')}.</p>` : ''}</div></div></section>` };
}
function soonPage(c) {
  const t = topicOf(c);
  return { title: c.title, crumbs: [['Academy', '#/'], ...(t ? [[t.name, `#/categories/${t.id}`]] : []), [c.title]], html: `<section><div class="band"><div class="in narrow center">
  <p class="eyebrow center">Planned</p><h1 class="display center">${esc(c.title)}</h1><p class="sub center wide">${esc(c.subtitle || 'This course is being prepared.')} It isn't available yet.</p>
  <a class="pill big" href="#/explore">See available courses</a></div></div></section>` };
}

/* ---------- course overview: Part 1 = the sessions (short course), Part 2 = extra videos, then files and about ---------- */
function scard(c, s, i, P) {
  const W = word(c), xs = P.filter(x => x.sec === s), vs = vids(s), m = vs.reduce((a, v) => a + (+v.minutes || 0), 0), d = xs.filter(x => lessonDone(c, x.L)).length, q = quizOf(s);
  const st = d === xs.length ? ['done', '✓ Done'] : d ? ['on', 'In progress'] : ['', 'Not started'];
  const go = (xs.find(x => !lessonDone(c, x.L)) || xs[0]).L.id, nr = s.lessons.filter(l => l.type === 'reading').length;
  return `<a class="scard rv ${st[0]}" href="#/${c.id}/learn/${esc(go)}"><span class="sh"><span>${esc(W)} ${i + 1}</span><span class="st">${st[1]}</span></span>
   <b>${esc(s.title)}</b>${s.covers ? `<span class="sc">${esc(s.covers)}</span>` : ''}
   <span class="sm">${[vs.length ? `${vs.length} videos · ${m} min` : '', nr ? `${nr} reading lessons` : ''].filter(Boolean).join(' · ')}${d && d < xs.length ? ` · ${d} of ${xs.length} done` : ''}</span>
   <span class="sl">${s.lessons.some(l => l.type === 'practice') ? '<span>Practice workbook</span>' : ''}${q ? `<span>${esc(W)} test${q.questions.some(x => Store.answer(c.id, x.id, x.rev) !== undefined) ? (passed(c, q) ? ' · passed' : ' · not passed yet') : ` · ${q.questions.length} questions`}</span>` : ''}</span></a>`;
}
function ecard(c, x, s, i) {
  const vs = vids(s), seen = vs.filter(L => Store.isDone(x.id, L.id)).length;
  return `<a class="scard ecard rv" href="#/${c.id}/extras"><span class="sh"><span>With ${esc(word(c).toLowerCase())} ${i + 1}</span><span class="st">${seen ? `${seen} of ${vs.length} watched` : 'Optional'}</span></span>
   <b>${esc(s.title)}</b><span class="sm">${vs.length} videos${vs.some(L => L.type === 'youtube') ? ' · YouTube' : ''}</span>
   <span class="eth" aria-hidden="true">${vs.slice(0, 3).map(L => `<img src="${thumbOf(x, L)}" alt="" loading="lazy">`).join('')}${vs.length > 3 ? `<small>+${vs.length - 3}</small>` : ''}</span>
   <span class="sl">${vs.slice(0, 3).map(L => `<span>${esc(L.title)}</span>`).join('')}</span></a>`;
}
function overview(c) {
  const T = timeOf(c), p = progress(c), secs = secsOf(c), ex = examOf(c), P = path(c), W = word(c), t = topicOf(c), X = extrasOf(c)[0];
  const trainers = people(c), [h1a, h1b] = c.headline || [c.title, ''], part = (c.labels && c.labels.part) || 'The course';
  const row = x => `<li class="${lessonDone(c, x.L) ? 'done' : ''}"><a href="#/${c.id}/learn/${esc(x.L.id)}"><span class="li">${ICON[x.L.type] || ''}</span><span class="lt">${esc(x.L.title)}${x.L.kind && isVid(x.L) ? `<small>${esc(x.L.kind)}</small>` : ''}</span><span class="lm">${x.L.minutes ? `${+x.L.minutes} min` : ''}</span>${lessonDone(c, x.L) ? `<span class="lok">${CHECK}<span class="sr">Done</span></span>` : '<span class="lok"></span>'}</a></li>`;
  const lists = secs.map((s, i) => `<details class="mod"${p.at && p.at.sec === s ? ' open' : ''}><summary><span class="mn">${W} ${i + 1}</span><span class="mt"><b>${esc(s.title)}</b>${s.covers ? `<small>${esc(s.covers)}</small>` : ''}</span><span class="mc">${P.filter(x => x.sec === s).length} steps</span></summary>${s.note ? `<p class="gnote mnote">${esc(s.note)}</p>` : ''}<ol class="lessons">${P.filter(x => x.sec === s).map(row).join('')}</ol></details>`).join('');
  const fl = secs.map((s, i) => [s, i, filesOf(c, s)]), wb = fl.find(([, , f]) => f.workbook), exL = ex && ex.lessons[0];
  const startLabel = p.done ? `Resume${p.at ? ': ' + p.at.L.title : ''}` : 'Start the course';
  const has = ty => secs.some(s => s.lessons.some(l => ty.includes(l.type)));
  const meta = [T.videos ? `${T.videos} videos · ${hours(T.video)} of video` : '', T.readings ? `${T.readings} reading lessons` : '', has(['practice']) ? 'practice' : '', has(['quiz']) ? `a test after each ${W.toLowerCase()}` : '', ex ? 'final task' : ''].filter(Boolean).join(' · ');
  const jumps = [['curriculum', part], ...(X ? [['extras', 'Extra videos']] : []), ['files', 'Files'], ['about', 'About']];
  return { title: c.title, crumbs: trail(c), html: `<section class="ov">
  <div class="band dark ehero"><div class="in">
   <p class="eyebrow">${esc(t?.name || 'Course')}</p><h1 class="display">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
   <p class="sub wide">${esc(c.intro || c.subtitle)}</p>
   <ul class="facts" aria-label="Course facts">${trainers.filter(x => !x.external).map(x => `<li class="tchip">${x.photo ? `<img src="${esc(x.photo)}" alt="">` : ''}${esc(x.name)}</li>`).join('')}
    <li>${esc(c.levelRange || c.level || 'All levels')}</li><li>${esc(c.languageLabel || langShort(c))}</li>${T.video ? `<li>${hours(T.video)} of video</li>` : ''}${T.reading ? `<li>${T.readings} reading lessons</li>` : ''}<li>${secs.length} ${W.toLowerCase()}s</li><li>${free(c) ? 'Free' : 'Paid'}</li></ul>
   <div class="hcta"><a class="pill big" href="${p.resume}">${esc(startLabel)}</a>${p.started ? `<span class="hprog">${bar(p.pct)}<span>${p.done} of ${p.total} steps</span></span>` : ''}</div></div></div>
  <nav class="ovtabs" aria-label="On this page"><div class="in">${jumps.map(([id, tx]) => `<a href="#/${c.id}" data-jump="${id}">${esc(tx)}</a>`).join('')}</div></nav>
  <div class="band slim" id="curriculum"><div class="in">
   <p class="eyebrow">Part 1</p><h2 class="headline small2 ph">${esc(part)} · ${secs.length} ${W.toLowerCase()}${secs.length === 1 ? '' : 's'}</h2><p class="tblurb">${esc(meta)}</p>
   <div class="scards">${secs.map((s, i) => scard(c, s, i, P)).join('')}</div>
   ${exL ? `<a class="fcard rv" href="#/${c.id}/learn/${esc(exL.id)}"><span><small>Final task</small><b>${esc(exL.title || 'Final assessment')}${exL.minutes ? ` · about ${+exL.minutes} min` : ''}</b>${ex.summary ? `<span>${esc(ex.summary)}</span>` : ''}</span><span class="link">${lessonDone(c, exL) ? '✓ Done' : `Open ${CHEV}`}</span></a>` : ''}
   <details class="every"><summary>Show every lesson</summary><div class="mods">${lists}</div></details></div></div>
  ${X ? `<div class="band gray slim" id="extras"><div class="in">
   <p class="eyebrow">Part 2 · Optional</p><h2 class="headline small2 ph">Extra videos</h2><p class="tblurb">${esc(X.subtitle || `${X.sections.reduce((a, s) => a + vids(s).length, 0)} videos, grouped to match each ${W.toLowerCase()}.`)}</p>
   <div class="scards">${secsOf(X).map((s, i) => ecard(c, X, s, i)).join('')}</div></div></div>` : ''}
  <div class="band slim" id="files"><div class="in">
   <h2 class="headline small2">Files.</h2>
   <div class="grid3">
    ${wb ? `<a class="doc xl" href="${esc(wb[2].workbook)}"><span class="badge">XLSX</span><b>Practice workbook</b><span>Used in every ${W.toLowerCase()} and in the final assessment.</span><span class="link">Download ${CHEV}</span></a>` : ''}
    ${fl.filter(([, , f]) => f.slides).length ? `<div class="doc"><span class="badge">PDF</span><b>Slides</b><span>${fl.filter(([, , f]) => f.slides).map(([s, i, f]) => `<a href="${esc(f.slides)}" target="_blank" rel="noopener">${W} ${i + 1}: ${esc(s.title)}</a>`).join('<br>')}</span></div>` : ''}
    ${fl.some(([s]) => quizOf(s)) ? `<div class="doc"><span class="badge q">TEST</span><b>${W} tests</b><span>${fl.filter(([s]) => quizOf(s)).map(([s, i, f]) => `<a href="#/${c.id}/learn/${quizOf(s).id}">${W} ${i + 1} test</a> (${quizOf(s).questions.length} questions, pass ${quizOf(s).pass})${f.testPdf ? ` · <a href="${esc(f.testPdf)}" target="_blank" rel="noopener">printable</a>` : ''}`).join('<br>')}</span></div>` : ''}
   </div>
   <p class="center"><a class="link" href="#/${c.id}/resources">All guides and files ${CHEV}</a></p></div></div>
  <div class="band gray slim" id="about"><div class="in">
   <div class="ovgrid">
    <div>${(c.description || []).length ? `<h2 class="headline small2">About this course.</h2>${c.description.map(d => `<p class="body">${esc(d)}</p>`).join('')}` : ''}
     ${(c.outcomes || []).length ? `<h2 class="headline small2">What you'll learn.</h2><ul class="outs">${c.outcomes.map(o => `<li><span class="ic">${CHECK}</span>${esc(o)}</li>`).join('')}</ul>` : ''}</div>
    <aside class="side">
     <div class="card"><h3>Course length</h3><table class="len"><caption class="sr">Course length</caption><tbody>
      ${T.videos ? `<tr><th scope="row">Video</th><td>${T.videos} videos · ${T.video} min</td></tr>` : ''}
      ${T.reading ? `<tr><th scope="row">Reading</th><td>${T.readings} lessons · about ${T.reading} min</td></tr>` : ''}
      ${T.practice ? `<tr><th scope="row">Practice</th><td>about ${T.practice} min <small>(${T.nPractice} × ${Math.round(T.practice / T.nPractice)})</small></td></tr>` : ''}
      ${T.tests ? `<tr><th scope="row">${W} tests</th><td>about ${T.tests} min <small>(${T.nTests} × ${Math.round(T.tests / T.nTests)})</small></td></tr>` : ''}
      ${T.exam ? `<tr><th scope="row">Final assessment</th><td>${T.exam} min</td></tr>` : ''}
      <tr class="tot"><th scope="row">Total</th><td>about ${hours(T.total)}</td></tr></tbody></table>
      <p class="fine">${T.video ? `The ${hours(T.video)} figure is video only. ` : ''}Reading, practice and test times are the course's estimates.</p></div>
    </aside></div>
   ${(c.audience || []).length || (c.requirements || []).length ? `<div class="duo">${(c.audience || []).length ? `<div class="card"><h3>Who it's for</h3><ul class="plain">${c.audience.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}${(c.requirements || []).length ? `<div class="card"><h3>Before you start</h3><ul class="plain">${c.requirements.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}</div>` : ''}
   ${trainers.filter(x => !x.external).map(x => `<div class="trainer">${x.photo ? `<img src="${esc(x.photo)}" alt="Photo of ${esc(x.name)}">` : ''}<div><h3 class="headline small2">${esc(x.name)}</h3><p class="sub">${esc(x.title || '')}</p><p>${esc(x.bio || '')}</p></div></div>`).join('')}
  </div></div>
  </section>`,
    after() { $$('[data-jump]').forEach(a => a.addEventListener('click', e => { e.preventDefault(); const el = document.getElementById(a.dataset.jump); el.scrollIntoView({ behavior: 'smooth' }); const h = $('h2', el); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } })); } };
}

/* ---------- learning view: player / practice / test / exam + curriculum sidebar + previous/next ---------- */
function learn(c, lessonId) {
  const P = path(c), W = word(c);
  let k = P.findIndex(x => x.L.id === lessonId);
  if (k < 0) { const r = progress(c).resume.split('/').pop(); k = Math.max(0, P.findIndex(x => x.L.id === r)); history.replaceState(null, '', `#/${c.id}/learn/${P[k].L.id}`); }
  const collapsed = (() => { try { return localStorage.getItem('kalam.sidebar') === 'closed'; } catch (e) { return false; } })();
  const html = `<section class="learn${collapsed ? ' nocurr' : ''}" id="learn">
  <div class="lmain" id="lmain"></div>
  <aside class="curr" id="curr" aria-label="Lessons"><div class="ch"><b>Lessons</b><button class="cclose" id="ccls" type="button" aria-label="Close course content">✕</button><span id="cprog"></span></div><div id="ctoc"></div></aside></section>`;
  /* the lesson comes first; the course content list sits on the right */
  let cur = k;
  function toc() {
    const p = progress(c);
    $('#cprog').innerHTML = `${bar(p.pct)}<span>${p.done}/${p.total}</span>`;
    const groups = [...secsOf(c).map((s, i) => [s, i]), ...(examOf(c) ? [[examOf(c), -1]] : [])];
    $('#ctoc').innerHTML = groups.map(([s, i]) => {
      const xs = P.map((x, j) => [x, j]).filter(([x]) => x.sec === s), open = P[cur].sec === s;
      return `<details${open ? ' open' : ''}><summary><span>${i < 0 ? 'Final' : `${W} ${i + 1}`}</span><b>${esc(i < 0 ? (s.title || 'Final assessment') : s.title)}</b><small>${xs.filter(([x]) => lessonDone(c, x.L)).length}/${xs.length}</small></summary><ol>${xs.map(([x, j]) =>
        `<li class="${j === cur ? 'on' : ''} ${lessonDone(c, x.L) ? 'done' : ''}"><a href="#/${c.id}/learn/${esc(x.L.id)}"${j === cur ? ' aria-current="page"' : ''}><span class="li">${lessonDone(c, x.L) ? CHECK : ICON[x.L.type] || ''}</span><span class="lt">${esc(x.L.title)}</span>${x.L.minutes ? `<span class="lm">${+x.L.minutes}m</span>` : ''}<span class="sr">${lessonDone(c, x.L) ? ' (done)' : ''}</span></a></li>`).join('')}</ol></details>`;
    }).join('');
  }
  function show(j) {
    cur = j; const x = P[j], L = x.L, F = x.mi >= 0 ? filesOf(c, x.sec) : {}, prev = P[j - 1], next = P[j + 1];
    Store.visit(c.id, x.sec.id, L.id);
    const inMod = P.filter(y => y.sec === x.sec), pos = inMod.indexOf(x) + 1;
    const nextBtn = next ? `<a class="pill small" href="#/${c.id}/learn/${esc(next.L.id)}">Next lesson ›</a>` : '';
    const doneBtn = L.type !== 'quiz' ? `<button class="pill ghost small" id="done" aria-pressed="${Store.isDone(c.id, L.id)}">${Store.isDone(c.id, L.id) ? '✓ Completed' : 'Mark as complete'}</button>` : '';
    const files = (F.workbook || F.slides) && L.type !== 'practice' ? `<div class="lfiles"><b>For this ${W.toLowerCase()}</b>${F.workbook ? `<a class="link" href="${esc(F.workbook)}">Practice workbook ${CHEV}</a>` : ''}${F.slides ? `<a class="link" href="${esc(F.slides)}" target="_blank" rel="noopener">Slides (PDF) ${CHEV}</a>` : ''}${quizOf(x.sec) && L.type !== 'quiz' ? `<a class="link" href="#/${c.id}/learn/${quizOf(x.sec).id}">${W} test ${CHEV}</a>` : ''}</div>` : '';
    let body = '';
    if (isVid(L)) body = `<div class="screen" id="screen">${frameSrc(L) ? `<iframe src="${esc(frameSrc(L))}" title="${esc(L.title)} (video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>` : `<video id="vid" controls playsinline preload="metadata" src="${esc(media(c, L.src))}" poster="${esc(media(c, L.poster))}" aria-label="Video: ${esc(L.title)}"></video>`}</div>
      <div class="lbar"><p class="lmeta">${esc(L.kind || L.by || 'Video')}${L.minutes ? ` · ${+L.minutes} min` : ''}</p><span class="lact">${doneBtn}${nextBtn}</span></div>${L.summary ? `<p class="body">${esc(L.summary)}</p>` : ''}${files}`;
    else if (L.type === 'reading') body = `${L.image ? `<figure class="rfig"><a href="${esc(media(c, L.image))}" target="_blank" rel="noopener" title="Open the picture full size"><img src="${esc(media(c, L.image))}" alt="${esc(L.alt || '')}"></a><figcaption>Tap the picture to open it full size.</figcaption></figure>` : ''}
      <div class="rblocks">${(L.blocks || []).map((b, n) => `<section class="rb${b.tone === 'warn' ? ' warn' : ''}">${b.h ? `<h2>${esc(b.h)}</h2>` : ''}${b.p ? `<p>${esc(b.p)}</p>` : ''}${b.code != null ? `<div class="code"><pre id="code-${n}"><code>${esc(b.code)}</code></pre><button type="button" class="pill ghost small" data-copy="code-${n}" aria-label="Copy${b.h ? ': ' + esc(b.h) : ''}">Copy</button></div>` : ''}</section>`).join('')}</div>
      <div class="lbar"><p class="lmeta">Reading${L.minutes ? ` · about ${+L.minutes} min` : ''}</p><span class="lact">${doneBtn}${nextBtn}</span></div>${files}`;
    else if (L.type === 'practice') body = `<div class="card"><p class="eyebrow">Practice</p>${(L.body || []).map(b => `<p>${esc(b)}</p>`).join('')}
      <div class="ctas left">${F.workbook ? `<a class="pill" href="${esc(F.workbook)}">Download the workbook</a>` : ''}${F.slides ? `<a class="link" href="${esc(F.slides)}" target="_blank" rel="noopener">Slides (PDF) ${CHEV}</a>` : ''}</div></div>
      <div class="lbar"><p class="lmeta">About ${+L.minutes || 30} min · do it in Excel on your own copy</p><span class="lact">${doneBtn}${nextBtn}</span></div>`;
    else if (L.type === 'quiz') body = `<div id="test"><p class="sub">${L.questions.length} questions. Pass mark ${L.pass}. Each answer is marked instantly, with the reason.</p>${L.note ? `<p class="note left">${esc(L.note)}</p>` : ''}
      <div class="scorecard"><div class="ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="trk"/><circle cx="18" cy="18" r="15.9" class="val" id="ring"/></svg><b id="rn">0</b></div><div><b class="score" id="score" role="status" aria-live="polite"></b><button class="link btnlink" data-act="reset">Start over</button>${F.testPdf ? ` · <a class="link" href="${esc(F.testPdf)}" target="_blank" rel="noopener">Printable test</a>` : ''}</div></div>
      <div class="quiz" id="quiz"></div></div>`;
    else if (L.type === 'exam') {
      const wb = (L.resources || []).find(r => r.type === 'xlsx'), pdf = (L.resources || []).find(r => r.type === 'pdf');
      body = `<p class="sub">${esc(L.intro || 'Open the workbook, complete every task, then reveal the answer key.')}${L.minutes ? ` ${esc(L.minutes)} minutes.` : ''}</p>
      <div class="ctas left">${wb ? `<a class="pill" href="${esc(url(c, wb.href))}">Download the workbook</a>` : ''}${pdf ? `<a class="link" href="${esc(url(c, pdf.href))}" target="_blank" rel="noopener">Printable exam ${CHEV}</a>` : ''}</div>
      <h2 class="headline small">The tasks</h2><div class="card exam">${L.html || ''}</div>
      ${L.keyHtml ? `<div class="center"><button class="pill ghost" id="keybtn" aria-expanded="false" aria-controls="key">Show the answer key</button></div><div id="key" class="card key" hidden>${L.keyHtml}</div>` : ''}
      <div class="lbar"><p class="lmeta">Self-marked. Your result isn't sent anywhere.</p><span class="lact">${doneBtn}${nextBtn}</span></div>`;
    }
    $('#lmain').innerHTML = `<div class="ltop"><button class="ctoggle" id="ctog" aria-controls="curr" aria-expanded="${!$('#learn').classList.contains('nocurr')}"><span aria-hidden="true">☰</span> <span id="ctogt">${$('#learn').classList.contains('nocurr') ? 'Show' : 'Hide'} lessons</span></button><a class="link lback" href="#/${c.id}">‹ ${esc(c.title)}</a></div>
     <p class="eyebrow">${esc(modName(c, x))}</p><h1 class="headline">${esc(L.title)}</h1><p class="lpos">${x.mi < 0 ? 'Final step of the course' : `Lesson ${pos} of ${inMod.length} in this ${W.toLowerCase()}`}</p>${body}${x.sec.note && isVid(L) ? `<p class="gnote">${esc(x.sec.note)}</p>` : ''}
     <nav class="pn" aria-label="Lesson navigation">${prev ? `<a class="prev" href="#/${c.id}/learn/${esc(prev.L.id)}" rel="prev"><small>Previous</small><b>${esc(prev.L.title)}</b></a>` : '<span></span>'}
     ${next ? `<a class="next" href="#/${c.id}/learn/${esc(next.L.id)}" rel="next" id="nextbtn"><small>Next${next.sec !== x.sec ? ` · ${esc(modName(c, next))}` : ''}</small><b>${esc(next.L.title)}</b></a>` : `<a class="next" href="#/${c.id}" id="nextbtn"><small>Finished</small><b>Back to the course overview</b></a>`}</nav>`;
    wire(L); toc();
    const on = $('#ctoc li.on'); if (on && $('#curr').scrollHeight > $('#curr').clientHeight) on.scrollIntoView({ block: 'nearest' });
  }
  function wire(L) {
    $('#ctog').onclick = () => { const l = $('#learn'), o = l.classList.toggle('nocurr'); $('#ctog').setAttribute('aria-expanded', !o); $('#ctogt').textContent = (o ? 'Show' : 'Hide') + ' lessons'; try { localStorage.setItem('kalam.sidebar', o ? 'closed' : 'open'); } catch (e) {} if (!o && innerWidth <= 900) $('#ctoc a[aria-current]')?.focus(); };
    if ($('#done')) $('#done').onclick = e => { const d = Store.isDone(c.id, L.id); d ? Store.unsetDone(c.id, L.id) : Store.setDone(c.id, L.id); const b = e.currentTarget; b.setAttribute('aria-pressed', !d); b.textContent = d ? 'Mark as complete' : '✓ Completed'; toc(); };
    const v = $('#vid');
    if (v) {
      v.addEventListener('timeupdate', () => { if (v.isConnected && v.duration && v.currentTime / v.duration > 0.9 && !Store.isDone(c.id, L.id)) { Store.setDone(c.id, L.id); toc(); const b = $('#done'); if (b) { b.setAttribute('aria-pressed', true); b.textContent = '✓ Completed'; } } });
      v.addEventListener('ended', () => { if (v.isConnected) $('#nextbtn')?.focus(); });
    } else if (frameSrc(L) || L.type === 'reading') { Store.setDone(c.id, L.id); const b = $('#done'); if (b) { b.setAttribute('aria-pressed', true); b.textContent = '✓ Completed'; } }
    $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      const src = $('#' + b.dataset.copy), t = src.textContent; let ok = false;
      try { await navigator.clipboard.writeText(t); ok = true; } catch (e) { const rg = document.createRange(); rg.selectNodeContents(src); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg); try { ok = document.execCommand('copy'); } catch (e2) {} }
      b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => (b.textContent = 'Copy'), 1800);
    }));
    if (L.type === 'quiz') {
      const draw = () => { $('#quiz').innerHTML = L.questions.map((q, n) => qcard(c, q, n, L.questions.length)).join(''); score(); };
      const score = () => {
        const ans = L.questions.map(q => Store.answer(c.id, q.id, q.rev)), done = ans.filter(a => a !== undefined).length, ok = L.questions.filter((q, n) => ans[n] === q.a).length, tot = L.questions.length;
        $('#score').innerHTML = done === 0 ? 'Answer the first question to begin.' : `${ok} of ${done} correct` + (done < tot ? ` · ${tot - done} to go` : ok >= L.pass ? ' <span class="pass">· Passed</span>' : ` <span class="fail">· Pass mark is ${L.pass}. Review and try again.</span>`);
        $('#ring').style.strokeDasharray = Math.round(100 * ok / tot) + ' 100'; $('#rn').textContent = ok;
        if (done === tot) Store.setDone(c.id, L.id); toc();
      };
      draw();
      $('#test').addEventListener('click', e => {
        const b = e.target.closest('button.o'); if (b && b.getAttribute('aria-disabled') !== 'true') { const q = L.questions.find(y => y.id === b.dataset.q); Store.setAnswer(c.id, q.id, q.rev, +b.dataset.j);
          $(`#q-${q.id}`).outerHTML = qcard(c, q, L.questions.indexOf(q), L.questions.length); score(); $(`#q-${q.id} .ex`).focus(); }
        if (e.target.closest('[data-act="reset"]')) { Store.reset(c.id, L.questions.map(y => y.id)); draw(); $('#quiz .o')?.focus(); }
      });
    }
    if (L.type === 'exam') {
      $$('.exam table,.key table').forEach(t => { const w = document.createElement('div'); w.className = 'tw'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
      if ($('#keybtn')) $('#keybtn').onclick = e => { const kk = $('#key'); kk.hidden = !kk.hidden; e.target.setAttribute('aria-expanded', !kk.hidden); e.target.textContent = kk.hidden ? 'Show the answer key' : 'Hide the answer key'; };
    }
  }
  return { title: `${P[k].L.title} · ${c.title}`, crumbs: trail(c, [P[k].mi < 0 ? 'Final assessment' : `${W} ${P[k].mi + 1}`]), html,
    after() {
      show(k); if (innerWidth <= 900) { $('#learn').classList.add('nocurr'); if ($('#ctogt')) $('#ctogt').textContent = 'Show lessons'; $('#ctog').setAttribute('aria-expanded', 'false'); }
      const close = () => { if (innerWidth > 900 || $('#learn').classList.contains('nocurr')) return; $('#learn').classList.add('nocurr'); if ($('#ctogt')) $('#ctogt').textContent = 'Show lessons'; $('#ctog').setAttribute('aria-expanded', 'false'); $('#ctog').focus(); };
      $('#ccls').onclick = close; $('#curr').addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    },
    update() {
      const j = P.findIndex(x => x.L.id === location.hash.split('/').pop()); if (j < 0) return;
      if (innerWidth <= 900) { $('#learn').classList.add('nocurr'); if ($('#ctogt')) $('#ctogt').textContent = 'Show lessons'; }
      show(j); window.scrollTo({ top: 0, behavior: 'instant' }); const h = $('#lmain h1'); h.tabIndex = -1; h.focus({ preventScroll: true });
    } };
}
function qcard(c, x, n, tot) {
  const a = Store.answer(c.id, x.id, x.rev), done = a !== undefined;
  return `<fieldset class="q" id="q-${x.id}"><legend><span class="qn">Question ${n + 1} of ${tot}</span><span class="qt">${esc(x.q)}</span></legend><div class="opts">${x.o.map((o, j) => {
    const cls = done ? (j === x.a ? 'ok' : j === a ? 'no' : '') : '', sr = done ? (j === x.a ? '<span class="sr"> (correct answer)</span>' : j === a ? '<span class="sr"> (your answer, incorrect)</span>' : '') : '';
    return `<button type="button" class="o ${cls}" data-q="${x.id}" data-j="${j}" ${done ? 'aria-disabled="true"' : ''}><span class="k" aria-hidden="true">${'ABCD'[j]}</span><span>${esc(o)}${sr}</span></button>`; }).join('')}</div>
  ${done ? `<p class="ex" tabindex="-1"><b>${a === x.a ? 'Correct.' : 'Not quite.'}</b> ${esc(x.e)}</p>` : ''}</fieldset>`;
}

/* ---------- resources, extra videos ---------- */
function resources(c) {
  const files = (c.resources || []).filter(r => r.type === 'xlsx'), docs = (c.resources || []).filter(r => r.type !== 'xlsx'), W = word(c);
  const tile = (r, open) => `<a class="doc ${r.type === 'xlsx' ? 'xl' : ''}" href="${esc(url(c, r.href))}" ${open ? 'target="_blank" rel="noopener"' : ''}><span class="badge">${esc(r.type.toUpperCase())}</span><b>${esc(r.title)}</b><span>${esc(r.summary || '')}</span><span class="link">${open ? 'Open' : 'Download'} ${CHEV}</span></a>`;
  const mods = secsOf(c).map((s, i) => [s, i, filesOf(c, s)]).filter(([, , f]) => f.slides || f.testPdf);
  return { title: `Resources · ${c.title}`, crumbs: trail(c, ['Resources']), html: `<section><div class="band slim"><div class="in">
  <h1 class="display">Resources.</h1><p class="sub wide">Practice files, slides, printable tests and guides for ${esc(c.title)}.</p>
  ${files.length ? `<h2 class="headline small">Practice files</h2><div class="grid3">${files.map(r => tile(r, false)).join('')}</div>` : ''}
  ${mods.length ? `<h2 class="headline small">By ${W.toLowerCase()}</h2><div class="grid3">${mods.map(([s, i, f]) => `<div class="doc"><span class="badge">PDF</span><b>${W} ${i + 1}: ${esc(s.title)}</b><span>${f.slides ? `<a href="${esc(f.slides)}" target="_blank" rel="noopener">Slides</a>` : ''}${f.slides && f.testPdf ? ' · ' : ''}${f.testPdf ? `<a href="${esc(f.testPdf)}" target="_blank" rel="noopener">Printable test with answer key</a>` : ''}</span></div>`).join('')}</div>` : ''}
  ${docs.length ? `<h2 class="headline small">Guides</h2><div class="grid3">${docs.map(r => tile(r, true)).join('')}</div>` : ''}</div></div></section>` };
}
function extras(c) {
  const ex = extrasOf(c); if (!ex.length) return notFound();
  const v = grid(ex[0], c); v.title = `Extra videos · ${c.title}`; v.crumbs = trail(c, ['Extra videos']); return v;
}
/* a collection (curated YouTube lessons): a grid of video cards with a pop-up player */
function vcard(c, L) {
  return `<button class="yt rv" data-c="${c.id}" data-l="${esc(L.id)}"><span class="ytimg"><img src="${thumbOf(c, L)}" alt="" loading="lazy"><span class="play">${PLAY}</span>${L.minutes ? `<span class="dur">${L.minutes} min</span>` : ''}${Store.isDone(c.id, L.id) ? '<span class="seen-mark">✓<span class="sr"> Watched</span></span>' : ''}</span>
  <span class="ytx"><small>${esc(L.by || L.kind || '')}</small><b>${esc(L.title)}</b>${L.summary ? `<span>${esc(L.summary)}</span>` : ''}</span></button>`;
}
function grid(c, parent) {
  const [h1a, h1b] = c.headline || [c.title, ''];
  const groups = secsOf(c).map(s => `<div class="egroup"><p class="eyebrow">${esc(s.summary || '')}</p><h2 class="headline small2">${esc(s.title)}</h2><div class="ytgrid">${vids(s).map(L => vcard(c, L)).join('')}</div></div>`).join('');
  return { title: c.title, crumbs: parent ? null : trail(c), html: `<section><div class="band dark ehero"><div class="in">
  <p class="eyebrow center">Extra videos</p><h1 class="display center">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
  <p class="sub center wide">${esc(c.intro || c.subtitle)}</p><div class="who">${(c.who || []).map(w => `<span>${esc(w)}</span>`).join('')}</div></div></div>
  <div class="band"><div class="in">${groups}<p class="note">These videos play from YouTube and belong to their creators. Kalam CX isn't affiliated with these channels.</p>
  ${parent ? `<div class="ctas"><a class="pill" href="#/${parent.id}">Back to ${esc(parent.title)}</a></div>` : ''}</div></div></section>`,
    after() { $$('.yt').forEach(b => b.addEventListener('click', () => openVideo(b))); } };
}
let lastBtn = null;
function openVideo(b) {
  const c = App.courses[b.dataset.c], L = c.sections.flatMap(s => s.lessons).find(l => l.id === b.dataset.l); if (!L) return;
  lastBtn = b; const m = $('#ytm'), fr = $('.ytframe', m);
  if (frameSrc(L)) {
    fr.innerHTML = `<iframe src="${esc(frameSrc(L, true))}" title="${esc(L.title)} (video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $('#ytl').hidden = L.type !== 'youtube'; if (L.type === 'youtube') $('#ytl').href = 'https://www.youtube.com/watch?v=' + L.yt; Store.setDone(c.id, L.id);
  } else {
    fr.innerHTML = `<video controls autoplay playsinline src="${esc(media(c, L.src))}" poster="${esc(media(c, L.poster))}" aria-label="Video: ${esc(L.title)}"></video>`;
    const v = $('video', fr); v.addEventListener('timeupdate', () => { if (v.duration && v.currentTime / v.duration > 0.9) Store.setDone(c.id, L.id); });
    $('#ytl').hidden = true;
  }
  $('#ytt').textContent = L.title; $('#ytc').textContent = L.by || L.kind || '';
  m.hidden = false; document.body.style.overflow = 'hidden'; $('#ytx').focus();
}
function closeYt() {
  const m = $('#ytm'); if (m.hidden) return; m.hidden = true; $('.ytframe', m).innerHTML = ''; document.body.style.overflow = '';
  if (lastBtn) { const c = App.courses[lastBtn.dataset.c]; if (Store.isDone(c.id, lastBtn.dataset.l) && !$('.seen-mark', lastBtn)) $('.ytimg', lastBtn).insertAdjacentHTML('beforeend', '<span class="seen-mark">✓<span class="sr"> Watched</span></span>'); lastBtn.focus(); }
}
$('#ytx').addEventListener('click', closeYt);
$('#ytm').addEventListener('click', e => { if (e.target.id === 'ytm') closeYt(); });
/* keep keyboard focus inside the pop-up player while it is open */
$('#ytm').addEventListener('keydown', e => { if (e.key !== 'Tab') return; const f = $$('#ytm a:not([hidden]),#ytm button,#ytm iframe,#ytm video'); const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeYt(); if ($('#nav').classList.contains('open')) { $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false'); $('#menu').focus(); } } });
addEventListener('hashchange', closeYt);
$('#menu').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded', o); });
$('#skip').addEventListener('click', e => { e.preventDefault(); const h = $('#app h1'); if (h) { h.tabIndex = -1; h.focus(); } });
boot();
