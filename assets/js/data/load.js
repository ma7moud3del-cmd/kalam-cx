/** Loading data/catalog.json and every course.json it lists into App (data/catalog.js). */
import { App } from './catalog.js?v=5be21f30';
import { validateCourse } from './validate.js?v=5be21f30';
import { Store } from '../progress/store.js?v=5be21f30';

const TIMEOUT = 20000;   /* ms before a data request counts as failed (slow mobile data) */
/** Ids go into page addresses and markup, so only letters, digits, - and _ are accepted (the rule check_content.py uses for lesson ids). */
const ID = /^[A-Za-z0-9_-]+$/;
const okId = x => typeof x === 'string' && ID.test(x);

/** Fetch JSON, failing on HTTP errors, bad JSON and timeouts as well as network errors. */
async function getJson(href) {
  const ctl = 'AbortController' in window ? new AbortController() : null;
  const timer = ctl && setTimeout(() => ctl.abort(), TIMEOUT);
  try {
    const r = await fetch(href, { cache: 'no-cache', signal: ctl?.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    throw new Error(`${href}: ${e.name === 'AbortError' ? 'timed out' : e.message || e}`);
  } finally { clearTimeout(timer); }
}

/** A placeholder for a planned course: enough for cards and the "planned" page, no lessons. */
const plannedCourse = r => ({ id: r.id, soon: true, title: r.title, subtitle: r.subtitle, category: r.topic, level: r.level, cover: r.cover, sections: [] });

/** Load and check one catalog entry's course.json. Returns null (and records why in App.failed) when it can't be used. */
async function loadCourse(r) {
  if (r.status === 'soon' || !r.data) return plannedCourse(r);
  let raw;
  try { raw = await getJson(r.data); } catch (e) { App.failed.push({ id: r.id, reason: e.message }); return null; }
  if (raw && typeof raw === 'object') raw.base = raw.base || r.data.replace(/course\.json$/, '');
  const { course, problems } = validateCourse(raw, r.id);
  if (problems.length) console.warn('[Kalam Learning] course data problems (run check_content.py):\n' + problems.join('\n'));
  if (!course) { App.failed.push({ id: r.id, reason: problems[problems.length - 1] }); return null; }
  if (r.partOf) course.partOf = r.partOf;
  return course;
}

/** Empty App so loadAll() can run again (the Retry button). */
function reset() {
  Object.assign(App, { cat: null, courses: {}, entries: {}, order: [], people: {}, topics: [], failed: [] });
}

/**
 * Load everything. Throws only when the catalog itself can't be loaded;
 * a broken course is skipped and listed in App.failed (pages say so instead of hiding it silently).
 */
export async function loadAll() {
  reset();
  const cat = await getJson('data/catalog.json');
  if (!cat || !Array.isArray(cat.courses)) throw new Error('data/catalog.json has no "courses" list');
  (cat.instructors || []).forEach(p => p && okId(p.id) && (App.people[p.id] = p));
  App.topics = (cat.topics || cat.categories || []).filter(t => t && okId(t.id));
  cat.platform = cat.platform || {};
  const entries = cat.courses.filter(r => r && okId(r.id) && (!r.partOf || okId(r.partOf)));
  entries.forEach(r => (App.entries[r.id] = r));
  const list = await Promise.all(entries.map(loadCourse));
  App.cat = cat;   /* set last: route() does nothing until everything is in */
  list.filter(Boolean).forEach(c => { App.courses[c.id] = c; App.order.push(c.id); if (!c.soon) Store.mergeLegacy(c); });
}
