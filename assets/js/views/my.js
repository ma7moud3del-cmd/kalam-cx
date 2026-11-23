/** My learning: every started course with its progress. Saved in this browser only. */
import { esc } from '../core/dom.js?v=8e241242';
import { App } from '../data/catalog.js?v=8e241242';
import { Store } from '../progress/store.js?v=8e241242';
import { resumeRow } from '../ui/cards.js?v=8e241242';
import { progress } from '../progress/progress.js?v=8e241242';
import { startedCourses } from './home.js?v=8e241242';

/** @returns {import('../router.js').View} */
export function myLearning() {
  const l = startedCourses(), done = l.filter(c => progress(c).complete), going = l.filter(c => !done.includes(c));
  const ext = App.order.map(id => App.courses[id]).filter(c => c.partOf && Store.started(c.id));
  return {
    title: 'My learning', crumbs: [['Home', '#/'], ['My learning']],
    html: `<section><div class="band slim"><div class="in narrow">
  <h1 class="display rv">My learning.</h1><p class="sub wide rv">Saved in this browser only. There are no accounts yet, so on another phone or laptop you start fresh.</p>
  ${going.length ? `${done.length ? '<h2 class="headline small2">In progress.</h2>' : ''}<div class="rows">${going.map(resumeRow).join('')}</div>` : ''}
  ${done.length ? `<h2 class="headline small2">Completed.</h2><div class="rows">${done.map(resumeRow).join('')}</div>` : ''}
  ${l.length ? '' : `<div class="empty"><h3>Nothing started yet.</h3><p>Pick a course and press Start. It will show up here with your progress.</p><a class="pill" href="#/explore">Explore courses</a></div>`}
  ${ext.length ? `<p class="note left">Also watched: ${ext.map(c => `<a href="#/${c.partOf}/extras">${esc(c.title)}</a>`).join(', ')}.</p>` : ''}</div></div></section>`
  };
}
