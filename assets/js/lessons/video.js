/** Video lessons (type video, embed, youtube). Which player is used is decided by data/media.js. */
import { $, esc } from '../core/dom.js?v=e03e6c67';
import { isFramed, frameHtml, fileSrc, mediaUrl } from '../data/media.js?v=e03e6c67';
import { Store } from '../progress/store.js?v=e03e6c67';
import { attachPlayer, playerControls } from '../player/player.js?v=e03e6c67';
import { actionBar, moduleFiles, complete, showCompleted } from './common.js?v=e03e6c67';

/** @type {{render:(ctx:import('./common.js').LessonCtx)=>string, wire:(ctx:import('./common.js').LessonCtx)=>void}} */
export const videoLesson = {
  render(ctx) {
    const { c, L } = ctx, framed = isFramed(L);
    const player = framed ? frameHtml(c, L)
      : `<video id="vid" controls playsinline preload="metadata" src="${esc(fileSrc(c, L))}" poster="${esc(mediaUrl(c, L.poster))}" aria-label="Video: ${esc(L.title)}" aria-keyshortcuts="Space K J L F M N"></video>`;
    return `<div class="screen" id="screen">${player}</div>${framed ? '' : playerControls()}
      ${actionBar(ctx, `${esc(L.kind || L.by || 'Video')}${L.minutes ? ` · ${+L.minutes} min` : ''}`)}${L.summary ? `<p class="body">${esc(L.summary)}</p>` : ''}${moduleFiles(ctx)}`;
  },
  wire(ctx) {
    const { c, L, next } = ctx, v = $('#vid');
    if (!v) {   /* players in an iframe can't report progress: opening counts */
      Store.setDone(c.id, L.id); showCompleted(); return;
    }
    attachPlayer(v, {
      courseId: c.id, lessonId: L.id,
      next: next ? `#/${c.id}/learn/${next.L.id}` : '',
      onWatched: () => complete(ctx),
      onEnded: () => $('#nextbtn')?.focus()
    });
  }
};
