/**
 * Course overview, in parts: the short course (if any) · the modules · extra videos (if any) · files · about.
 * Each part is its own function so a part can be changed or reordered without reading the others.
 */
import { $, $$, esc, focusEl } from '../core/dom.js?v=8ddd3cd7';
import { CHEV, CHECK, PLAY, ICON } from '../core/icons.js?v=8ddd3cd7';
import { plural, hours, langShort, isFree } from '../core/format.js?v=8ddd3cd7';
import { topicOf, peopleOf, extrasOf } from '../data/catalog.js?v=8ddd3cd7';
import { isVid, vids, mins, quizOf, secsOf, shortOf, examOf, word, timeOf, filesOf, path } from '../data/course.js?v=8ddd3cd7';
import { mediaUrl, thumbOf } from '../data/media.js?v=8ddd3cd7';
import { Store } from '../progress/store.js?v=8ddd3cd7';
import { progress, lessonDone, passed } from '../progress/progress.js?v=8ddd3cd7';
import { bar, nextLine } from '../ui/cards.js?v=8ddd3cd7';
import { trail } from '../ui/nav.js?v=8ddd3cd7';

/* ----- cards ----- */

/** A module card: status, what it covers, video count, workbook and test. Links to the first unfinished step. */
function moduleCard(c, s, i, P) {
  const W = word(c), xs = P.filter(x => x.sec === s), vs = vids(s), m = mins(vs), d = xs.filter(x => lessonDone(c, x.L)).length, q = quizOf(s);
  const st = d === xs.length ? ['done', '✓ Done'] : d ? ['on', 'In progress'] : ['', 'Not started'];
  const go = (xs.find(x => !lessonDone(c, x.L)) || xs[0]).L.id, nr = s.lessons.filter(L => L.type === 'reading').length;
  const testState = q && (q.questions.some(x => Store.answer(c.id, x.id, x.rev) !== undefined) ? (passed(c, q) ? ' · passed' : ' · not passed yet') : ` · ${q.questions.length} questions`);
  return `<a class="scard rv ${st[0]}" href="#/${c.id}/learn/${esc(go)}"><span class="sh"><span>${esc(W)} ${i + 1}</span><span class="st">${st[1]}</span></span>
   <b>${esc(s.title)}</b>${s.covers ? `<span class="sc">${esc(s.covers)}</span>` : ''}
   <span class="sm">${[vs.length ? `${plural(vs.length, 'video')} · ${m} min` : '', nr ? plural(nr, 'reading lesson') : ''].filter(Boolean).join(' · ')}${d && d < xs.length ? ` · ${d} of ${xs.length} done` : ''}</span>
   <span class="sl">${s.lessons.some(L => L.type === 'practice') ? '<span>Practice workbook</span>' : ''}${q ? `<span>${esc(W)} test${testState}</span>` : ''}</span></a>`;
}

/** A card for one module's group of extra videos (from the course's collection X). */
function extrasCard(c, X, s, i) {
  const vs = vids(s), seen = vs.filter(L => Store.isDone(X.id, L.id)).length;
  return `<a class="scard ecard rv" href="#/${c.id}/extras"><span class="sh"><span>With ${esc(word(c).toLowerCase())} ${i + 1}</span><span class="st">${seen ? `${seen} of ${vs.length} watched` : 'Optional'}</span></span>
   <b>${esc(s.title)}</b><span class="sm">${plural(vs.length, 'video')}${vs.some(L => L.type === 'youtube') ? ' · YouTube' : ''}</span>
   <span class="eth" aria-hidden="true">${vs.slice(0, 3).map(L => `<img src="${esc(thumbOf(X, L))}" alt="" loading="lazy">`).join('')}${vs.length > 3 ? `<small>+${vs.length - 3}</small>` : ''}</span>
   <span class="sl">${vs.slice(0, 3).map(L => `<span>${esc(L.title)}</span>`).join('')}</span></a>`;
}

