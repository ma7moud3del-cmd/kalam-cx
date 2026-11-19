/* Kalam CX Academy, simple edition: one look for every training (the Apple-style Excel design).
   Content: data/catalog.json lists the trainings; each training is courses/<id>/course.json
   (course → sections → lessons → resources / tests). Adding a training = adding data, no code changes.
   Learner progress stays in this browser (localStorage). Nothing is sent anywhere. */
'use strict';
document.documentElement.classList.add('js');
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CHEV = '<svg class="chev" viewBox="0 0 8 14" aria-hidden="true"><path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" opacity=".12"/><path d="M7 12.5l3.2 3.2L17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const App = { cat: null, courses: {}, order: [], people: {} };

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
    setAnswer(c, q, rev, v) { C(c).answers[q] = { c: v, r: rev || 1 }; save(); },
    reset(c, qs) { qs.forEach(q => delete C(c).answers[q]); save(); },
    /* merge progress saved by the earlier one-course Excel site (key "kalamAcademy"); safe to run every visit */
    mergeLegacy(course) {
      if (course.id !== 'excel') return;
      let old = null; try { old = JSON.parse(localStorage.getItem('kalamAcademy') || 'null'); } catch (e) {}
      if (!old) return;
      Object.entries(old.w || {}).forEach(([n, list]) => {
        const sec = course.sections.find(x => x.id === 's' + n); if (!sec) return;
        const vids = sec.lessons.filter(l => l.type === 'video');
        (list || []).forEach(i => { if (vids[i] && !C('excel').done[vids[i].id]) C('excel').done[vids[i].id] = 1; });
      });
      Object.entries(old.q || {}).forEach(([name, ans]) => {
        const n = (name.match(/\d+/) || [])[0];
        Object.entries(ans || {}).forEach(([i, v]) => { const id = `s${n}-q${String(+i + 1).padStart(2, '0')}`; if (!C('excel').answers[id]) C('excel').answers[id] = { c: v, r: 1 }; });
      });
      save();
    }
  };
})();

/* ---------- data ---------- */
const url = (c, p) => !p ? '' : /^(https?:)?\/\//.test(p) ? p : (c.base || '') + p;
const vids = sec => sec.lessons.filter(l => l.type === 'video' || l.type === 'youtube');
const quizOf = sec => sec.lessons.find(l => l.type === 'quiz');
const people = c => (c.instructors || []).map(i => App.people[i]).filter(Boolean);
const mins = c => c.sections.reduce((n, s) => n + vids(s).reduce((m, v) => m + (v.minutes || 0), 0), 0);
async function boot() {
  try {
    App.cat = await (await fetch('data/catalog.json', { cache: 'no-cache' })).json();
    App.cat.instructors.forEach(p => (App.people[p.id] = p));
    const list = await Promise.all(App.cat.courses.map(async r => { try { const c = await (await fetch(r.data, { cache: 'no-cache' })).json(); c.base = c.base || r.data.replace(/course\.json$/, ''); return c; } catch (e) { return null; } }));
    list.filter(Boolean).forEach(c => { App.courses[c.id] = c; App.order.push(c.id); Store.mergeLegacy(c); });
  } catch (e) { $('#app').innerHTML = '<section class="band"><div class="in"><h1 class="display">The Academy couldn\'t load.</h1><p class="sub">Check your connection and reload the page.</p></div></section>'; return; }
  route();
}

