/**
 * A light check of course.json when the site loads, so one mistake in the data can't break a whole page.
 * It repairs what it safely can (drops a broken lesson or question, fills an empty list) and reports the rest.
 * The full check, with clear messages, runs before publishing: check_content.py in the builder repo.
 */
import { providerOf } from './media.js?v=5d6558d6';

/**
 * @param {object} c  course.json as loaded
 * @param {string} id the id the catalog expects
 * @returns {{course: object|null, problems: string[]}}  course null = unusable
 */
export function validateCourse(c, id) {
  const problems = [], warn = m => problems.push(`${id}: ${m}`);
  if (!c || typeof c !== 'object' || Array.isArray(c)) return { course: null, problems: [`${id}: course.json is not an object`] };
  if (c.id !== id) { warn(`id is "${c.id}", expected "${id}"`); c.id = id; }
  if (!c.title) { warn('missing title'); c.title = id; }
  if (!Array.isArray(c.sections)) { warn('"sections" must be a list'); c.sections = []; }

  const seen = new Set();
  c.sections = c.sections.filter((s, i) => {
    if (!s || typeof s !== 'object') { warn(`section ${i + 1} is not an object`); return false; }
    if (!s.id) s.id = `section-${i + 1}`;
    if (!s.title) s.title = '';
    if (!Array.isArray(s.lessons)) { warn(`${s.id}: "lessons" must be a list`); s.lessons = []; }
    s.lessons = s.lessons.filter(L => {
      const why = lessonProblem(L, c);
      if (!why && seen.has(L.id)) { warn(`${s.id} › ${L.id}: lesson id used twice, the second one is hidden`); return false; }
      if (why) { warn(`${s.id} › ${L && L.id || '?'}: ${why}, lesson hidden`); return false; }
      seen.add(L.id); return true;
    });
    if (!s.lessons.length) { warn(`${s.id}: no usable lessons, section hidden`); return false; }
    return true;
  });
  if (c.type !== 'collection' && !c.sections.length) return { course: null, problems: problems.concat(`${id}: no lessons to show`) };
  return { course: c, problems };
}

/** Why a lesson can't be shown, or '' when it's fine. Unknown types are allowed (the page says it can't show them). */
function lessonProblem(L, c) {
  if (!L || typeof L !== 'object') return 'not an object';
  if (!L.id || !/^[A-Za-z0-9_-]+$/.test(String(L.id))) return 'missing or invalid id';
  if (!L.title) L.title = 'Untitled lesson';
  const p = providerOf(L);
  if (p && !p.src(c, L)) return 'video has no address';
  if (L.type === 'youtube' && !/^[\w-]{11}$/.test(L.yt || '')) return 'invalid YouTube id';
  if (L.type === 'quiz') {
    if (!Array.isArray(L.questions)) return 'test has no questions';
    L.questions = L.questions.filter(q => q && q.id && q.q && Array.isArray(q.o) && q.o.length && Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length);
    if (!L.questions.length) return 'test has no valid questions';
    if (!Number.isInteger(L.pass) || L.pass < 1) L.pass = L.questions.length;
    L.pass = Math.min(L.pass, L.questions.length);
  }
  if (L.type === 'reading' && !Array.isArray(L.blocks)) L.blocks = [];
  return '';
}
