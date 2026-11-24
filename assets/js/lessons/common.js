/**
 * Shared pieces for lesson renderers.
 *
 * A lesson renderer is { render(ctx) → html, wire?(ctx) }, registered in lessons/index.js by lesson "type".
 * @typedef {object} LessonCtx
 * @property {object} c       the course
 * @property {import('../data/course.js').Step} x  the current step
 * @property {object} L       the lesson (x.L)
 * @property {object|null} next  the next step, if any
 * @property {{workbook?:string,slides?:string,testPdf?:string}} F  files of the lesson's module
 * @property {string} W       what the course calls a module ("Module")
 * @property {() => void} refresh  redraw the lessons sidebar (after progress changes)
 */
import { $, esc } from '../core/dom.js?v=175c4d96';
import { CHEV } from '../core/icons.js?v=175c4d96';
import { quizOf } from '../data/course.js?v=175c4d96';
import { Store } from '../progress/store.js?v=175c4d96';

/** "Next lesson ›" button, when there is a next step. */
export const nextButton = ctx => ctx.next ? `<a class="pill small" href="#/${ctx.c.id}/learn/${esc(ctx.next.L.id)}">Next lesson ›</a>` : '';

/** "Mark as complete" toggle (tests complete themselves, so they don't get one). */
export function doneButton(ctx) {
  if (ctx.L.type === 'quiz') return '';
  const d = Store.isDone(ctx.c.id, ctx.L.id);
  return `<button class="pill ghost small" id="done" aria-pressed="${d}">${d ? '✓ Completed' : 'Mark as complete'}</button>`;
}

/** The bar under a lesson: a short meta line, then the done + next buttons. */
export const actionBar = (ctx, meta) => `<div class="lbar"><p class="lmeta">${meta}</p><span class="lact">${doneButton(ctx)}${nextButton(ctx)}</span></div>`;

/** "For this module": workbook, slides and test links shown under videos and readings. */
export function moduleFiles(ctx) {
  const { c, x, L, F, W } = ctx;
  if (!(F.workbook || F.slides) || L.type === 'practice') return '';
  const q = quizOf(x.sec);
  return `<div class="lfiles"><b>For this ${W.toLowerCase()}</b>${F.workbook ? `<a class="link" href="${esc(F.workbook)}">Practice workbook ${CHEV}</a>` : ''}${F.slides ? `<a class="link" href="${esc(F.slides)}" target="_blank" rel="noopener">Slides (PDF) ${CHEV}</a>` : ''}${q && L.type !== 'quiz' ? `<a class="link" href="#/${c.id}/learn/${q.id}">${W} test ${CHEV}</a>` : ''}</div>`;
}

/** Show the done button as completed (after automatic completion). */
export function showCompleted() {
  const b = $('#done'); if (b) { b.setAttribute('aria-pressed', true); b.textContent = '✓ Completed'; }
}

/** Mark the lesson done once, then update the sidebar and button. */
export function complete(ctx) {
  if (Store.isDone(ctx.c.id, ctx.L.id)) return;
  Store.setDone(ctx.c.id, ctx.L.id); ctx.refresh(); showCompleted();
}