/** A short-course video card. */
function quickCard(c, L) {
  const i = secsOf(c).findIndex(z => z.id === L.of), d = lessonDone(c, L);
  return `<a class="qcard rv${d ? ' done' : ''}" href="#/${c.id}/learn/${esc(L.id)}"><span class="qimg">${L.poster ? `<img src="${esc(mediaUrl(c, L.poster))}" alt="" loading="lazy">` : ''}<span class="play">${PLAY}</span>${L.minutes ? `<span class="dur">${+L.minutes} min</span>` : ''}</span>
   <span class="qx"><small>${i >= 0 ? `${esc(word(c))} ${i + 1}` : 'Quick video'}${d ? ' · ✓ Watched' : ''}</small><b>${esc(L.title)}</b></span></a>`;
}

/* ----- parts ----- */

function hero(c, T, p, secs) {
  const t = topicOf(c), [h1a, h1b] = c.headline || [c.title, ''], W = word(c);
  const startLabel = p.complete ? 'Review the course' : p.done || p.pos ? 'Continue learning' : 'Start the course';
  return `<div class="band dark ehero"><div class="in">
   <p class="eyebrow">${esc(t?.name || 'Course')}</p><h1 class="display">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
   <p class="sub wide">${esc(c.intro || c.subtitle)}</p>
   <ul class="facts" aria-label="Course facts">${peopleOf(c).filter(x => !x.external).map(x => `<li class="tchip">${x.photo ? `<img src="${esc(x.photo)}" alt="">` : ''}${esc(x.name)}</li>`).join('')}
    <li>${esc(c.levelRange || c.level || 'All levels')}</li><li>${esc(c.languageLabel || langShort(c))}</li>${T.video ? `<li>${hours(T.video)} of video</li>` : ''}${T.reading ? `<li>${plural(T.readings, 'reading lesson')}</li>` : ''}<li>${plural(secs.length, W.toLowerCase())}</li><li>${isFree(c) ? 'Free' : 'Paid'}</li></ul>
   <div class="hcta"><a class="pill big" href="${p.resume}">${esc(startLabel)}</a>${p.started ? `<span class="hprog">${bar(p.pct)}<span>${p.done} of ${p.total} steps</span></span>` : ''}</div>
   ${p.started && p.at ? `<p class="hnext">${nextLine(c, p)}</p>` : ''}</div></div>`;
}

function shortPart(c, SH) {
  return `<div class="band slim" id="short"><div class="in">
   <p class="eyebrow">Part 1 · Start here</p><h2 class="headline small2 ph">${esc(SH.title)} · ${plural(SH.lessons.length, 'video')}</h2><p class="tblurb">${esc(SH.summary || '')} ${hours(mins(vids(SH)))} in total.</p>
   <div class="scards">${SH.lessons.map(L => quickCard(c, L)).join('')}</div></div></div>`;
}

/** Every lesson, grouped by module, in a collapsed list. */
function lessonLists(c, secs, P, p) {
  const W = word(c);
  const row = x => `<li class="${lessonDone(c, x.L) ? 'done' : ''}"><a href="#/${c.id}/learn/${esc(x.L.id)}"><span class="li">${ICON[x.L.type] || ''}</span><span class="lt">${esc(x.L.title)}${x.L.kind && isVid(x.L) ? `<small>${esc(x.L.kind)}</small>` : ''}</span><span class="lm">${x.L.minutes ? `${+x.L.minutes} min` : ''}</span>${lessonDone(c, x.L) ? `<span class="lok">${CHECK}<span class="sr">Done</span></span>` : '<span class="lok"></span>'}</a></li>`;
  return secs.map((s, i) => `<details class="mod"${p.at && p.at.sec === s ? ' open' : ''}><summary><span class="mn">${W} ${i + 1}</span><span class="mt"><b>${esc(s.title)}</b>${s.covers ? `<small>${esc(s.covers)}</small>` : ''}</span><span class="mc">${P.filter(x => x.sec === s).length} steps</span></summary>${s.note ? `<p class="gnote mnote">${esc(s.note)}</p>` : ''}<ol class="lessons">${P.filter(x => x.sec === s).map(row).join('')}</ol></details>`).join('');
}

