/**
 * The pop-up video player used by collections (Extra videos). Markup lives in index.html (#ytm).
 * Focus is kept inside while open and returns to the card that opened it.
 */
import { $, $$, esc } from '../core/dom.js?v=8ddd3cd7';
import { App } from '../data/catalog.js?v=8ddd3cd7';
import { findLesson } from '../data/course.js?v=8ddd3cd7';
import { isFramed, frameHtml, fileSrc, mediaUrl, externalLink } from '../data/media.js?v=8ddd3cd7';
import { Store } from '../progress/store.js?v=8ddd3cd7';

let opener = null;

const markSeen = btn => {
  if (!$('.seen-mark', btn)) $('.ytimg', btn).insertAdjacentHTML('beforeend', '<span class="seen-mark">✓<span class="sr"> Watched</span></span>');
};

/** Open the lesson behind a card button (data-c = course id, data-l = lesson id). */
export function openVideo(btn) {
  const c = App.courses[btn.dataset.c], L = c && findLesson(c, btn.dataset.l); if (!L) return;
  opener = btn;
  const m = $('#ytm'), fr = $('.ytframe', m), ext = externalLink(L);
  if (isFramed(L)) {
    fr.innerHTML = frameHtml(c, L, true);
    Store.setDone(c.id, L.id);   /* players in an iframe can't report progress: opening counts */
  } else {
    fr.innerHTML = `<video controls autoplay playsinline src="${esc(fileSrc(c, L))}" poster="${esc(mediaUrl(c, L.poster))}" aria-label="Video: ${esc(L.title)}"></video>`;
    const v = $('video', fr);
    v.addEventListener('timeupdate', () => { if (v.duration && v.currentTime / v.duration > 0.9) Store.setDone(c.id, L.id); });
  }
  $('#ytl').hidden = !ext; if (ext) { $('#ytl').href = ext.href; $('#ytl').textContent = ext.label; }
  $('#ytt').textContent = L.title; $('#ytc').textContent = L.by || L.kind || '';
  m.hidden = false; document.body.style.overflow = 'hidden'; $('#ytx').focus();
}

/** Close the pop-up (does nothing when it's closed). */
export function closeVideo() {
  const m = $('#ytm'); if (m.hidden) return;
  m.hidden = true; $('.ytframe', m).innerHTML = ''; document.body.style.overflow = '';
  if (opener && opener.isConnected) {
    if (Store.isDone(opener.dataset.c, opener.dataset.l)) markSeen(opener);
    opener.focus();
  }
}

/** Wire the close button, backdrop click, Escape, focus trap and closing on navigation. Call once. */
export function initModal() {
  const m = $('#ytm');
  $('#ytx').addEventListener('click', closeVideo);
  m.addEventListener('click', e => { if (e.target === m) closeVideo(); });
  m.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = $$('#ytm a:not([hidden]),#ytm button,#ytm iframe,#ytm video'), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeVideo(); });
  addEventListener('hashchange', closeVideo);
}
