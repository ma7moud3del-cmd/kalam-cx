/* Kalam CX Academy: one simple, Apple-style look for every training.
   Structure: Academy › Topic › Training › Session › Video.
   Content lives in data only: data/catalog.json lists topics and trainings; each training is courses/<id>/course.json
   (course → sections → lessons → resources / tests). Adding a training = adding data, no code changes.
   See CONTENT.md in the builder repo for every field. Learner progress stays in this browser (localStorage). */
'use strict';
document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CHEV = '<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" opacity=".12"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const App = { cat: null, courses: {}, entries: {}, order: [], people: {}, topics: [] };
const RESERVED = ['trainings', 'topics', 'my'];

/* ---------- progress (this browser only) ---------- */
const Store = (() => {
  const KEY = 'kalam.academy.v2'; let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (!s || s.v !== 2) s = { v: 2, courses: {} };
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const C = id => s.courses[id] || (s.courses[id] = { done: {}, answers: {} });
  return {
    isDone: (c, l) => !!C(c).done[l], setDone(c, l) { if (!C(c).done[l]) { C(c).done[l] = Date.now(); save(); } },
    answer(c, q, rev) { const a = C(c).answers[q]; return a && a.r === (rev || 1) ? a.c : undefined; },
    setAnswer(c, q, rev, v) { C(c).answers[q] = { c: v, r: rev || 1 }; C(c).at = Date.now(); save(); },
    reset(c, qs) { qs.forEach(q => delete C(c).answers[q]); save(); },
    /* where the learner was last in a training: powers "Resume" and "Continue where you left off" */
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
const vids = sec => sec.lessons.filter(l => l.type === 'video' || l.type === 'youtube' || l.type === 'embed');
/* video files: a relative path is served from the site, or from "mediaBase" (catalog platform or course) when videos move to another host */
const media = (c, p) => !p ? '' : /^(https?:)?\/\//.test(p) ? p : (c.mediaBase || App.cat.platform.mediaBase || '') + (c.base || '') + p;
/* players that are web pages (YouTube, SharePoint/Stream, Vimeo…) play in an iframe */
const frameSrc = (L, auto) => L.type === 'youtube' ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(L.yt)}?rel=0${auto ? '&autoplay=1' : ''}` : L.type === 'embed' ? L.embed : '';
const thumbOf = (c, L) => L.type === 'youtube' ? `https://i.ytimg.com/vi/${esc(L.yt)}/hqdefault.jpg` : L.poster ? esc(media(c, L.poster)) : 'img/kalam-mark.png';
const quizOf = sec => sec.lessons.find(l => l.type === 'quiz');
const isExamSec = s => s.id === 'final' || (s.lessons.length && s.lessons.every(l => l.type === 'exam'));
const secsOf = c => c.sections.filter(s => !isExamSec(s));
const examOf = c => c.sections.find(isExamSec);
const people = c => (c.instructors || []).map(i => App.people[i]).filter(Boolean);
const mins = c => c.sections.reduce((n, s) => n + vids(s).reduce((m, v) => m + (v.minutes || 0), 0), 0);
const word = c => (c.labels && c.labels.section) || 'Session';                 /* "Session", "Module", "Week"… */
const LANG = { ar: 'Arabic', en: 'English', fr: 'French' };
const langShort = c => c.languageShort || LANG[c.language] || c.languageLabel || '';
const hours = m => m >= 60 ? `${(m / 60).toFixed(1)} hours` : `${m} min`;
const topicOf = c => App.topics.find(t => t.id === (App.entries[c.id]?.topic || c.category));
const extrasOf = c => App.order.map(id => App.courses[id]).filter(x => x.partOf === c.id);   /* e.g. Expert Picks belongs to Excel */
/* files for a session: explicit "files" in course.json, else the older convention (first workbook, PDF titled "slides", test PDF) */
function filesOf(c, sec) {
  const f = sec.files || {}, pr = sec.lessons.find(l => l.type === 'practice'), q = quizOf(sec);
  const R = (pr && pr.resources) || [];
  const wb = f.workbook || (R.find(r => r.type === 'xlsx') || {}).href, sl = f.slides || (R.find(r => /slides/i.test(r.title)) || {}).href;
  const tp = f.testPdf || ((q && q.resources) || [])[0]?.href;
  return { workbook: wb && url(c, wb), slides: sl && url(c, sl), testPdf: tp && url(c, tp), practice: f.practice || pr?.body?.[0] };
}
function passed(c, q) { const ok = q.questions.filter(x => Store.answer(c.id, x.id, x.rev) === x.a).length; return ok >= q.pass; }
function progress(c) {
  const ss = secsOf(c), all = ss.flatMap(vids), watched = all.filter(v => Store.isDone(c.id, v.id)).length;
  const qs = ss.map(quizOf).filter(Boolean), pass = qs.filter(q => passed(c, q)).length;
  const last = Store.last(c.id); let sec = last && ss.find(s => s.id === last.s), lesson = last && last.l;
  if (!sec) { sec = ss.find(s => vids(s).some(v => !Store.isDone(c.id, v.id))) || ss[0]; lesson = ''; }
  const units = all.length + qs.length, doneUnits = watched + pass;
  return { watched, total: all.length, tests: qs.length, pass, pct: units ? Math.round(100 * doneUnits / units) : 0, started: Store.started(c.id),
    resume: sec ? `#/${c.id}/${sec.id}${lesson ? '/' + lesson : ''}` : `#/${c.id}`, resumeSec: sec };
}
const bar = p => `<span class="pbar" role="img" aria-label="${p}% complete"><i style="width:${p}%"></i></span>`;

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
/* trainings shown in lists: live and coming-soon, but not collections that belong to another training */
const listed = () => App.order.map(id => App.courses[id]).filter(c => !c.partOf);

/* ---------- routes ----------
   #/  #/trainings  #/topics/<topic>  #/my
   #/<training>  #/<training>/<section>[/<lesson>|/test]  #/<training>/exam  #/<training>/library  #/<training>/extras */
function legacy(h) {
  if (h === '' || h === '#' || h === '#home') return '#/';
  let m = h.match(/^#(session|test)-(\d)$/); if (m) return `#/excel/s${m[2]}${m[1] === 'test' ? '/test' : ''}`;
  if (h === '#exam') return '#/excel/exam'; if (h === '#library') return '#/excel/library'; if (h === '#experts') return '#/excel/extras';
  if ((m = h.match(/^#\/course\/([\w-]+)/))) return '#/' + m[1];
  if ((m = h.match(/^#\/learn\/([\w-]+)\/(s\d)-quiz/))) return `#/${m[1]}/${m[2]}/test`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/final-exam/))) return `#/${m[1]}/exam`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((s\d)-[\w-]+)/))) return `#/${m[1]}/${m[3]}/${m[2]}`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((e\d)-\d+)/))) return `#/${m[1]}`;
  if (/^#\/courses/.test(h)) return '#/trainings';
  if (/^#\/(studio|about|instructor)/.test(h)) return '#/';
  if ((m = h.match(/^#\/([\w-]+)\/?$/)) && App.courses[m[1]]?.partOf) return `#/${App.courses[m[1]].partOf}/extras`;
  return null;
}
let shown = null;   /* null = nothing drawn yet (the home page's key is '') */
function route() {
  if (!App.cat) return;
  const fix = legacy(location.hash); if (fix && fix !== location.hash) { history.replaceState(null, '', fix); }
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const c = RESERVED.includes(parts[0]) ? null : App.courses[parts[0]]; let v;
  if (!parts.length) v = home();
  else if (parts[0] === 'trainings') v = trainings();
  else if (parts[0] === 'topics') v = topicPage(parts[1]);
  else if (parts[0] === 'my') v = myLearning();
  else if (!c) v = notFound();
  else if (c.soon) v = soonPage(c);
  else if (!parts[1] || c.type === 'collection') v = grid(c);
  else if (parts[1] === 'exam') v = exam(c);
  else if (parts[1] === 'library') v = library(c);
  else if (parts[1] === 'extras') v = extras(c);
  else { const sec = secsOf(c).find(s => s.id === parts[1]); v = sec ? section(c, sec, parts[2]) : notFound(); }
  const key = parts.slice(0, 2).join('/');
  if (key !== shown || !$('#app').firstElementChild) { $('#app').innerHTML = v.html; v.after && v.after(); window.scrollTo({ top: 0, behavior: 'instant' }); if (shown !== null) { const h = $('#app h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } } }
  else if (v.update) v.update();
  shown = key;
  if (parts[2] === 'test') setTimeout(() => $('#test')?.scrollIntoView({ behavior: 'instant', block: 'start' }), 60);
  document.title = v.title === 'Kalam CX Academy' ? v.title : `${v.title} · Kalam CX Academy`;
  nav(parts[0] || '', c && !c.soon && c.type !== 'collection' ? c : null, parts[1], v.crumbs);
  reveal($('#app'));
}
addEventListener('hashchange', route);
/* global nav (Home · Trainings · My learning) + a local bar for the open training: breadcrumb on the left, its pages on the right */
function nav(top, c, cur, crumbs) {
  const g = [['Home', '#/', top === ''], ['Trainings', '#/trainings', top === 'trainings' || top === 'topics' || !!App.courses[top]], ['My learning', '#/my', top === 'my']];
  $('#nav').innerHTML = g.map(([t, h, on]) => `<a href="${h}"${on ? ' aria-current="page" class="on"' : ''}>${esc(t)}</a>`).join('');
  $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false');
  const ln = $('#lnav');
  if (!crumbs && !c) { ln.hidden = true; ln.innerHTML = ''; return; }
  const trail = crumbs || [];
  const links = c ? [['Overview', `#/${c.id}`, !cur], ...secsOf(c).map((s, i) => [`${word(c)} ${i + 1}`, `#/${c.id}/${s.id}`, cur === s.id]),
    ...(examOf(c) ? [['Final exam', `#/${c.id}/exam`, cur === 'exam']] : []), ...(extrasOf(c).length ? [['Extra videos', `#/${c.id}/extras`, cur === 'extras']] : []),
    ...((c.resources || []).length ? [['Library', `#/${c.id}/library`, cur === 'library']] : [])] : [];
  ln.innerHTML = `<div class="in"><nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map(([t, h], i) => `<li>${h && i < trail.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>
  ${links.length ? `<nav class="lpages" aria-label="${esc(c.title)}">${links.map(([t, h, on]) => `<a href="${h}"${on ? ' aria-current="page" class="on"' : ''}>${esc(t)}</a>`).join('')}</nav>` : ''}</div>`;
  ln.hidden = false;
  const on = $('.lpages a.on', ln); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
}
/* breadcrumb trail for a training page: Academy › Topic › Training [› page] */
function trail(c, ...more) {
  const t = topicOf(c), out = [['Academy', '#/']];
  if (t) out.push([t.name, `#/topics/${t.id}`]);
  out.push([c.navTitle || c.title, `#/${c.id}`]);
  return out.concat(more);
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
function reveal(scope) { $$('.rv:not(.seen)', scope).forEach(el => io ? io.observe(el) : el.classList.add('seen')); setTimeout(() => { if (!$('.rv.seen', scope)) $$('.rv', scope).forEach(el => el.classList.add('seen')); }, 2500); }
const notFound = () => ({ title: 'Page not found', html: '<section class="band"><div class="in narrow center"><h1 class="display">This page isn\'t here.</h1><p class="sub center">The link may be old.</p><a class="pill big" href="#/">Go to the Academy</a></div></section>' });

/* ---------- training cards, grouped by topic ---------- */
function coverOf(c) {
  if (c.cover) return `<img src="${esc(url(c, c.cover))}" alt="" loading="lazy">`;
  const yt = c.sections.length ? vids(c.sections[0]).filter(v => v.yt).slice(0, 4) : [];
  if (yt.length) return `<span class="ytmosaic">${yt.map(v => `<img src="https://i.ytimg.com/vi/${esc(v.yt)}/hqdefault.jpg" alt="" loading="lazy">`).join('')}</span>`;
  return '<span class="blank"><img src="img/kalam-mark.png" alt=""></span>';
}
function ccard(c) {
  const t = topicOf(c);
  if (c.soon) return `<div class="ccard soon rv"><span class="cimg">${coverOf(c)}<span class="tag">Coming soon</span></span><span class="cx"><small>${esc(t?.name || 'Training')}</small><b>${esc(c.title)}</b><span class="cs">${esc(c.subtitle || '')}</span>${c.level ? `<span class="cm">${esc(c.level)}</span>` : ''}</span></div>`;
  const n = c.sections.reduce((a, s) => a + vids(s).length, 0), m = mins(c), p = progress(c);
  const meta = [c.level, m ? hours(m) : `${n} videos`, langShort(c)].filter(Boolean).map(esc).join(' · ');
  return `<a class="ccard rv" href="#/${c.id}"><span class="cimg">${coverOf(c)}<span class="play">${PLAY}</span></span><span class="cx"><small>${esc(t?.name || 'Training')}</small><b>${esc(c.title)}</b><span class="cs">${esc(c.subtitle || '')}</span>
  <span class="cm">${meta}</span>${p.started ? `<span class="cp">${bar(p.pct)}<span>${p.pct}% done</span></span>` : ''}</span></a>`;
}
function topicBlocks(only, cap) {
  const all = listed(), groups = App.topics.filter(t => !only || t.id === only).map(t => [t, all.filter(c => (App.entries[c.id]?.topic || c.category) === t.id)]).filter(([, l]) => l.length);
  const loose = only ? [] : all.filter(c => !App.topics.some(t => t.id === (App.entries[c.id]?.topic || c.category)));
  if (loose.length) groups.push([{ id: '', name: 'More trainings' }, loose]);
  return groups.map(([t, l]) => `<section class="topic"${only ? '' : ` aria-labelledby="t-${esc(t.id)}"`}>${only ? '' : `<div class="th2"><h2 class="headline small2 rv" id="t-${esc(t.id)}">${esc(t.name)}</h2>
  ${t.id && cap && l.length > cap ? `<a class="link rv" href="#/topics/${esc(t.id)}">See all ${l.length} ${CHEV}</a>` : ''}</div>${t.blurb ? `<p class="tblurb rv">${esc(t.blurb)}</p>` : ''}`}
  <div class="cgrid">${l.slice(0, cap || l.length).map(ccard).join('')}</div></section>`).join('');
}
function continueRow() {
  const l = listed().filter(c => !c.soon && c.type !== 'collection' && Store.started(c.id)).sort((a, b) => Store.at(b.id) - Store.at(a.id)).slice(0, 3);
  if (!l.length) return '';
  return `<div class="band tight"><div class="in"><h2 class="headline small2 rv">Continue where you left off.</h2><div class="rows">${l.map(resumeRow).join('')}</div></div></div>`;
}
function resumeRow(c) {
  const p = progress(c), s = p.resumeSec, i = s ? secsOf(c).indexOf(s) : -1;
  return `<div class="rrow rv"><a class="rimg" href="#/${c.id}" tabindex="-1" aria-hidden="true">${coverOf(c)}</a><div class="rx"><small>${esc(topicOf(c)?.name || 'Training')}</small><a class="rt" href="#/${c.id}">${esc(c.title)}</a>
  <span class="cp">${bar(p.pct)}<span>${p.watched} of ${p.total} videos${p.tests ? ` · ${p.pass} of ${p.tests} tests passed` : ''}</span></span></div>
  <a class="pill" href="${p.resume}">${p.pct ? 'Resume' : 'Start'}${i >= 0 ? `<span class="sr"> ${esc(c.title)},</span> ${word(c)} ${i + 1}` : ''}</a></div>`;
}

/* ---------- Academy home, all trainings, one topic, my learning ---------- */
function home() {
  const P = App.cat.platform, first = listed().find(c => !c.soon && c.type !== 'collection');
  return { title: 'Kalam CX Academy', html: `<section class="hero"><div class="in">
  <p class="eyebrow center rv">${esc(P.name || 'Kalam CX Academy')}</p>
  <h1 class="mega center rv">Learn it.<br><span class="grad">Use it on the floor.</span></h1>
  <p class="sub center wide rv">${esc(P.intro)}</p>
  <div class="ctas rv"><a class="pill big" href="#/trainings">Browse trainings</a>${first ? `<a class="link big" href="#/${first.id}">Start with ${esc(first.navTitle || first.title)} ${CHEV}</a>` : ''}</div></div></section>
 ${continueRow()}
 <div class="band"><div class="in">${topicBlocks(null, 3)}<p class="soonnote rv">More trainings are on the way. Each one appears here, under its topic, with the same simple layout.</p></div></div>
 <div class="band gray"><div class="in"><h2 class="headline center rv">How it works.</h2>
  <div class="steps"><div class="rv"><b>1</b><h3>Pick a training</h3><p>Every training is free and opens in your browser.</p></div><div class="rv"><b>2</b><h3>Watch</h3><p>Short videos with the trainer's own voice.</p></div><div class="rv"><b>3</b><h3>Practise</h3><p>Repeat each step with the practice files.</p></div><div class="rv"><b>4</b><h3>Test</h3><p>Self-marking tests. Your progress stays in this browser.</p></div></div></div></div>` };
}
function trainings() {
  return { title: 'All trainings', crumbs: [['Academy', '#/'], ['All trainings']], html: `<section><div class="band slim"><div class="in">
  <h1 class="display rv">All trainings.</h1><p class="sub wide rv">${esc(App.cat.platform.tagline || '')} Grouped by topic. All free.</p>${topicBlocks()}</div></div></section>` };
}
function topicPage(id) {
  const t = App.topics.find(x => x.id === id); if (!t) return notFound();
  return { title: t.name, crumbs: [['Academy', '#/'], ['All trainings', '#/trainings'], [t.name]], html: `<section><div class="band slim"><div class="in">
  <p class="eyebrow rv">Topic</p><h1 class="display rv">${esc(t.name)}.</h1>${t.blurb ? `<p class="sub wide rv">${esc(t.blurb)}</p>` : ''}${topicBlocks(id)}</div></div></section>` };
}
function myLearning() {
  const l = listed().filter(c => !c.soon && Store.started(c.id)).sort((a, b) => Store.at(b.id) - Store.at(a.id));
  const ext = App.order.map(id => App.courses[id]).filter(c => c.partOf && Store.started(c.id));
  return { title: 'My learning', crumbs: [['Academy', '#/'], ['My learning']], html: `<section><div class="band slim"><div class="in narrow">
  <h1 class="display rv">My learning.</h1><p class="sub wide rv">Saved in this browser only. On another phone or laptop you start fresh.</p>
  ${l.length ? `<div class="rows">${l.filter(c => c.type !== 'collection').map(resumeRow).join('')}</div>` : `<div class="card center rv"><h3>Nothing started yet.</h3><p>Pick a training and press play. It will show up here with your progress.</p><a class="pill" href="#/trainings">Browse trainings</a></div>`}
  ${ext.length ? `<p class="note">Also watched: ${ext.map(c => `<a href="#/${c.partOf}/extras">${esc(c.title)}</a>`).join(', ')}.</p>` : ''}</div></div></section>` };
}
function soonPage(c) {
  const t = topicOf(c);
  return { title: c.title, crumbs: [['Academy', '#/'], ...(t ? [[t.name, `#/topics/${t.id}`]] : []), [c.title]], html: `<section><div class="band"><div class="in narrow center">
  <p class="eyebrow center">Coming soon</p><h1 class="display center">${esc(c.title)}</h1><p class="sub center wide">${esc(c.subtitle || 'This training is being prepared.')}</p>
  <a class="pill big" href="#/trainings">See the trainings you can take now</a></div></div></section>` };
}

/* ---------- session page (dark player + playlist, topics, practice, test) ---------- */
function section(c, sec, lessonId) {
  const ss = secsOf(c), i = ss.indexOf(sec), list = vids(sec), q = quizOf(sec), F = filesOf(c, sec), W = word(c);
  const nextSec = ss[i + 1], nextLink = nextSec ? `<a class="link" href="#/${c.id}/${nextSec.id}">Next: ${W} ${i + 2} ${CHEV}</a>` : examOf(c) ? `<a class="link" href="#/${c.id}/exam">Next: the final exam ${CHEV}</a>` : `<a class="link" href="#/${c.id}">Back to the overview ${CHEV}</a>`;
  let cur = Math.max(0, list.findIndex(v => v.id === lessonId));
  const html = `<section class="page-session">
 <div class="band dark"><div class="in">
  <p class="eyebrow">${W} ${i + 1}</p><h1 class="display">${esc(sec.title)}</h1><p class="sub">${esc(sec.blurb || sec.summary)}</p>
  ${list.length ? `<div class="player rv"><div class="screen" id="screen"></div>
  <aside class="list" aria-label="${W} videos"><div class="lh"><b>Up next</b><span>${list.length} videos · ${list.reduce((a, v) => a + (v.minutes || 0), 0)} min</span></div><ol id="pl"></ol>${sec.note ? `<p class="soon">${esc(sec.note)}</p>` : ''}</aside></div>
  <div class="nowbar"><div><span class="lbl" id="nk"></span><b id="nt"></b></div><label class="auto"><input type="checkbox" id="auto" checked><span class="sw"></span>Autoplay next</label></div>` : ''}
 </div></div>
 ${(sec.topics || []).length || F.workbook || F.slides ? `<div class="band"><div class="in">${(sec.topics || []).length ? `<h2 class="headline rv">What you'll be able to do.</h2>
  <div class="feats">${sec.topics.map(([a, b]) => `<div class="feat rv"><span class="ic">${CHECK}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div>` : ''}
  <div class="duo rv">${F.workbook ? `<div class="card"><p class="eyebrow">Practise</p><h3>Do it yourself.</h3><p>${esc(F.practice || 'Practise each step on your own copy of the data.')}</p><a class="link" href="${esc(F.workbook)}">Download the workbook ${CHEV}</a></div>` : ''}
  ${F.slides || F.testPdf ? `<div class="card"><p class="eyebrow">Review</p><h3>Keep the slides.</h3><p>Every slide from this ${W.toLowerCase()} in one PDF${F.testPdf ? ', with a printable copy of the test' : ''}.</p>${F.slides ? `<a class="link" href="${esc(F.slides)}" target="_blank" rel="noopener">Open the slides ${CHEV}</a>` : ''}${F.testPdf ? `<a class="link" href="${esc(F.testPdf)}" target="_blank" rel="noopener">Printable test ${CHEV}</a>` : ''}</div>` : ''}</div></div></div>` : ''}
 ${q ? `<div class="band gray" id="test"><div class="in narrow">
  <p class="eyebrow center">${W} ${i + 1} test</p><h2 class="headline center">Check what stuck.</h2>
  <p class="sub center">${q.questions.length} questions. Pass mark ${q.pass}. Each answer is marked instantly, with the reason.</p>${q.note ? `<p class="note center">${esc(q.note)}</p>` : ''}
  <div class="scorecard"><div class="ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="trk"/><circle cx="18" cy="18" r="15.9" class="val" id="ring"/></svg><b id="rn">0</b></div><div><b class="score" id="score" role="status" aria-live="polite"></b><button class="link btnlink" data-act="reset">Start over</button></div></div>
  <div class="quiz" id="quiz"></div>
  <div class="center nextnav">${nextLink}</div></div></div>` : `<div class="band slim"><div class="in center nextnav">${nextLink}</div></div>`}</section>`;
  const v = () => $('#vid');
  function load(k, play) {
    cur = k; const L = list[k];
    if (frameSrc(L)) {
      $('#screen').innerHTML = `<iframe src="${esc(frameSrc(L, play))}" title="${esc(L.title)} (video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
      if (play) { Store.setDone(c.id, L.id); }
    } else {
      if (!v()) { $('#screen').innerHTML = '<video id="vid" controls playsinline preload="metadata"></video>'; wire(); }
      v().src = media(c, L.src); v().poster = media(c, L.poster); v().setAttribute('aria-label', 'Video: ' + L.title);
      if (play) v().play().catch(() => {});
    }
    $('#nk').textContent = `${L.kind || L.by || ''}${L.minutes ? ' · ' + L.minutes + ' min' : ''}`; $('#nt').textContent = L.title; drawList();
    Store.visit(c.id, sec.id, L.id);
  }
  function wire() {
    const el = v();
    el.addEventListener('timeupdate', () => { if (el.isConnected && el.duration && el.currentTime / el.duration > 0.9 && !Store.isDone(c.id, list[cur].id)) { Store.setDone(c.id, list[cur].id); drawList(); } });
    el.addEventListener('ended', () => { if (!el.isConnected) return; Store.setDone(c.id, list[cur].id); if ($('#auto').checked && cur < list.length - 1) { load(cur + 1, true); history.replaceState(null, '', `#/${c.id}/${sec.id}/${list[cur].id}`); } else drawList(); });
  }
  const thumb = L => thumbOf(c, L);
  function drawList() {
    $('#pl').innerHTML = list.map((L, k) => `<li class="${k === cur ? 'on' : ''}"><button data-k="${k}" ${k === cur ? 'aria-current="true"' : ''}><span class="th"><img src="${thumb(L)}" alt="" loading="lazy">${L.minutes ? `<span class="d">${L.minutes} min</span>` : ''}${Store.isDone(c.id, L.id) ? '<span class="w" aria-label="Watched">✓</span>' : ''}</span><span class="tt"><b>${esc(L.title)}</b><small>${esc(L.kind || L.by || '')}</small></span></button></li>`).join('');
  }
  function drawQuiz() {
    if (!q) return;
    $('#quiz').innerHTML = q.questions.map((x, n) => qcard(c, x, n, q.questions.length)).join(''); score();
  }
  function score() {
    const ans = q.questions.map(x => Store.answer(c.id, x.id, x.rev)), done = ans.filter(a => a !== undefined).length, ok = q.questions.filter((x, n) => ans[n] === x.a).length, tot = q.questions.length;
    const el = $('#score'); el.innerHTML = done === 0 ? 'Answer the first question to begin.' : `${ok} of ${done} correct` + (done < tot ? ` · ${tot - done} to go` : ok >= q.pass ? ' <span class="pass">· Passed</span>' : ` <span class="fail">· Pass mark is ${q.pass}. Review and try again.</span>`);
    $('#ring').style.strokeDasharray = Math.round(100 * ok / tot) + ' 100'; $('#rn').textContent = ok;
    if (done === tot) Store.setDone(c.id, q.id);
  }
  return { title: `${W} ${i + 1}: ${sec.title} · ${c.title}`, crumbs: trail(c, [`${W} ${i + 1}`]), html, after() {
    if (list.length) {
      load(cur, false);
      $('#pl').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) { load(+b.dataset.k, true); history.replaceState(null, '', `#/${c.id}/${sec.id}/${list[+b.dataset.k].id}`); } });
    } else Store.visit(c.id, sec.id, '');
    drawQuiz();
    if (q) $('#test').addEventListener('click', e => {
      const b = e.target.closest('button.o'); if (b && b.getAttribute('aria-disabled') !== 'true') { const x = q.questions.find(y => y.id === b.dataset.q); Store.setAnswer(c.id, x.id, x.rev, +b.dataset.j);
        const n = q.questions.indexOf(x); $(`#q-${x.id}`).outerHTML = qcard(c, x, n, q.questions.length); score(); $(`#q-${x.id} .ex`).focus(); }
      if (e.target.closest('[data-act="reset"]')) { Store.reset(c.id, q.questions.map(y => y.id)); drawQuiz(); $('#quiz .o')?.focus(); }
    });
  }, update() { const k = list.findIndex(x => x.id === lessonId); if (k >= 0 && k !== cur) load(k, false); } };
}
function qcard(c, x, n, tot) {
  const a = Store.answer(c.id, x.id, x.rev), done = a !== undefined;
  return `<fieldset class="q" id="q-${x.id}"><legend><span class="qn">Question ${n + 1} of ${tot}</span><span class="qt">${esc(x.q)}</span></legend><div class="opts">${x.o.map((o, j) => {
    const cls = done ? (j === x.a ? 'ok' : j === a ? 'no' : '') : '', sr = done ? (j === x.a ? '<span class="sr"> (correct answer)</span>' : j === a ? '<span class="sr"> (your answer, incorrect)</span>' : '') : '';
    return `<button type="button" class="o ${cls}" data-q="${x.id}" data-j="${j}" ${done ? 'aria-disabled="true"' : ''}><span class="k" aria-hidden="true">${'ABCD'[j]}</span><span>${esc(o)}${sr}</span></button>`; }).join('')}</div>
  ${done ? `<p class="ex" tabindex="-1"><b>${a === x.a ? 'Correct.' : 'Not quite.'}</b> ${esc(x.e)}</p>` : ''}</fieldset>`;
}

/* ---------- final exam, library, extra videos ---------- */
function exam(c) {
  const L = examOf(c)?.lessons[0]; if (!L) return notFound();
  const wb = (L.resources || []).find(r => r.type === 'xlsx'), pdf = (L.resources || []).find(r => r.type === 'pdf');
  return { title: `Final exam · ${c.title}`, crumbs: trail(c, ['Final exam']), html: `<section><div class="band"><div class="in narrow">
  <p class="eyebrow center">Final exam</p><h1 class="display center">${esc(L.headline || 'Prove it.')}</h1>
  <p class="sub center">${esc(L.intro || 'Open the workbook, complete every task, then reveal the answer key.')}${L.minutes ? ` ${esc(L.minutes)} minutes.` : ''}</p>
  <div class="ctas">${pdf ? `<a class="pill" href="${esc(url(c, pdf.href))}" target="_blank" rel="noopener">Printable exam</a>` : ''}${wb ? `<a class="link" href="${esc(url(c, wb.href))}">Download the workbook ${CHEV}</a>` : ''}</div>
  <h2 class="headline small">The tasks</h2><div class="card exam">${L.html || ''}</div>
  ${L.keyHtml ? `<div class="center"><button class="pill ghost" id="keybtn" aria-expanded="false" aria-controls="key">Show the answer key</button></div>
  <div id="key" class="card key" hidden>${L.keyHtml}</div>` : ''}</div></div></section>`,
    after() { $$('.exam table,.key table').forEach(t => { const w = document.createElement('div'); w.className = 'tw'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
      if ($('#keybtn')) $('#keybtn').onclick = e => { const k = $('#key'); k.hidden = !k.hidden; e.target.setAttribute('aria-expanded', !k.hidden); e.target.textContent = k.hidden ? 'Show the answer key' : 'Hide the answer key'; }; } };
}
function library(c) {
  const files = (c.resources || []).filter(r => r.type === 'xlsx'), docs = (c.resources || []).filter(r => r.type !== 'xlsx');
  const tile = (r, open) => `<a class="doc ${r.type === 'xlsx' ? 'xl' : ''}" href="${esc(url(c, r.href))}" ${open ? 'target="_blank" rel="noopener"' : ''}><span class="badge">${esc(r.type.toUpperCase())}</span><b>${esc(r.title)}</b><span>${esc(r.summary || '')}</span><span class="link">${open ? 'Open' : 'Download'} ${CHEV}</span></a>`;
  return { title: `Library · ${c.title}`, crumbs: trail(c, ['Library']), html: `<section><div class="band"><div class="in">
  <p class="eyebrow center">Library</p><h1 class="display center">Guides and practice files.</h1>
  ${files.length ? `<h2 class="headline small">Practice files</h2><div class="grid3">${files.map(r => tile(r, false)).join('')}</div>` : ''}
  ${docs.length ? `<h2 class="headline small">Guides</h2><div class="grid3">${docs.map(r => tile(r, true)).join('')}</div>` : ''}</div></div></section>` };
}
function extras(c) {
  const ex = extrasOf(c); if (!ex.length) return notFound();
  const v = grid(ex[0], c); v.title = `Extra videos · ${c.title}`; v.crumbs = trail(c, ['Extra videos']); return v;
}

/* ---------- training page: header, then each session as a grid of video cards (pop-up player) ---------- */
function vcard(c, L) {
  const img = thumbOf(c, L);
  const by = L.type === 'youtube' ? L.by : L.kind;
  return `<button class="yt rv" data-c="${c.id}" data-l="${esc(L.id)}"><span class="ytimg"><img src="${img}" alt="" loading="lazy"><span class="play">${PLAY}</span>${L.minutes ? `<span class="dur">${L.minutes} min</span>` : ''}${Store.isDone(c.id, L.id) ? '<span class="seen-mark">✓<span class="sr"> Watched</span></span>' : ''}</span>
  <span class="ytx"><small>${esc(by || '')}</small><b>${esc(L.title)}</b>${L.summary && L.type === 'youtube' ? `<span>${esc(L.summary)}</span>` : ''}</span></button>`;
}
function grid(c, parent) {
  const isCol = c.type === 'collection', secs = secsOf(c), ex = examOf(c), W = word(c);
  const nv = secs.reduce((a, s) => a + vids(s).length, 0), m = mins(c);
  const [h1a, h1b] = c.headline || [c.title, ''];
  const trainer = people(c).filter(p => !p.external)[0], p = isCol ? null : progress(c);
  const groups = secs.map((s, i) => {
    const q = quizOf(s), F = filesOf(c, s), vs = vids(s), w = vs.filter(v => Store.isDone(c.id, v.id)).length;
    const qs = q && q.questions.some(x => Store.answer(c.id, x.id, x.rev) !== undefined) ? (passed(c, q) ? '<span class="ok">Test passed</span>' : 'Test started') : '';
    const acts = isCol ? '' : `<div class="gacts"><a class="pill" href="#/${c.id}/${s.id}">Open ${W.toLowerCase()} ${i + 1}</a>${q ? `<a class="link" href="#/${c.id}/${s.id}/test">Take the test ${CHEV}</a>` : ''}${F.workbook ? `<a class="link" href="${esc(F.workbook)}">Practice workbook ${CHEV}</a>` : ''}${F.slides ? `<a class="link" href="${esc(F.slides)}" target="_blank" rel="noopener">Slides ${CHEV}</a>` : ''}</div>`;
    return `<div class="egroup"><p class="eyebrow">${isCol ? esc(s.summary || '') : `${W} ${i + 1} · ${vs.length} videos · ${vs.reduce((a, v) => a + (v.minutes || 0), 0)} min`}</p>
    <h2 class="headline small2">${esc(s.title)}</h2>${!isCol && (w || qs) ? `<p class="gprog">${bar(Math.round(100 * w / (vs.length || 1)))}<span>${w} of ${vs.length} watched${qs ? ' · ' + qs : ''}</span></p>` : ''}${acts}${s.note ? `<p class="gnote">${esc(s.note)}</p>` : ''}<div class="ytgrid">${vs.map(L => vcard(c, L)).join('')}</div></div>`;
  }).join('');
  const extra = isCol ? [] : extrasOf(c), outcomes = isCol ? [] : (c.outcomes || []);
  return { title: c.title, crumbs: parent ? null : trail(c), html: `<section><div class="band dark ehero"><div class="in">
  <p class="eyebrow center">${isCol ? 'Extra videos' : esc(topicOf(c)?.name || 'Training')}</p><h1 class="display center">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
  <p class="sub center wide">${esc(c.intro || c.subtitle)}</p>
  <div class="who">${isCol ? (c.who || []).map(w => `<span>${esc(w)}</span>`).join('') : `${trainer ? `<span class="tchip">${trainer.photo ? `<img src="${esc(trainer.photo)}" alt="">` : ''}${esc(trainer.name)}</span>` : ''}${c.levelRange || c.level ? `<span>${esc(c.levelRange || c.level)}</span>` : ''}<span>${nv} videos</span>${m ? `<span>${hours(m)}</span>` : ''}<span>${esc(c.languageLabel)}</span><span>Free</span>`}</div>
  ${p ? `<div class="ctas hcta">${p.started ? `<a class="pill big" href="${p.resume}">Resume ${word(c)} ${secsOf(c).indexOf(p.resumeSec) + 1}</a><span class="hprog">${bar(p.pct)}<span>${p.pct}% done</span></span>` : secs[0] ? `<a class="pill big" href="#/${c.id}/${secs[0].id}">Start ${W} 1</a>` : ''}</div>` : ''}</div></div>
  ${outcomes.length ? `<div class="band gray slim"><div class="in"><h2 class="headline small2 rv">What you'll learn.</h2><ul class="outs">${outcomes.map(o => `<li class="rv"><span class="ic">${CHECK}</span>${esc(o)}</li>`).join('')}</ul></div></div>` : ''}
  <div class="band"><div class="in">${groups}
  ${ex || (c.resources || []).length ? `<div class="egroup endcards"><div class="duo">${ex ? `<div class="card"><p class="eyebrow">Final exam</p><h3>${esc(ex.lessons[0]?.headline || 'Prove it.')}</h3><p>${esc(ex.summary)}</p><a class="link" href="#/${c.id}/exam">Open the exam ${CHEV}</a></div>` : ''}${(c.resources || []).length ? `<div class="card"><p class="eyebrow">Library</p><h3>Guides and practice files.</h3><p>Every workbook, answer key and guide in one place.</p><a class="link" href="#/${c.id}/library">Browse the library ${CHEV}</a></div>` : ''}</div></div>` : ''}
  ${isCol ? '<p class="note">These videos play from YouTube and belong to their creators. Kalam CX isn\'t affiliated with these channels.</p>' : ''}
  ${extra.length ? `<div class="ctas"><a class="pill ghost" href="#/${c.id}/extras">Want more? Watch the extra videos</a></div>` : ''}
  ${parent ? `<div class="ctas"><a class="pill" href="#/${parent.id}">Back to ${esc(parent.title)}</a></div>` : ''}</div></div></section>`,
    after() { $$('.yt').forEach(b => b.addEventListener('click', () => openVideo(b))); } };
}
let lastBtn = null;
function openVideo(b) {
  const c = App.courses[b.dataset.c], L = c.sections.flatMap(s => s.lessons).find(l => l.id === b.dataset.l); if (!L) return;
  lastBtn = b; const m = $('#ytm'), fr = $('.ytframe', m);
  const sec = c.sections.find(s => s.lessons.includes(L)); if (c.type !== 'collection' && sec) Store.visit(c.id, sec.id, L.id);
  if (frameSrc(L)) {
    fr.innerHTML = `<iframe src="${esc(frameSrc(L, true))}" title="${esc(L.title)} (video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $('#ytl').hidden = L.type !== 'youtube'; if (L.type === 'youtube') $('#ytl').href = 'https://www.youtube.com/watch?v=' + L.yt; Store.setDone(c.id, L.id);
  } else {
    fr.innerHTML = `<video controls autoplay playsinline src="${esc(media(c, L.src))}" poster="${esc(media(c, L.poster))}" aria-label="Video: ${esc(L.title)}"></video>`;
    const v = $('video', fr); v.addEventListener('timeupdate', () => { if (v.duration && v.currentTime / v.duration > 0.9) Store.setDone(c.id, L.id); });
    $('#ytl').hidden = true;
  }
  $('#ytt').textContent = L.title; $('#ytc').textContent = L.type === 'youtube' ? L.by : (L.kind || '');
  m.hidden = false; document.body.style.overflow = 'hidden'; $('#ytx').focus();
}
function closeYt() {
  const m = $('#ytm'); if (m.hidden) return; m.hidden = true; $('.ytframe', m).innerHTML = ''; document.body.style.overflow = '';
  if (lastBtn) { const c = App.courses[lastBtn.dataset.c]; if (Store.isDone(c.id, lastBtn.dataset.l) && !$('.seen-mark', lastBtn)) $('.ytimg', lastBtn).insertAdjacentHTML('beforeend', '<span class="seen-mark">✓<span class="sr"> Watched</span></span>'); lastBtn.focus(); }
}
$('#ytx').addEventListener('click', closeYt);
$('#ytm').addEventListener('click', e => { if (e.target.id === 'ytm') closeYt(); });
addEventListener('keydown', e => { if (e.key === 'Escape') { closeYt(); if ($('#nav').classList.contains('open')) { $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false'); $('#menu').focus(); } } });
addEventListener('hashchange', closeYt);
$('#menu').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded', o); });
$('#skip').addEventListener('click', e => { e.preventDefault(); const h = $('#app h1'); if (h) { h.tabIndex = -1; h.focus(); } });
boot();
