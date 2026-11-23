/**
 * Learner progress, saved in this browser only (localStorage). There are no accounts yet.
 *
 * Storage key "kalam.academy.v2" (do NOT rename: people would lose their progress). Shape:
 *   { v: 2, courses: { <courseId>: {
 *       done:    { <lessonId>: timestamp },                  finished lessons
 *       answers: { <questionId>: { c: choice, r: rev } },    test answers (rev = question revision)
 *       pos:     { <lessonId>: seconds },                    where a video was stopped (added later; optional)
 *       last:    { s: sectionId, l: lessonId },             where the learner was last
 *       at:      timestamp                                   last activity
 *   } } }
 * New fields must stay optional so data saved by older versions keeps working.
 * Older data under "kalamAcademy" (the first one-course Excel site) is merged in by mergeLegacy().
 * If the saved data can't be read it is copied to "kalam.academy.v2.unreadable" before starting fresh, never just dropped.
 */
import { storage } from '../core/dom.js?v=60d4ad74';

const KEY = 'kalam.academy.v2';
const PREFS = 'kalam.prefs';   /* { rate: 1.25 } player preferences */

function read() {
  const raw = storage.get(KEY);
  let s = null;
  try { s = JSON.parse(raw || 'null'); } catch (e) { s = null; }
  if (s && s.v === 2 && s.courses && typeof s.courses === 'object') {
    /* repair records written by hand or by a broken version */
    Object.values(s.courses).forEach(x => { if (x && typeof x === 'object') { x.done = x.done || {}; x.answers = x.answers || {}; } });
    return s;
  }
  if (raw) storage.set(KEY + '.unreadable', raw);
  return { v: 2, courses: {} };
}
let state = read();
const save = () => storage.set(KEY, JSON.stringify(state));
/** The record for a course, created on first use. */
const C = id => {
  let x = state.courses[id];
  if (!x || typeof x !== 'object') x = state.courses[id] = { done: {}, answers: {} };
  return x;
};
const listeners = new Set();

/* another tab changed progress: load it, so this tab doesn't overwrite it with older data */
addEventListener('storage', e => {
  if (e.key !== KEY) return;
  state = read(); listeners.forEach(f => f());
});

export const Store = {
  isDone: (c, l) => !!C(c).done[l],
  setDone(c, l) { if (!C(c).done[l]) { C(c).done[l] = Date.now(); C(c).at = Date.now(); save(); } },
  unsetDone(c, l) { delete C(c).done[l]; save(); },

  /** The learner's choice for a question, or undefined when unanswered or answered for an older revision. */
  answer(c, q, rev) { const a = C(c).answers[q]; return a && a.r === (rev || 1) ? a.c : undefined; },
  setAnswer(c, q, rev, v) { C(c).answers[q] = { c: v, r: rev || 1 }; C(c).at = Date.now(); save(); },
  /** Forget the answers to these questions ("Start over"). */
  reset(c, qs) { qs.forEach(q => delete C(c).answers[q]); save(); },

  /** Seconds where the learner stopped this video (0 when none). */
  pos: (c, l) => +((C(c).pos || {})[l]) || 0,
  /** Save a video position (rounded to the second); 0 forgets it. */
  setPos(c, l, sec) {
    const x = C(c), s = Math.floor(sec);
    if (s > 0) { (x.pos || (x.pos = {}))[l] = s; x.at = Date.now(); } else if (x.pos) delete x.pos[l];
    save();
  },

  /** Remember where the learner is: powers "Resume" and "Continue learning". */
  visit(c, sec, lesson) { const x = C(c); x.last = { s: sec, l: lesson || '' }; x.at = Date.now(); save(); },
  last: c => C(c).last || null,
  /** Time of the last activity in a course (0 when never opened). */
  at: c => C(c).at || Math.max(0, ...Object.values(C(c).done).map(Number)),
  /** True once the learner has opened, finished or answered anything in the course. */
  started: c => {
    const x = state.courses[c];
    return !!(x && (x.last || Object.keys(x.done || {}).length || Object.keys(x.answers || {}).length));
  },

  /** Call f when progress changes in another tab. Returns a function that stops listening. */
  onExternalChange(f) { listeners.add(f); return () => listeners.delete(f); },

  /** Player preferences (playback speed), kept apart from progress. */
  pref(k, fallback) { try { const p = JSON.parse(storage.get(PREFS) || '{}'); return k in p ? p[k] : fallback; } catch (e) { return fallback; } },
  setPref(k, v) { let p = {}; try { p = JSON.parse(storage.get(PREFS) || '{}') || {}; } catch (e) { p = {}; } p[k] = v; storage.set(PREFS, JSON.stringify(p)); },

  /** Merge progress saved by the earlier one-course Excel site (key "kalamAcademy"). Safe to run every visit. */
  mergeLegacy(course) {
    if (course.id !== 'excel') return;
    let old = null; try { old = JSON.parse(storage.get('kalamAcademy') || 'null'); } catch (e) { old = null; }
    if (!old) return;
    const x = C('excel');
    Object.entries(old.w || {}).forEach(([n, list]) => {
      const sec = course.sections.find(s => s.id === 's' + n); if (!sec) return;
      const vs = sec.lessons.filter(L => L.type === 'video');
      (list || []).forEach(i => { if (vs[i] && !x.done[vs[i].id]) x.done[vs[i].id] = 1; });
    });
    Object.entries(old.q || {}).forEach(([name, ans]) => {
      const n = (name.match(/\d+/) || [])[0];
      Object.entries(ans || {}).forEach(([i, v]) => {
        const id = `s${n}-q${String(+i + 1).padStart(2, '0')}`;
        if (!x.answers[id]) x.answers[id] = { c: v, r: 1 };
      });
    });
    save();
  }
};
