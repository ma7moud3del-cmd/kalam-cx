/**
 * Hash routing. Every page is a "view": a function that returns
 * @typedef {object} View
 * @property {string} title          page title (the site name is added)
 * @property {string} html           markup for <main id="app">
 * @property {Array<[string,string?]>|null} [crumbs]  breadcrumb trail [text, href]; the last one is the current page
 * @property {() => void} [after]    wire events once the html is in the page
 * @property {() => void} [update]   redraw in place when only the last part of the URL changed (lesson → lesson)
 *
 * Routes:
 *   #/   #/explore[?q=&topic=&level=&lang=&dur=&price=]   #/categories[/<id>]   #/my
 *   #/<course>   #/<course>/learn[/<lesson>]   #/<course>/resources   #/<course>/extras
 * Course ids can't be one of RESERVED (check_content.py in the builder repo enforces this).
 */
import { $, focusEl } from './core/dom.js?v=5d6558d6';
import { App, siteName } from './data/catalog.js?v=5d6558d6';
import { secsOf, quizOf, path, findLesson } from './data/course.js?v=5d6558d6';
import { nav } from './ui/nav.js?v=5d6558d6';
import { reveal } from './ui/reveal.js?v=5d6558d6';
import { home } from './views/home.js?v=5d6558d6';
import { explore } from './views/explore.js?v=5d6558d6';
import { categories, category } from './views/categories.js?v=5d6558d6';
import { myLearning } from './views/my.js?v=5d6558d6';
import { overview } from './views/overview.js?v=5d6558d6';
import { learn } from './views/learn.js?v=5d6558d6';
import { resources } from './views/resources.js?v=5d6558d6';
import { extras, collection } from './views/extras.js?v=5d6558d6';
import { notFound, soonPage, courseFailed, pageError } from './views/status.js?v=5d6558d6';

export const RESERVED = ['explore', 'categories', 'my', 'trainings', 'topics'];

/** Top-level pages (not courses). */
const PAGES = {
  explore: (parts, Q) => explore(Q),
  categories: parts => parts[1] ? category(parts[1]) : categories(),
  my: () => myLearning()
};
/** Pages inside a normal course: #/<course>/<page>. */
const COURSE_PAGES = {
  '': c => overview(c),
  learn: (c, parts) => learn(c, parts[2]),
  resources: c => resources(c),
  extras: c => extras(c)
};

/**
 * Old links (the first Excel site, earlier layouts) → today's address, or null when the hash is current.
 * Bookmarks and shared links from before keep working.
 */
export function legacy(h) {
  if (h === '' || h === '#' || h === '#home') return '#/';
  let m = h.match(/^#(session|test)-(\d)$/); if (m) return `#/excel/s${m[2]}${m[1] === 'test' ? '/test' : ''}`;
  if (h === '#exam') return '#/excel/exam';
  if (h === '#library') return '#/excel/library';
  if (h === '#experts') return '#/excel/extras';
  if ((m = h.match(/^#\/course\/([\w-]+)/))) return '#/' + m[1];
  if ((m = h.match(/^#\/learn\/([\w-]+)\/(s\d)-quiz/))) return `#/${m[1]}/${m[2]}/test`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/final-exam/))) return `#/${m[1]}/exam`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((s\d)-[\w-]+)/))) return `#/${m[1]}/${m[3]}/${m[2]}`;
  if ((m = h.match(/^#\/learn\/([\w-]+)\/((e\d)-\d+)/))) return `#/${m[1]}`;
  if (/^#\/(courses|trainings)\/?$/.test(h)) return '#/explore';
  if ((m = h.match(/^#\/topics\/([\w-]+)/))) return `#/categories/${m[1]}`;
  if (/^#\/(studio|about|instructor)/.test(h)) return '#/';
  if ((m = h.match(/^#\/([\w-]+)\/?$/)) && App.courses[m[1]]?.partOf) return `#/${App.courses[m[1]].partOf}/extras`;
  /* course pages from the older session layout (#/excel/s2/s2-v03, #/excel/s2/test, #/excel/exam) → the learning view */
  if ((m = h.match(/^#\/([\w-]+)\/([\w-]+)(?:\/([\w-]+))?$/)) && App.courses[m[1]] && !App.courses[m[1]].soon && !(m[2] in COURSE_PAGES)) {
    const c = App.courses[m[1]];
    if (m[2] === 'exam') { const x = path(c).find(y => y.L.type === 'exam'); return x ? `#/${c.id}/learn/${x.L.id}` : `#/${c.id}`; }
    if (m[2] === 'library') return `#/${c.id}/resources`;
    const sec = secsOf(c).find(s => s.id === m[2]);
    if (sec) {
      const L = m[3] === 'test' ? quizOf(sec) : m[3] ? (sec.lessons.find(l => l.id === m[3]) || findLesson(c, m[3])) : sec.lessons[0];
      return `#/${c.id}/learn/${(L || sec.lessons[0]).id}`;
    }
  }
  return null;
}

/** Split the hash into decoded parts and query parameters. */
function parse(hash) {
  const [p, qs] = hash.replace(/^#\/?/, '').split('?');
  const parts = p.split('/').filter(Boolean).map(s => { try { return decodeURIComponent(s); } catch (e) { return s; } });
  return { parts, Q: new URLSearchParams(qs || '') };
}

/** Pick the view for the current address. Returns the view and the course it belongs to (if a normal course). */
function resolve(parts, Q) {
  if (!parts.length) return { v: home() };
  if (PAGES[parts[0]]) return { v: PAGES[parts[0]](parts, Q) };
  const c = RESERVED.includes(parts[0]) ? null : App.courses[parts[0]];
  if (!c) return { v: App.failed.some(f => f.id === parts[0]) ? courseFailed(parts[0]) : notFound() };
  if (c.soon) return { v: soonPage(c) };
  if (c.type === 'collection') return { v: collection(c) };
  const page = COURSE_PAGES[parts[1] || ''];
  return { v: page ? page(c, parts) : notFound(), course: c };
}

let shown = null;   /* "first/second" part of the address last drawn; null = nothing drawn yet */

/** Draw the page for location.hash. Called on start-up and on every hashchange. */
export function route() {
  if (!App.cat) return;
  let fix, n = 0;
  while ((fix = legacy(location.hash)) && fix !== location.hash && n++ < 4) history.replaceState(null, '', fix);
  const { parts, Q } = parse(location.hash);
  const key = parts.slice(0, 2).join('/'), app = $('#app');
  let v, course;
  try {
    ({ v, course } = resolve(parts, Q));
    if (key !== shown || !app.firstElementChild || !v.update) {
      app.innerHTML = v.html; v.after && v.after(); window.scrollTo({ top: 0, behavior: 'instant' });
      if (shown !== null) focusEl($('#app h1'));   /* move focus to the new page, except on first load */
    } else v.update();
    shown = key;
  } catch (e) {   /* a bug or bad data on one page must not leave a blank screen */
    console.error('[Kalam Learning] could not draw', location.hash, e);
    v = pageError(); course = null; app.innerHTML = v.html; shown = null;
  }
  document.title = v.title === siteName() ? v.title : `${v.title} · ${siteName()}`;
  nav(parts[0] || '', course || null, parts[1], v.crumbs);
  reveal(app);
}

/** Force the next route() to redraw the whole page (after data reloads). */
export const resetRoute = () => { shown = null; };
