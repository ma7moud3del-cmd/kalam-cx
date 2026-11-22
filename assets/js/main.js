/**
 * Kalam Learning: a multi-course learning platform in a simple, Apple-style look. Plain JavaScript modules, no build step.
 *
 * Learner journey: Home › Courses (search, categories) › Course overview › Learning view (lesson + lessons list) › Final assessment.
 * Content lives in data only: data/catalog.json lists topics, instructors and courses; each course is
 * courses/<id>/course.json (course → modules → lessons). Adding a course = adding data, no code changes.
 * See CONTENT.md and ARCHITECTURE.md in the builder repo. No accounts: progress stays in this browser (localStorage).
 *
 * Folders: core/ helpers · data/ loading, checks, course structure, media hosts · progress/ saved progress ·
 *          ui/ shared markup and widgets · views/ one file per page · lessons/ one file per lesson type ·
 *          player/ the video player · router.js the addresses
 */
import { $, focusEl } from './core/dom.js?v=4ce055fa';
import { App } from './data/catalog.js?v=4ce055fa';
import { loadAll } from './data/load.js?v=4ce055fa';
import { route, resetRoute } from './router.js?v=4ce055fa';
import { Store } from './progress/store.js?v=4ce055fa';
import { loadError } from './views/status.js?v=4ce055fa';
import { initMenu } from './ui/nav.js?v=4ce055fa';
import { initModal } from './ui/modal.js?v=4ce055fa';

document.documentElement.classList.add('js');

/** Load the data and draw the first page. Runs again from any "Try again" button. */
async function boot() {
  try {
    await loadAll();
  } catch (e) {
    console.error('[Kalam Learning] could not load the catalog', e);
    $('#app').innerHTML = loadError(); focusEl($('#app h1'));
    return;
  }
  const P = App.cat.platform;
  if (P.footer) { $('#foot').textContent = P.footer; $('#foot').hidden = false; }
  resetRoute(); route();
}

addEventListener('hashchange', route);
/* "Try again" buttons on error messages reload the data in place (keeps the address and progress) */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-reload]'); if (!b) return;
  b.disabled = true; b.textContent = 'Loading…'; boot();
});
/* progress changed in another tab: redraw when the learner comes back to this one (never mid-lesson) */
let stale = false;
Store.onExternalChange(() => { stale = true; });
const refreshIfStale = () => {
  if (!stale || document.hidden || !App.cat || /^#\/[\w-]+\/learn/.test(location.hash)) return;
  stale = false; const y = scrollY; resetRoute(); route(); scrollTo(0, y);
};
addEventListener('focus', refreshIfStale);
document.addEventListener('visibilitychange', refreshIfStale);
initMenu();
initModal();
$('#skip').addEventListener('click', e => { e.preventDefault(); focusEl($('#app h1')); });
boot();
