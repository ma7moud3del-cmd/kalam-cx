/**
 * Helpers that read one course's structure: course → sections (modules) → lessons.
 * A section is either a normal module, the "short course" (part: "short") or the final assessment.
 * Nothing here touches the DOM or progress.
 */

/** Resolve a course-relative file path (docs, files, images). Absolute URLs are kept. */
export const url = (c, p) => !p ? '' : /^(https?:)?\/\//.test(p) ? p : (c.base || '') + p;

/** Lesson types that play a video (a file, a YouTube id or any embeddable player). */
export const VIDEO_TYPES = ['video', 'youtube', 'embed'];
export const isVid = L => VIDEO_TYPES.includes(L.type);
export const vids = sec => sec.lessons.filter(isVid);
/** Sum of the lessons' "minutes". */
export const mins = list => list.reduce((a, L) => a + (+L.minutes || 0), 0);
export const quizOf = sec => sec.lessons.find(L => L.type === 'quiz');
export const isExamSec = s => s.id === 'final' || (s.lessons.length > 0 && s.lessons.every(L => L.type === 'exam'));
/** Quick summary videos, shown as their own part before the modules. */
export const isShortSec = s => s.part === 'short';
/** The normal modules, in order. */
export const secsOf = c => c.sections.filter(s => !isExamSec(s) && !isShortSec(s));
export const shortOf = c => c.sections.find(isShortSec);
export const examOf = c => c.sections.find(isExamSec);
/** What this course calls a module: "Module", "Session", "Week"… */
export const word = c => (c.labels && c.labels.section) || 'Module';
/** Every lesson of the course, flat. */
export const allLessons = c => c.sections.flatMap(s => s.lessons);
export const findLesson = (c, id) => allLessons(c).find(L => L.id === id);

/**
 * Time totals. Video minutes are measured; practice, test, exam and reading minutes are the course's own estimates.
 * @returns {{video:number,videos:number,practice:number,tests:number,exam:number,reading:number,readings:number,total:number,nPractice:number,nTests:number,nExam:number}}
 */
export function timeOf(c) {
  const all = allLessons(c), v = all.filter(isVid), of = k => all.filter(L => L.type === k);
  const video = mins(v), practice = mins(of('practice')), tests = mins(of('quiz')), exam = mins(of('exam')), reading = mins(of('reading'));
  return {
    video, videos: v.length, practice, tests, exam, reading, readings: of('reading').length,
    total: video + practice + tests + exam + reading,
    nPractice: of('practice').length, nTests: of('quiz').length, nExam: of('exam').length
  };
}

/**
 * Files for a module: explicit "files" in course.json, else the older convention
 * (first workbook of the practice lesson, a PDF titled "slides", the test's first PDF).
 * @returns {{workbook?:string, slides?:string, testPdf?:string, practice?:string}}
 */
export function filesOf(c, sec) {
  const f = sec.files || {}, pr = sec.lessons.find(L => L.type === 'practice'), q = quizOf(sec);
  const R = (pr && pr.resources) || [];
  const wb = f.workbook || (R.find(r => r.type === 'xlsx') || {}).href;
  const sl = f.slides || (R.find(r => /slides/i.test(r.title)) || {}).href;
  const tp = f.testPdf || ((q && q.resources) || [])[0]?.href;
  return { workbook: wb && url(c, wb), slides: sl && url(c, sl), testPdf: tp && url(c, tp), practice: f.practice || pr?.body?.[0] };
}

/**
 * @typedef {{L:object, sec:object, mi:number}} Step
 * One step of the learning path. mi = module index (0-based), -2 = short course, -1 = final assessment.
 */

/**
 * The learning path: the short course, every lesson of every module in order, then the final assessment.
 * Cached on the course object (course data never changes after loading).
 * @returns {Step[]}
 */
export function path(c) {
  if (c._path) return c._path;
  const out = [], sh = shortOf(c);
  if (sh) sh.lessons.forEach(L => out.push({ L, sec: sh, mi: -2 }));
  secsOf(c).forEach((s, i) => s.lessons.forEach(L => out.push({ L, sec: s, mi: i })));
  const ex = examOf(c); if (ex) ex.lessons.forEach(L => out.push({ L, sec: ex, mi: -1 }));
  return (c._path = out);
}

/** Heading for a step's module: "Module 2 · Lookups", the short course title, or "Final assessment". */
export const modName = (c, x) => x.mi === -2 ? x.sec.title : x.mi < 0 ? 'Final assessment' : `${word(c)} ${x.mi + 1} · ${x.sec.title}`;
/** Short label for a step's module: "Module 2". */
export const modShort = (c, x) => x.mi === -2 ? x.sec.title : x.mi < 0 ? 'Final assessment' : `${word(c)} ${x.mi + 1}`;