/* ---------- routes: #/  #/<course>  #/<course>/<section>[/<lesson>|/test]  #/<course>/exam  #/<course>/library ---------- */
function legacy(h) {
  if (h === '' || h === '#' || h === '#home') return '#/';
  let m = h.match(/^#(session|test)-(\d)$/); if (m) return `#/excel/s${m[2]}${m[1] === 'test' ? '/test' : ''}`;
  if (h === '#exam') return '#/excel/exam'; if (h === '#library') return '#/excel/library'; if (h === '#experts') return '#/excel-expert-picks';
  if ((m = h.match(/^#\/course\/([\w-]+)/))) return '#/' + m[1];
  if ((m = h.match(/^#\/learn\/([\w-]+)\/(s\d)-quiz/))) return `#/${m[1]}/${m[2]}/test`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/final-exam/))) return `#/${m[1]}/exam`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((s\d)-[\w-]+)/))) return `#/${m[1]}/${m[3]}/${m[2]}`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((e\d)-\d+)/))) return `#/${m[1]}`;
  if (/^#\/(courses|my|studio|about|instructor)/.test(h)) return '#/';
  return null;
}
let shown = '';
function route() {
  if (!App.cat) return;
  const fix = legacy(location.hash); if (fix && fix !== location.hash) { history.replaceState(null, '', fix); }
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const c = App.courses[parts[0]]; let v;
  if (!parts.length) v = home();
  else if (!c) v = notFound();
  else if (!parts[1] || c.type === 'collection') v = grid(c);
  else if (parts[1] === 'exam') v = exam(c);
  else if (parts[1] === 'library') v = library(c);
  else { const sec = c.sections.find(s => s.id === parts[1]); v = sec ? section(c, sec, parts[2]) : notFound(); }
  const key = parts.slice(0, 2).join('/');
  if (key !== shown || !$('#app').firstElementChild) { $('#app').innerHTML = v.html; v.after && v.after(); window.scrollTo({ top: 0, behavior: 'instant' }); if (shown) { const h = $('#app h1'); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } } }
  else if (v.update) v.update();
  shown = key;
  if (parts[2] === 'test') setTimeout(() => $('#test')?.scrollIntoView({ behavior: 'instant', block: 'start' }), 60);
  document.title = v.title === 'Kalam CX Academy' ? v.title : `${v.title} · Kalam CX Academy`;
  nav(c && c.type !== 'collection' ? c : null, parts[1]);
  reveal($('#app'));
}
addEventListener('hashchange', route);
function nav(c, cur) {
  const items = c ? [['Overview', `#/${c.id}`, !cur], ...c.sections.filter(s => s.id !== 'final').map((s, i) => [`Session ${i + 1}`, `#/${c.id}/${s.id}`, cur === s.id]), ['Final exam', `#/${c.id}/exam`, cur === 'exam'],
    ...(c.related || []).filter(r => App.courses[r]).map(r => ['Expert videos', `#/${r}`, false]), ['Library', `#/${c.id}/library`, cur === 'library']]
    : [['All trainings', '#/', true], ...App.order.map(id => [App.courses[id].navTitle || App.courses[id].title, `#/${id}`, location.hash === `#/${id}`])];
  $('#nav').innerHTML = items.map(([t, h, on]) => `<a href="${h}"${on ? ' aria-current="page" class="on"' : ''}>${esc(t)}</a>`).join('');
  $('#crumb').innerHTML = c ? `<a href="#/">Academy</a><span aria-hidden="true">›</span><a href="#/${c.id}">${esc(c.title)}</a>` : '';
  $('#crumb').hidden = !c;
  $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false');
}
const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' }) : null;
function reveal(scope) { $$('.rv:not(.seen)', scope).forEach(el => io ? io.observe(el) : el.classList.add('seen')); setTimeout(() => { if (!$('.rv.seen', scope)) $$('.rv', scope).forEach(el => el.classList.add('seen')); }, 2500); }
const notFound = () => ({ title: 'Page not found', html: '<section class="band"><div class="in narrow center"><h1 class="display">This page isn\'t here.</h1><p class="sub center">The link may be old.</p><a class="pill big" href="#/">Go to the Academy</a></div></section>' });

/* ---------- Academy home ---------- */
function home() {
  const P = App.cat.platform, list = App.order.map(id => App.courses[id]);
  const tiles = list.map((c, i) => {
    const n = c.sections.reduce((a, s) => a + vids(s).length, 0), m = mins(c), first = c.type === 'collection' ? '' : `#/${c.id}/${c.sections[0].id}`;
    return `<article class="tile ${i % 2 ? 'dark' : ''} rv"><div class="tt"><p class="eyebrow">${esc(App.cat.categories.find(k => k.id === c.category)?.name || 'Training')}${c.type === 'collection' ? ' · Free YouTube picks' : ''}</p>
    <h2 class="headline">${esc(c.title)}</h2><p class="sub">${esc(c.subtitle)}</p>
    <div class="links"><a class="pill" href="#/${c.id}">${c.type === 'collection' ? 'Watch' : 'Open training'}</a>${first ? `<a class="link" href="${first}">Start Session 1 ${CHEV}</a>` : ''}</div>
    <p class="meta">${n} videos${m ? ` · ${(m / 60).toFixed(1)} hours` : ''} · ${esc(c.languageLabel)} · Free</p></div>
    <a class="shot" href="#/${c.id}" aria-label="Open ${esc(c.title)}">${c.cover ? `<img src="${esc(url(c, c.cover))}" alt="" loading="lazy">` : `<span class="ytmosaic">${vids(c.sections[0]).slice(0, 4).map(v => `<img src="https://i.ytimg.com/vi/${esc(v.yt)}/hqdefault.jpg" alt="" loading="lazy">`).join('')}</span>`}<span class="play">${PLAY}</span></a></article>`;
  }).join('');
  return { title: 'Kalam CX Academy', html: `<section class="hero"><div class="in">
  <p class="eyebrow center rv">Kalam CX Academy</p>
  <h1 class="mega center rv">Learn it.<br><span class="grad">Use it on the floor.</span></h1>
  <p class="sub center wide rv">${esc(P.intro)}</p>
  <div class="ctas rv"><a class="pill big" href="#/${App.order[0]}">Start with ${esc(App.courses[App.order[0]].navTitle || App.courses[App.order[0]].title)}</a></div></div></section>
 <div class="band"><div class="in"><h2 class="headline center rv">Trainings.</h2><div class="tiles">${tiles}</div>
  <p class="soonnote rv">More trainings are on the way. Each one will appear here with the same simple layout.</p></div></div>
 <div class="band gray"><div class="in"><h2 class="headline center rv">How it works.</h2>
  <div class="steps"><div class="rv"><b>1</b><h3>Pick a training</h3><p>Every training is free and opens in your browser.</p></div><div class="rv"><b>2</b><h3>Watch</h3><p>Short videos with the trainer's own voice.</p></div><div class="rv"><b>3</b><h3>Practise</h3><p>Repeat each step with the practice files.</p></div><div class="rv"><b>4</b><h3>Test</h3><p>Self-marking tests. Your progress stays in this browser.</p></div></div></div></div>` };
}

/* ---------- session page (dark player + playlist, topics, practice, test) ---------- */
function section(c, sec, lessonId) {
  const i = c.sections.indexOf(sec), list = vids(sec), q = quizOf(sec), pr = sec.lessons.find(l => l.type === 'practice');
  const wb = (pr?.resources || [])[0], slides = (pr?.resources || []).find(r => /slides/i.test(r.title)), tpdf = (q?.resources || [])[0];
  const nextSec = c.sections[i + 1], nextLink = nextSec && nextSec.id !== 'final' ? `<a class="link" href="#/${c.id}/${nextSec.id}">Next: Session ${i + 2} ${CHEV}</a>` : `<a class="link" href="#/${c.id}/exam">Next: the final exam ${CHEV}</a>`;
  let cur = Math.max(0, list.findIndex(v => v.id === lessonId));
  const html = `<section class="page-session">
 <div class="band dark"><div class="in">
  <p class="eyebrow">Session ${i + 1}</p><h1 class="display">${esc(sec.title)}</h1><p class="sub">${esc(sec.blurb || sec.summary)}</p>
  <div class="player rv"><div class="screen"><video id="vid" controls playsinline preload="metadata"></video></div>
  <aside class="list" aria-label="Session videos"><div class="lh"><b>Up next</b><span>${list.length} videos · ${list.reduce((a, v) => a + (v.minutes || 0), 0)} min</span></div><ol id="pl"></ol>${sec.note ? `<p class="soon">${esc(sec.note)}</p>` : ''}</aside></div>
  <div class="nowbar"><div><span class="lbl" id="nk"></span><b id="nt"></b></div><label class="auto"><input type="checkbox" id="auto" checked><span class="sw"></span>Autoplay next</label></div>
 </div></div>
 ${(sec.topics || []).length ? `<div class="band"><div class="in"><h2 class="headline rv">What you'll be able to do.</h2>
  <div class="feats">${sec.topics.map(([a, b]) => `<div class="feat rv"><span class="ic">${CHECK}</span><h3>${esc(a)}</h3><p>${esc(b)}</p></div>`).join('')}</div>
  <div class="duo rv">${wb ? `<div class="card"><p class="eyebrow">Practise</p><h3>Do it yourself.</h3><p>${esc(pr.body?.[0] || 'Practise each step on your own copy of the data.')}</p><a class="link" href="${esc(url(c, wb.href))}">Download the workbook ${CHEV}</a></div>` : ''}
  ${slides ? `<div class="card"><p class="eyebrow">Review</p><h3>Keep the slides.</h3><p>Every slide from this session in one PDF, with a printable copy of the test.</p><a class="link" href="${esc(url(c, slides.href))}" target="_blank" rel="noopener">Open the slides ${CHEV}</a>${tpdf ? `<a class="link" href="${esc(url(c, tpdf.href))}" target="_blank" rel="noopener">Printable test ${CHEV}</a>` : ''}</div>` : ''}</div></div></div>` : ''}
 ${q ? `<div class="band gray" id="test"><div class="in narrow">
  <p class="eyebrow center">Session ${i + 1} test</p><h2 class="headline center">Check what stuck.</h2>
  <p class="sub center">${q.questions.length} questions. Pass mark ${q.pass}. Each answer is marked instantly, with the reason.</p>${q.note ? `<p class="note center">${esc(q.note)}</p>` : ''}
  <div class="scorecard"><div class="ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="trk"/><circle cx="18" cy="18" r="15.9" class="val" id="ring"/></svg><b id="rn">0</b></div><div><b class="score" id="score" role="status" aria-live="polite"></b><button class="link btnlink" data-act="reset">Start over</button></div></div>
  <div class="quiz" id="quiz"></div>
  <div class="center nextnav">${nextLink}</div></div></div>` : ''}</section>`;
  const v = () => $('#vid');
  function load(k, play) {
    cur = k; const L = list[k]; v().src = url(c, L.src); v().poster = url(c, L.poster); v().setAttribute('aria-label', 'Video: ' + L.title);
    $('#nk').textContent = `${L.kind || ''}${L.minutes ? ' · ' + L.minutes + ' min' : ''}`; $('#nt').textContent = L.title; drawList();
    if (play) v().play().catch(() => {});
  }
  function drawList() {
    $('#pl').innerHTML = list.map((L, k) => `<li class="${k === cur ? 'on' : ''}"><button data-k="${k}" ${k === cur ? 'aria-current="true"' : ''}><span class="th"><img src="${esc(url(c, L.poster))}" alt="" loading="lazy"><span class="d">${L.minutes || ''} min</span>${Store.isDone(c.id, L.id) ? '<span class="w" aria-label="Watched">✓</span>' : ''}</span><span class="tt"><b>${esc(L.title)}</b><small>${esc(L.kind || '')}</small></span></button></li>`).join('');
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
  return { title: `Session ${i + 1}: ${sec.title} · ${c.title}`, html, after() {
    load(cur, false); drawQuiz();
    v().addEventListener('timeupdate', () => { if (v().duration && v().currentTime / v().duration > 0.9 && !Store.isDone(c.id, list[cur].id)) { Store.setDone(c.id, list[cur].id); drawList(); } });
    v().addEventListener('ended', () => { Store.setDone(c.id, list[cur].id); if ($('#auto').checked && cur < list.length - 1) load(cur + 1, true); else drawList(); });
    $('#pl').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (b) { load(+b.dataset.k, true); history.replaceState(null, '', `#/${c.id}/${sec.id}/${list[+b.dataset.k].id}`); } });
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

/* ---------- final exam, library ---------- */
function exam(c) {
  const L = c.sections.find(s => s.id === 'final')?.lessons[0]; if (!L) return notFound();
  const wb = L.resources.find(r => r.type === 'xlsx'), pdf = L.resources.find(r => r.type === 'pdf');
  return { title: `Final exam · ${c.title}`, html: `<section><div class="band"><div class="in narrow">
  <p class="eyebrow center">Final exam</p><h1 class="display center">Prove it.</h1>
  <p class="sub center">Open the workbook, build every answer in Excel, then reveal the key. ${L.minutes} minutes.</p>
  <div class="ctas">${pdf ? `<a class="pill" href="${esc(url(c, pdf.href))}" target="_blank" rel="noopener">Printable exam</a>` : ''}${wb ? `<a class="link" href="${esc(url(c, wb.href))}">Download the workbook ${CHEV}</a>` : ''}</div>
  <h2 class="headline small">The tasks</h2><div class="card exam">${L.html}</div>
  <div class="center"><button class="pill ghost" id="keybtn" aria-expanded="false" aria-controls="key">Show the answer key</button></div>
  <div id="key" class="card key" hidden>${L.keyHtml}</div></div></div></section>`,
    after() { $$('.exam table,.key table').forEach(t => { const w = document.createElement('div'); w.className = 'tw'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
      $('#keybtn').onclick = e => { const k = $('#key'); k.hidden = !k.hidden; e.target.setAttribute('aria-expanded', !k.hidden); e.target.textContent = k.hidden ? 'Show the answer key' : 'Hide the answer key'; }; } };
}
function library(c) {
  const files = (c.resources || []).filter(r => r.type === 'xlsx'), docs = (c.resources || []).filter(r => r.type !== 'xlsx');
  const tile = (r, open) => `<a class="doc ${r.type === 'xlsx' ? 'xl' : ''}" href="${esc(url(c, r.href))}" ${open ? 'target="_blank" rel="noopener"' : ''}><span class="badge">${esc(r.type.toUpperCase())}</span><b>${esc(r.title)}</b><span>${esc(r.summary || '')}</span><span class="link">${open ? 'Open' : 'Download'} ${CHEV}</span></a>`;
  return { title: `Library · ${c.title}`, html: `<section><div class="band"><div class="in">
  <p class="eyebrow center">Library</p><h1 class="display center">Guides and practice files.</h1>
  ${files.length ? `<h2 class="headline small">Practice files</h2><div class="grid3">${files.map(r => tile(r, false)).join('')}</div>` : ''}
  ${docs.length ? `<h2 class="headline small">Guides</h2><div class="grid3">${docs.map(r => tile(r, true)).join('')}</div>` : ''}</div></div></section>` };
}

/* ---------- course page: the Expert-videos look for every training (card grid + pop-up player) ---------- */
function vcard(c, L) {
  const img = L.type === 'youtube' ? `https://i.ytimg.com/vi/${esc(L.yt)}/hqdefault.jpg` : esc(url(c, L.poster));
  const by = L.type === 'youtube' ? L.by : L.kind;
  return `<button class="yt rv" data-c="${c.id}" data-l="${esc(L.id)}"><span class="ytimg"><img src="${img}" alt="" loading="lazy"><span class="play">${PLAY}</span>${L.minutes ? `<span class="dur">${L.minutes} min</span>` : ''}${Store.isDone(c.id, L.id) ? '<span class="seen-mark">✓<span class="sr"> Watched</span></span>' : ''}</span>
  <span class="ytx"><small>${esc(by || '')}</small><b>${esc(L.title)}</b>${L.summary && L.type === 'youtube' ? `<span>${esc(L.summary)}</span>` : ''}</span></button>`;
}
function grid(c) {
  const isCol = c.type === 'collection', secs = c.sections.filter(s => s.id !== 'final'), ex = c.sections.find(s => s.id === 'final');
  const nv = secs.reduce((a, s) => a + vids(s).length, 0), m = mins(c);
  const [h1a, h1b] = c.headline || [c.title, ''];
  const trainer = people(c).filter(p => !p.external)[0];
  const groups = secs.map((s, i) => {
    const q = quizOf(s), pr = s.lessons.find(l => l.type === 'practice'), wb = pr?.resources?.[0], sl = (pr?.resources || []).find(r => /slides/i.test(r.title));
    const acts = isCol ? '' : `<div class="gacts">${q ? `<a class="pill" href="#/${c.id}/${s.id}/test">Take the test</a>` : ''}${wb ? `<a class="link" href="${esc(url(c, wb.href))}">Practice workbook ${CHEV}</a>` : ''}${sl ? `<a class="link" href="${esc(url(c, sl.href))}" target="_blank" rel="noopener">Slides ${CHEV}</a>` : ''}</div>`;
    return `<div class="egroup"><p class="eyebrow">${isCol ? esc(s.summary || '') : `Session ${i + 1} · ${vids(s).length} videos · ${vids(s).reduce((a, v) => a + (v.minutes || 0), 0)} min`}</p>
    <h2 class="headline small2">${esc(s.title)}</h2>${acts}${s.note ? `<p class="gnote">${esc(s.note)}</p>` : ''}<div class="ytgrid">${vids(s).map(L => vcard(c, L)).join('')}</div></div>`;
  }).join('');
  const rel = (c.related || []).map(r => App.courses[r]).filter(Boolean);
  return { title: c.title, html: `<section><div class="band dark ehero"><div class="in">
  <p class="eyebrow center">${isCol ? 'Expert videos' : 'Training'}</p><h1 class="display center">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
  <p class="sub center wide">${esc(c.intro || c.subtitle)}</p>
  <div class="who">${isCol ? (c.who || []).map(w => `<span>${esc(w)}</span>`).join('') : `${trainer ? `<span class="tchip">${trainer.photo ? `<img src="${esc(trainer.photo)}" alt="">` : ''}${esc(trainer.name)}</span>` : ''}<span>${nv} videos</span>${m ? `<span>${(m / 60).toFixed(1)} hours</span>` : ''}<span>${esc(c.languageLabel)}</span><span>Free</span>`}</div></div></div>
  <div class="band"><div class="in">${groups}
  ${ex ? `<div class="egroup endcards"><div class="duo"><div class="card"><p class="eyebrow">Final exam</p><h3>Prove it.</h3><p>${esc(ex.summary)}</p><a class="link" href="#/${c.id}/exam">Open the exam ${CHEV}</a></div><div class="card"><p class="eyebrow">Library</p><h3>Guides and practice files.</h3><p>Every workbook, answer key and guide in one place.</p><a class="link" href="#/${c.id}/library">Browse the library ${CHEV}</a></div></div></div>` : ''}
  ${isCol ? '<p class="note">These videos play from YouTube and belong to their creators. Kalam CX isn\'t affiliated with these channels.</p>' : ''}
  ${rel.length ? `<div class="ctas">${rel.map(r => `<a class="pill ${isCol ? '' : 'ghost'}" href="#/${r.id}">${isCol ? 'Back to ' + esc(r.title) : 'Want more? Watch the expert videos'}</a>`).join('')}</div>` : ''}</div></div></section>`,
    after() { $$('.yt').forEach(b => b.addEventListener('click', () => openVideo(b))); } };
}
let lastBtn = null;
function openVideo(b) {
  const c = App.courses[b.dataset.c], L = c.sections.flatMap(s => s.lessons).find(l => l.id === b.dataset.l); if (!L) return;
  lastBtn = b; const m = $('#ytm'), fr = $('.ytframe', m);
  if (L.type === 'youtube') {
    fr.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(L.yt)}?autoplay=1&rel=0" title="${esc(L.title)} (YouTube video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
    $('#ytl').href = 'https://www.youtube.com/watch?v=' + L.yt; $('#ytl').hidden = false; Store.setDone(c.id, L.id);
  } else {
    fr.innerHTML = `<video controls autoplay playsinline src="${esc(url(c, L.src))}" poster="${esc(url(c, L.poster))}" aria-label="Video: ${esc(L.title)}"></video>`;
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