function curriculumPart(c, T, p, secs, P, label, partName, gray) {
  const W = word(c), ex = examOf(c), exL = ex && ex.lessons[0];
  const has = types => secs.some(s => s.lessons.some(L => types.includes(L.type)));
  const sv = secs.flatMap(vids), svm = mins(sv);
  const meta = [sv.length ? `${plural(sv.length, 'video')} · ${hours(svm)} of video` : '', T.readings ? plural(T.readings, 'reading lesson') : '', has(['practice']) ? 'practice' : '', has(['quiz']) ? `a test after each ${W.toLowerCase()}` : '', ex ? 'final task' : ''].filter(Boolean).join(' · ');
  return `<div class="band ${gray ? 'gray ' : ''}slim" id="curriculum"><div class="in">
   <p class="eyebrow">${label}</p><h2 class="headline small2 ph">${esc(partName)} · ${plural(secs.length, W.toLowerCase())}</h2><p class="tblurb">${esc(meta)}</p>
   <div class="scards">${secs.map((s, i) => moduleCard(c, s, i, P)).join('')}</div>
   ${exL ? `<a class="fcard rv" href="#/${c.id}/learn/${esc(exL.id)}"><span><small>Final task</small><b>${esc(exL.title || 'Final assessment')}${exL.minutes ? ` · about ${+exL.minutes} min` : ''}</b>${ex.summary ? `<span>${esc(ex.summary)}</span>` : ''}</span><span class="link">${lessonDone(c, exL) ? '✓ Done' : `Open ${CHEV}`}</span></a>` : ''}
   <details class="every"><summary>Show every lesson</summary><div class="mods">${lessonLists(c, secs, P, p)}</div></details></div></div>`;
}

function extrasPart(c, X, label, gray) {
  const W = word(c);
  return `<div class="band ${gray ? 'gray ' : ''}slim" id="extras"><div class="in">
   <p class="eyebrow">${label} · Optional</p><h2 class="headline small2 ph">Extra videos</h2><p class="tblurb">${esc(X.subtitle || `${X.sections.reduce((a, s) => a + vids(s).length, 0)} videos, grouped to match each ${W.toLowerCase()}.`)}</p>
   <div class="scards">${secsOf(X).map((s, i) => extrasCard(c, X, s, i)).join('')}</div></div></div>`;
}

function filesPart(c, secs, gray) {
  const W = word(c), fl = secs.map((s, i) => [s, i, filesOf(c, s)]), wb = fl.find(([, , f]) => f.workbook);
  const slides = fl.filter(([, , f]) => f.slides), tests = fl.filter(([s]) => quizOf(s));
  return `<div class="band ${gray ? 'gray ' : ''}slim" id="files"><div class="in">
   <h2 class="headline small2">Files.</h2>
   <div class="grid3">
    ${wb ? `<a class="doc xl" href="${esc(wb[2].workbook)}"><span class="badge">XLSX</span><b>Practice workbook</b><span>Used in every ${W.toLowerCase()} and in the final assessment.</span><span class="link">Download ${CHEV}</span></a>` : ''}
    ${slides.length ? `<div class="doc"><span class="badge">PDF</span><b>Slides</b><span>${slides.map(([s, i, f]) => `<a href="${esc(f.slides)}" target="_blank" rel="noopener">${W} ${i + 1}: ${esc(s.title)}</a>`).join('<br>')}</span></div>` : ''}
    ${tests.length ? `<div class="doc"><span class="badge q">TEST</span><b>${W} tests</b><span>${tests.map(([s, i, f]) => `<a href="#/${c.id}/learn/${quizOf(s).id}">${W} ${i + 1} test</a> (${quizOf(s).questions.length} questions, pass ${quizOf(s).pass})${f.testPdf ? ` · <a href="${esc(f.testPdf)}" target="_blank" rel="noopener">printable</a>` : ''}`).join('<br>')}</span></div>` : ''}
   </div>
   <p class="center"><a class="link" href="#/${c.id}/resources">All guides and files ${CHEV}</a></p></div></div>`;
}

