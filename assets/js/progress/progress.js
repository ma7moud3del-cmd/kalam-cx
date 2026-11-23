/** Progress worked out from saved data + course structure: what's done, how far along, where to resume. */
import { Store } from './store.js?v=60d4ad74';
import { path, isVid } from '../data/course.js?v=60d4ad74';

/** A test is passed when at least "pass" questions are answered correctly. */
export function passed(c, q) {
  const ok = q.questions.filter(x => Store.answer(c.id, x.id, x.rev) === x.a).length;
  return ok >= q.pass;
}
/** Tests count as done when passed; every other lesson when marked done. */
export const lessonDone = (c, L) => L.type === 'quiz' ? passed(c, L) : Store.isDone(c.id, L.id);

/**
 * Where to continue: the lesson last opened, unless it's finished, then the next unfinished step after it
 * (else the first unfinished one). With nothing opened yet, the first unfinished step.
 * @returns {import('../data/course.js').Step|undefined}
 */
function resumeStep(c, P) {
  const last = Store.last(c.id);
  const k = last ? P.findIndex(x => x.L.id === last.l) : -1;
  const at = k >= 0 ? P[k] : last && P.find(x => x.sec.id === last.s);
  if (at && !lessonDone(c, at.L)) return at;
  const from = Math.max(0, k + 1);
  return P.slice(from).find(x => !lessonDone(c, x.L)) || P.find(x => !lessonDone(c, x.L)) || at || P[0];
}

/**
 * @typedef {object} CourseProgress
 * @property {number} done   steps done
 * @property {number} total  steps in the path
 * @property {number} pct    0-100
 * @property {boolean} started
 * @property {boolean} complete  every step done
 * @property {number} watched  videos done
 * @property {number} videos
 * @property {number} pass   tests passed
 * @property {number} tests
 * @property {string} resume link to continue
 * @property {import('../data/course.js').Step} at  the step "resume" points at
 * @property {number} pos    seconds into the "at" video where the learner stopped (0 = start)
 */

/** @returns {CourseProgress} */
export function progress(c) {
  const P = path(c), done = P.filter(x => lessonDone(c, x.L)).length, vs = P.filter(x => isVid(x.L));
  const qs = P.filter(x => x.L.type === 'quiz'), at = resumeStep(c, P);
  return {
    done, total: P.length, pct: P.length ? Math.round(100 * done / P.length) : 0, started: Store.started(c.id),
    complete: P.length > 0 && done === P.length,
    watched: vs.filter(x => Store.isDone(c.id, x.L.id)).length, videos: vs.length,
    pass: qs.filter(x => passed(c, x.L)).length, tests: qs.length,
    resume: at ? `#/${c.id}/learn/${at.L.id}` : `#/${c.id}`, at,
    pos: at ? Store.pos(c.id, at.L.id) : 0
  };
}
