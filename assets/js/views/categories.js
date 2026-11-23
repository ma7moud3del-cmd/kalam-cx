/** Categories (topics) and one category's courses. Topics without courses are shown as planned. */
import { esc } from '../core/dom.js?v=8e241242';
import { App, listed, topicId } from '../data/catalog.js?v=8e241242';
import { courseCard, categoryTile } from '../ui/cards.js?v=8e241242';
import { notFound } from './status.js?v=8e241242';

/** @returns {import('../router.js').View} */
export function categories() {
  return {
    title: 'Categories', crumbs: [['Home', '#/'], ['Categories']],
    html: `<section><div class="band slim"><div class="in">
  <h1 class="display rv">Categories.</h1><p class="sub wide rv">Courses grouped by topic. Topics without courses yet are marked as planned.</p>
  <div class="cats big">${App.topics.map(categoryTile).join('')}</div></div></div></section>`
  };
}

/** @returns {import('../router.js').View} */
export function category(id) {
  const t = App.topics.find(x => x.id === id); if (!t) return notFound();
  const L = listed().filter(c => topicId(c) === id), n = L.filter(c => !c.soon).length;
  return {
    title: t.name, crumbs: [['Home', '#/'], ['Categories', '#/categories'], [t.name]],
    html: `<section><div class="band slim"><div class="in">
  <p class="eyebrow rv">Category</p><h1 class="display rv">${esc(t.name)}.</h1>${t.blurb ? `<p class="sub wide rv">${esc(t.blurb)}</p>` : ''}
  ${L.length ? `<div class="cgrid">${L.map(c => courseCard(c)).join('')}</div>` : ''}
  ${!n ? `<div class="empty"><h3>No courses here yet.</h3><p>This topic is planned. Courses will appear here when they are published.</p><a class="pill" href="#/explore">See available courses</a></div>` : ''}</div></div></section>`
  };
}
