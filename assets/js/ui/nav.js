/** The main nav (Home · Courses · My learning) and the bar under it: breadcrumb left, course pages right. */
import { $, esc } from '../core/dom.js?v=e03e6c67';
import { topicOf, extrasOf } from '../data/catalog.js?v=e03e6c67';
import { progress } from '../progress/progress.js?v=e03e6c67';

const link = ([t, h, on]) => `<a href="${h}"${on ? ' aria-current="page" class="on"' : ''}>${esc(t)}</a>`;

/**
 * @param {string} top   first part of the route ('' on home)
 * @param {object|null} c  the current course, when inside a normal course
 * @param {string} [cur] second part of the route ('learn', 'resources'…)
 * @param {Array<[string,string?]>} [crumbs] breadcrumb trail [text, href]
 */
export function nav(top, c, cur, crumbs) {
  const main = [['Home', '#/', top === ''], ['Courses', '#/explore', top === 'explore' || top === 'categories' || !!c], ['My learning', '#/my', top === 'my']];
  $('#nav').innerHTML = main.map(link).join('');
  closeMenu();
  const ln = $('#lnav');
  if (!crumbs && !c) { ln.hidden = true; ln.innerHTML = ''; return; }
  const trail = crumbs || [];
  const pages = c ? [['Overview', `#/${c.id}`, !cur], ['Learn', progress(c).resume, cur === 'learn'], ['Resources', `#/${c.id}/resources`, cur === 'resources'],
    ...(extrasOf(c).length ? [['Extra videos', `#/${c.id}/extras`, cur === 'extras']] : [])] : [];
  ln.innerHTML = `<div class="in"><nav class="crumbs" aria-label="Breadcrumb"><ol>${trail.map(([t, h], i) => `<li>${h && i < trail.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span aria-current="page">${esc(t)}</span>`}</li>`).join('')}</ol></nav>
  ${pages.length ? `<nav class="lpages" aria-label="Course: ${esc(c.title)}">${pages.map(link).join('')}</nav>` : ''}</div>`;
  ln.hidden = false;
}

/** Breadcrumb trail for a course page: Home › Category › Course [› more…]. */
export function trail(c, ...more) {
  const t = topicOf(c), out = [['Home', '#/']];
  if (t) out.push([t.name, `#/categories/${t.id}`]);
  out.push([c.navTitle || c.title, `#/${c.id}`]);
  return out.concat(more);
}

/** Close the phone menu. */
export function closeMenu() { $('#nav').classList.remove('open'); $('#menu').setAttribute('aria-expanded', 'false'); }

/** Wire the phone menu button; Escape closes it and returns focus to the button. */
export function initMenu() {
  $('#menu').addEventListener('click', () => { const o = $('#nav').classList.toggle('open'); $('#menu').setAttribute('aria-expanded', o); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('#nav').classList.contains('open')) { closeMenu(); $('#menu').focus(); }
  });
}