/** Course length table. Video minutes are measured; the rest are the course's estimates (and say so). */
function lengthCard(T, W) {
  return `<div class="card"><h3>Course length</h3><table class="len"><caption class="sr">Course length</caption><tbody>
      ${T.videos ? `<tr><th scope="row">Video</th><td>${plural(T.videos, 'video')} · ${T.video} min</td></tr>` : ''}
      ${T.reading ? `<tr><th scope="row">Reading</th><td>${plural(T.readings, 'lesson')} · about ${T.reading} min</td></tr>` : ''}
      ${T.practice ? `<tr><th scope="row">Practice</th><td>about ${T.practice} min <small>(${T.nPractice} × ${Math.round(T.practice / T.nPractice)})</small></td></tr>` : ''}
      ${T.tests ? `<tr><th scope="row">${W} tests</th><td>about ${T.tests} min <small>(${T.nTests} × ${Math.round(T.tests / T.nTests)})</small></td></tr>` : ''}
      ${T.exam ? `<tr><th scope="row">Final assessment</th><td>${T.exam} min</td></tr>` : ''}
      <tr class="tot"><th scope="row">Total</th><td>about ${hours(T.total)}</td></tr></tbody></table>
      <p class="fine">${T.video ? `The ${hours(T.video)} figure is video only. ` : ''}Reading, practice and test times are the course's estimates.</p></div>`;
}

function aboutPart(c, T, gray) {
  const W = word(c), trainers = peopleOf(c).filter(x => !x.external), list = k => c[k] || [];
  return `<div class="band ${gray ? 'gray ' : ''}slim" id="about"><div class="in">
   <div class="ovgrid">
    <div>${list('description').length ? `<h2 class="headline small2">About this course.</h2>${c.description.map(d => `<p class="body">${esc(d)}</p>`).join('')}` : ''}
     ${list('outcomes').length ? `<h2 class="headline small2">What you'll learn.</h2><ul class="outs">${c.outcomes.map(o => `<li><span class="ic">${CHECK}</span>${esc(o)}</li>`).join('')}</ul>` : ''}</div>
    <aside class="side">
     ${lengthCard(T, W)}
    </aside></div>
   ${list('audience').length || list('requirements').length ? `<div class="duo">${list('audience').length ? `<div class="card"><h3>Who it's for</h3><ul class="plain">${c.audience.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}${list('requirements').length ? `<div class="card"><h3>Before you start</h3><ul class="plain">${c.requirements.map(a => `<li>${esc(a)}</li>`).join('')}</ul></div>` : ''}</div>` : ''}
   ${trainers.map(x => `<div class="trainer">${x.photo ? `<img src="${esc(x.photo)}" alt="Photo of ${esc(x.name)}" loading="lazy" decoding="async">` : ''}<div><h3 class="headline small2">${esc(x.name)}</h3><p class="sub">${esc(x.title || '')}</p><p>${esc(x.bio || '')}</p></div></div>`).join('')}
  </div></div>`;
}

/** @returns {import('../router.js').View} */
export function overview(c) {
  const T = timeOf(c), p = progress(c), secs = secsOf(c), P = path(c), X = extrasOf(c)[0], SH = shortOf(c);
  const partName = (c.labels && c.labels.part) || 'The course', pn = n => `Part ${n + (SH ? 1 : 0)}`;
  /* bands alternate white / gray; with a short course first, everything shifts by one */
  const g = !!SH;
  const jumps = [...(SH ? [['short', SH.title]] : []), ['curriculum', partName], ...(X ? [['extras', 'Extra videos']] : []), ['files', 'Files'], ['about', 'About']];
  return {
    title: c.title, crumbs: trail(c),
    html: `<section class="ov">
  ${hero(c, T, p, secs)}
  <nav class="ovtabs" aria-label="On this page"><div class="in">${jumps.map(([id, tx]) => `<a href="#/${c.id}" data-jump="${id}">${esc(tx)}</a>`).join('')}</div></nav>
  ${SH ? shortPart(c, SH) : ''}
  ${curriculumPart(c, T, p, secs, P, pn(1), partName, g)}
  ${X ? extrasPart(c, X, pn(2), !g) : ''}
  ${filesPart(c, secs, g)}
  ${aboutPart(c, T, !g)}
  </section>`,
    after() {
      /* "On this page" links scroll to their part and move focus to its heading */
      $$('[data-jump]').forEach(a => a.addEventListener('click', e => {
        e.preventDefault();
        const el = document.getElementById(a.dataset.jump);
        el.scrollIntoView({ behavior: 'smooth' }); focusEl($('h2', el));
      }));
    }
  };
}
