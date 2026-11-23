/**
 * Our video player: the browser's <video> with extras.
 *  - picks up where the learner stopped (saved every few seconds, forgotten once the video is finished)
 *  - playback speed (remembered for the next video)
 *  - keyboard shortcuts (shown on the page)
 *  - a clear message with Try again when the video can't load
 *  - counts as done at 90% watched
 * Only for file videos (type "video"); host players in an iframe have their own controls.
 */
import { $, esc } from '../core/dom.js?v=8ddd3cd7';
import { clock } from '../core/format.js?v=8ddd3cd7';
import { Store } from '../progress/store.js?v=8ddd3cd7';

export const SPEEDS = [0.75, 1, 1.25, 1.5, 1.75, 2];
const DONE_AT = 0.9;          /* share of the video that counts as watched */
const SAVE_EVERY = 5;         /* seconds between position saves */
const MIN_RESUME = 10;        /* don't bother resuming in the first seconds… */
const END_MARGIN = 15;        /* …or in the last ones */

/** Controls under the video: speed buttons, resume note, shortcut help. */
export function playerControls() {
  const rate = Store.pref('rate', 1);
  return `<div class="pctl" id="pctl">
    <div class="speed" role="group" aria-label="Playback speed"><span aria-hidden="true">Speed</span>${SPEEDS.map(s => `<button type="button" data-rate="${s}" aria-pressed="${s === rate}"><span class="sr">Speed </span>${s}×</button>`).join('')}</div>
    <p class="resumed" id="resumed" role="status" hidden></p>
    <details class="keys"><summary>Keyboard shortcuts</summary><dl>
      <div><dt><kbd>Space</kbd> or <kbd>K</kbd></dt><dd>Play or pause</dd></div>
      <div><dt><kbd>J</kbd> / <kbd>L</kbd></dt><dd>Back or forward 10 seconds</dd></div>
      <div><dt><kbd>←</kbd> / <kbd>→</kbd></dt><dd>Back or forward 5 seconds</dd></div>
      <div><dt><kbd>&lt;</kbd> / <kbd>&gt;</kbd></dt><dd>Slower or faster</dd></div>
      <div><dt><kbd>F</kbd></dt><dd>Full screen</dd></div>
      <div><dt><kbd>M</kbd></dt><dd>Sound on or off</dd></div>
      <div><dt><kbd>N</kbd></dt><dd>Next lesson</dd></div>
    </dl></details></div>`;
}

/** The message shown in place of the video when it can't load. */
const errorBox = href => `<div class="verr" role="alert"><b>This video couldn't load.</b><span>Check your connection, then try again.</span>
  <span class="ctas left"><button type="button" class="pill small" id="vretry">Try again</button>${href ? `<a class="link" href="${esc(href)}" target="_blank" rel="noopener">Open the video file</a>` : ''}</span></div>`;

/** Clean-up of the video currently on the page (saves its position, removes key handling). */
let leaveCurrent = null;

/**
 * Wire a <video> on the lesson page.
 * @param {HTMLVideoElement} v
 * @param {{courseId:string, lessonId:string, onWatched:()=>void, onEnded:()=>void, next?:string}} o
 */
export function attachPlayer(v, o) {
  const { courseId: c, lessonId: l } = o, screen = v.parentElement, src = v.getAttribute('src');
  let lastSaved = 0;
  const setRate = r => {
    v.playbackRate = r; Store.setPref('rate', r);
    document.querySelectorAll('#pctl [data-rate]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.rate === r));
  };
  v.playbackRate = Store.pref('rate', 1);
  v.addEventListener('ratechange', () => {   /* also catches the browser's own speed menu */
    document.querySelectorAll('#pctl [data-rate]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.rate === v.playbackRate));
  });
  $('#pctl')?.addEventListener('click', e => { const b = e.target.closest('[data-rate]'); if (b) setRate(+b.dataset.rate); });

  /* resume where the learner stopped */
  v.addEventListener('loadedmetadata', () => {
    const at = Store.pos(c, l);
    if (at > MIN_RESUME && at < v.duration - END_MARGIN) {
      v.currentTime = at;
      const note = $('#resumed');
      if (note) {
        note.innerHTML = `Picking up where you stopped, at ${clock(at)}. <button type="button" class="link btnlink" id="restart">Start from the beginning</button>`;
        note.hidden = false;
        $('#restart').onclick = () => { v.currentTime = 0; Store.setPos(c, l, 0); note.hidden = true; v.focus(); };
      }
    }
  }, { once: true });

  const savePos = () => {
    if (!v.duration) return;
    const finished = v.currentTime / v.duration > DONE_AT;
    Store.setPos(c, l, finished ? 0 : v.currentTime); lastSaved = v.currentTime;
  };
  v.addEventListener('timeupdate', () => {
    if (!v.isConnected || !v.duration) return;
    if (v.currentTime / v.duration > DONE_AT) o.onWatched();
    if (Math.abs(v.currentTime - lastSaved) >= SAVE_EVERY) savePos();
  });
  v.addEventListener('pause', savePos);
  v.addEventListener('ended', () => { Store.setPos(c, l, 0); if (v.isConnected) o.onEnded(); });

  /* the video can't load: say so, with a way to retry (a network error is often brief) */
  v.addEventListener('error', () => {
    if (!v.isConnected || $('.verr', screen)) return;
    v.hidden = true; screen.insertAdjacentHTML('beforeend', errorBox(src));
    $('#vretry').onclick = () => { $('.verr', screen).remove(); v.hidden = false; v.load(); };
  });

  /* keyboard shortcuts, only while this video is on the page */
  const onKey = e => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    const t = e.target, tag = t.tagName;
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || t.isContentEditable) return;
    /* Space and arrows keep their normal job on buttons, links and the video's own controls */
    const own = t === v, ctl = /^(BUTTON|A|SUMMARY)$/.test(tag);
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const seek = s => { v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + s)); };
    const step = d => { const i = SPEEDS.indexOf(v.playbackRate); setRate(SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, (i < 0 ? 1 : i) + d))]); };
    const act = {
      k: () => (v.paused ? v.play() : v.pause()),
      ' ': () => (v.paused ? v.play() : v.pause()),
      j: () => seek(-10), l: () => seek(10),
      ArrowLeft: () => seek(-5), ArrowRight: () => seek(5),
      f: () => (document.fullscreenElement ? document.exitFullscreen() : v.requestFullscreen?.()),
      m: () => (v.muted = !v.muted),
      '<': () => step(-1), ',': () => step(-1), '>': () => step(1), '.': () => step(1),
      n: () => { if (o.next) location.hash = o.next; }
    }[k];
    if (!act) return;
    if ((k === ' ' && ctl) || ((k === ' ' || k.startsWith('Arrow')) && own)) return;
    if (k.startsWith('Arrow') && ctl) return;
    e.preventDefault(); act();
  };
  /* leaving the lesson (another lesson, another page, closing the tab) saves the position once more */
  if (leaveCurrent) leaveCurrent();
  const leave = () => {
    savePos();
    removeEventListener('keydown', onKey); removeEventListener('hashchange', leave); removeEventListener('pagehide', savePos);
    if (leaveCurrent === leave) leaveCurrent = null;
  };
  addEventListener('keydown', onKey); addEventListener('hashchange', leave); addEventListener('pagehide', savePos);
  leaveCurrent = leave;
}
