/** Simple pages: not found, a planned course, and the "couldn't load" messages. */
import { esc } from '../core/dom.js?v=4ce055fa';
import { topicOf } from '../data/catalog.js?v=4ce055fa';

/** @returns {import('../router.js').View} */
export const notFound = () => ({
  title: 'Page not found',
  html: '<section class="band"><div class="in narrow center"><h1 class="display">This page isn\'t here.</h1><p class="sub center">The link may be old.</p><a class="pill big" href="#/">Go to the home page</a></div></section>'
});

/** A planned course: says plainly that it isn't available yet. */
export function soonPage(c) {
  const t = topicOf(c);
  return {
    title: c.title,
    crumbs: [['Home', '#/'], ...(t ? [[t.name, `#/categories/${t.id}`]] : []), [c.title]],
    html: `<section><div class="band"><div class="in narrow center">
  <p class="eyebrow center">Planned</p><h1 class="display center">${esc(c.title)}</h1><p class="sub center wide">${esc(c.subtitle || 'This course is being prepared.')} It isn't available yet.</p>
  <a class="pill big" href="#/explore">See available courses</a></div></div></section>`
  };
}

/** A course listed in the catalog whose data couldn't be loaded (network, or a broken course.json). */
export function courseFailed(id) {
  return {
    title: 'Course unavailable', crumbs: [['Home', '#/'], ['Course unavailable']],
    html: `<section class="band"><div class="in narrow center"><h1 class="display">This course couldn't load.</h1>
  <p class="sub center">It may be a connection problem. Try again, or come back later.</p>
  <div class="ctas"><button type="button" class="pill big" data-reload>Try again</button><a class="link" href="#/">Go to the home page</a></div></div></section>`
  };
}

/** A short note on lists when some courses couldn't load, so a missing course isn't silently hidden. */
export const failedNote = n => n ? `<div class="loadnote rv" role="status"><span>${n === 1 ? 'One course' : `${n} courses`} couldn't load right now.</span> <button type="button" class="link btnlink" data-reload>Try again</button></div>` : '';

/** The whole site couldn't load (the catalog is missing or unreachable). */
export const loadError = () => `<section class="band"><div class="in narrow center"><h1 class="display">Kalam Learning couldn't load.</h1>
  <p class="sub center">Check your connection, then try again.</p><div class="ctas"><button type="button" class="pill big" data-reload>Try again</button></div></div></section>`;

/** Something went wrong while drawing a page: a way out instead of a blank screen. */
export const pageError = () => ({
  title: 'Something went wrong',
  html: `<section class="band"><div class="in narrow center"><h1 class="display">Something went wrong on this page.</h1>
  <p class="sub center">Your progress is safe. Try again, or go back to the home page.</p>
  <div class="ctas"><button type="button" class="pill big" data-reload>Try again</button><a class="link" href="#/">Go to the home page</a></div></div></section>`
});
