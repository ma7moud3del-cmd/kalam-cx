/**
 * The learning view: the lesson (drawn by its renderer in lessons/), previous/next, and the lessons sidebar on the right.
 * Moving between lessons of the same course redraws only the lesson and the sidebar (View.update), so the layout stays put.
 */
import { $, esc, focusEl, storage } from '../core/dom.js?v=4ce055fa';
import { CHECK, ICON } from '../core/icons.js?v=4ce055fa';
import { secsOf, shortOf, examOf, word, filesOf, path, modName, modShort } from '../data/course.js?v=4ce055fa';
import { Store } from '../progress/store.js?v=4ce055fa';
import { progress, lessonDone } from '../progress/progress.js?v=4ce055fa';
import { bar } from '../ui/cards.js?v=4ce055fa';
import { trail } from '../ui/nav.js?v=4ce055fa';
import { rendererFor } from '../lessons/index.js?v=4ce055fa';

const PHONE = 900;                    /* px: below this the sidebar is a drawer that starts closed */
const SIDEBAR_KEY = 'kalam.sidebar';  /* 'open' | 'closed', remembered for desktop */
const isPhone = () => innerWidth <= PHONE;

/** @returns {import('../router.js').View} */
export function learn(c, lessonId) {
  const P = path(c), W = word(c);
  let k = P.findIndex(x => x.L.id === lessonId);
  if (k < 0) {   /* no or unknown lesson: go to where the learner should resume */
    const r = progress(c).resume.split('/').pop();
    k = Math.max(0, P.findIndex(x => x.L.id === r));
    history.replaceState(null, '', `#/${c.id}/learn/${P[k].L.id}`);
  }
  const collapsed = storage.get(SIDEBAR_KEY) === 'closed';
  let cur = k;

  /* ----- sidebar ----- */
  const groups = () => [...(shortOf(c) ? [[shortOf(c), -2]] : []), ...secsOf(c).map((s, i) => [s, i]), ...(examOf(c) ? [[examOf(c), -1]] : [])];
  /** Redraw the lessons list. Only the current module is open; long modules show the lessons around the current one. */
  function drawSidebar() {
    const p = progress(c), toc = $('#ctoc');
    $('#cprog').innerHTML = `${bar(p.pct)}<span>${p.done}/${p.total}</span>`;
    toc.innerHTML = groups().map(([s, i]) => {
      const xs = P.map((x, j) => [x, j]).filter(([x]) => x.sec === s), open = P[cur].sec === s, long = open && xs.length > 4, all = long && toc.dataset.all === s.id;
      const label = i === -2 ? 'Quick videos' : i < 0 ? 'Final' : `${W} ${i + 1}`;
      const item = ([x, j]) => `<li class="${j === cur ? 'on' : ''} ${lessonDone(c, x.L) ? 'done' : ''}${open && (j < cur - 1 || j > cur + 2) ? ' far' : ''}"><a href="#/${c.id}/learn/${esc(x.L.id)}"${j === cur ? ' aria-current="page"' : ''}><span class="li">${lessonDone(c, x.L) ? CHECK : ICON[x.L.type] || ''}</span><span class="lt">${esc(x.L.title)}</span>${x.L.minutes ? `<span class="lm">${+x.L.minutes}m</span>` : ''}<span class="sr">${lessonDone(c, x.L) ? ' (done)' : ''}</span></a></li>`;
      const more = long ? `<button type="button" class="link btnlink cmore" data-sec="${esc(s.id)}" data-label="See all ${xs.length} lessons in this ${esc(W.toLowerCase())}" aria-expanded="${all}">${all ? 'Show fewer' : `See all ${xs.length} lessons in this ${W.toLowerCase()}`}</button>` : '';
      return `<details${open ? ' open' : ''}><summary><span>${label}</span><b>${esc(i < 0 ? (s.title || 'Final assessment') : s.title)}</b><small>${xs.filter(([x]) => lessonDone(c, x.L)).length}/${xs.length}</small></summary><ol${long && !all ? ' class="trim"' : ''}>${xs.map(item).join('')}</ol>${more}</details>`;
    }).join('');
  }
  /** Sidebar open or closed: the class on #learn, the toggle button's state and label. */
  function setSidebar(open) {
    $('#learn').classList.toggle('nocurr', !open);
    $('#ctog').setAttribute('aria-expanded', open); $('#ctogt').textContent = (open ? 'Hide' : 'Show') + ' lessons';
  }
  const sidebarOpen = () => !$('#learn').classList.contains('nocurr');

  /* ----- the lesson ----- */
  function show(j) {
    cur = j;
    const x = P[j], L = x.L, prev = P[j - 1], next = P[j + 1], toc = $('#ctoc');
    if (toc.dataset.at !== L.id) { delete toc.dataset.all; toc.dataset.at = L.id; }   /* a new lesson starts with the short list */
    /* files of the lesson's module; a short-course video uses the files of the module it summarises ("of") */
    const fsec = x.mi >= 0 ? x.sec : x.mi === -2 && L.of ? secsOf(c).find(z => z.id === L.of) : null;
    Store.visit(c.id, x.sec.id, L.id);
    const inMod = P.filter(y => y.sec === x.sec), pos = inMod.indexOf(x) + 1;
    /** @type {import('../lessons/common.js').LessonCtx} */
    const ctx = { c, x, L, next, F: fsec ? filesOf(c, fsec) : {}, W, refresh: drawSidebar };
    const R = rendererFor(L);
    const where = x.mi === -2 ? `Video ${pos} of ${inMod.length} in the short course` : x.mi < 0 ? 'Final step of the course' : `Lesson ${pos} of ${inMod.length} in this ${W.toLowerCase()}`;
    $('#lmain').innerHTML = `<div class="ltop"><button class="ctoggle" id="ctog" aria-controls="curr" aria-expanded="${sidebarOpen()}"><span aria-hidden="true">☰</span> <span id="ctogt">${sidebarOpen() ? 'Hide' : 'Show'} lessons</span></button><a class="link lback" href="#/${c.id}">‹ ${esc(c.title)}</a></div>
     <p class="eyebrow">${esc(modName(c, x))}</p><h1 class="headline">${esc(L.title)}</h1><p class="lpos">${where}</p>${R.render(ctx)}${x.sec.note && ['video', 'youtube', 'embed'].includes(L.type) ? `<p class="gnote">${esc(x.sec.note)}</p>` : ''}
     <nav class="pn" aria-label="Lesson navigation">${prev ? `<a class="prev" href="#/${c.id}/learn/${esc(prev.L.id)}" rel="prev"><small>Previous</small><b>${esc(prev.L.title)}</b></a>` : '<span></span>'}
     ${next ? `<a class="next" href="#/${c.id}/learn/${esc(next.L.id)}" rel="next" id="nextbtn"><small>Next${next.sec !== x.sec ? ` · ${esc(modName(c, next))}` : ''}</small><b>${esc(next.L.title)}</b></a>` : `<a class="next" href="#/${c.id}" id="nextbtn"><small>Finished</small><b>Back to the course overview</b></a>`}</nav>`;
    wire(ctx, R);
    drawSidebar();
    const on = $('#ctoc li.on'); if (on && $('#curr').scrollHeight > $('#curr').clientHeight) on.scrollIntoView({ block: 'nearest' });
  }
  function wire(ctx, R) {
    $('#ctog').onclick = () => {
      const open = !sidebarOpen(); setSidebar(open); storage.set(SIDEBAR_KEY, open ? 'open' : 'closed');
      if (open && isPhone()) $('#ctoc a[aria-current]')?.focus();
    };
    const done = $('#done');
    if (done) done.onclick = () => {
      const { c: C, L } = ctx, d = Store.isDone(C.id, L.id);
      d ? Store.unsetDone(C.id, L.id) : Store.setDone(C.id, L.id);
      done.setAttribute('aria-pressed', !d); done.textContent = d ? 'Mark as complete' : '✓ Completed'; drawSidebar();
    };
    R.wire && R.wire(ctx);
  }

  return {
    title: `${P[k].L.title} · ${c.title}`,
    crumbs: trail(c, [modShort(c, P[k])]),
    html: `<section class="learn${collapsed ? ' nocurr' : ''}" id="learn">
  <div class="lmain" id="lmain"></div>
  <aside class="curr" id="curr" aria-label="Lessons"><div class="ch"><b>Lessons</b><button class="cclose" id="ccls" type="button" aria-label="Close course content">✕</button><span id="cprog"></span></div><div id="ctoc"></div></aside></section>`,
    after() {
      show(k); if (isPhone()) setSidebar(false);   /* on phones the list starts closed */
      const close = () => { if (!isPhone() || !sidebarOpen()) return; setSidebar(false); $('#ctog').focus(); };
      $('#ccls').onclick = close;
      $('#curr').addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
      /* "See all" / "Show fewer": the choice is kept on #ctoc (not in this closure), so sidebar redraws keep it */
      $('#ctoc').addEventListener('click', e => {
        const b = e.target.closest('.cmore'); if (!b) return;
        const toc = $('#ctoc'), all = b.previousElementSibling.classList.toggle('trim') === false;
        if (all) toc.dataset.all = b.dataset.sec; else delete toc.dataset.all;
        b.setAttribute('aria-expanded', all); b.textContent = all ? 'Show fewer' : b.dataset.label;
      });
    },
    update() {
      const j = P.findIndex(x => x.L.id === location.hash.split('/').pop()); if (j < 0) return;
      if (isPhone()) $('#learn').classList.add('nocurr');   /* show() draws the toggle button from this class */
      show(j); window.scrollTo({ top: 0, behavior: 'instant' }); focusEl($('#lmain h1'));
    }
  };
}
