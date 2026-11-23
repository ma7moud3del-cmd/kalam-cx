/** Home: headline, continue learning, the courses, and how a course works. */
import { esc } from '../core/dom.js?v=e03e6c67';
import { CHEV } from '../core/icons.js?v=e03e6c67';
import { App, live, listed, planned, topicId, siteName } from '../data/catalog.js?v=e03e6c67';
import { Store } from '../progress/store.js?v=e03e6c67';
import { courseCard, resumeRow } from '../ui/cards.js?v=e03e6c67';
import { failedNote } from './status.js?v=e03e6c67';

/** Courses the learner has started, most recent first. */
export const startedCourses = () => live().filter(c => Store.started(c.id)).sort((a, b) => Store.at(b.id) - Store.at(a.id));

/** Optional team photo band, set by platform.team in the catalog (no block = no band). */
function teamBand(T) {
  if (!T || !T.photo) return '';
  const set = T.photoSmall ? ` srcset="${esc(T.photoSmall)} 768w, ${esc(T.photo)} 1280w${T.photoLarge ? `, ${esc(T.photoLarge)} 1920w` : ''}" sizes="(max-width:833px) calc(100vw - 44px), 940px"` : '';
  return `<div class="band tight teamb"><div class="in"><div class="team rv"><img src="${esc(T.photo)}"${set} width="1280" height="720" alt="${esc(T.alt || '')}" loading="lazy" decoding="async">
  <div class="tx">${T.eyebrow ? `<p class="eyebrow">${esc(T.eyebrow)}</p>` : ''}<h2 class="headline small2">${esc(T.title || 'Learn together. Grow together.')}</h2>${T.text ? `<p class="sub">${esc(T.text)}</p>` : ''}</div></div></div></div>`;
}

/** @returns {import('../router.js').View} */
export function home() {
  const P = App.cat.platform, [h1a, h1b] = P.headline || ['Upgrade your skills.', 'Lead with confidence.'], started = startedCourses().slice(0, 3);
  const empty = App.topics.filter(t => !listed().some(c => topicId(c) === t.id));
  return {
    title: siteName(),
    html: `<section class="hero compact"><div class="in">
  <p class="eyebrow center rv">${esc(siteName())}</p>
  <h1 class="mega center rv">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
  <p class="sub center wide rv">${esc(P.intro)}</p></div></section>
 ${started.length ? `<div class="band tight"><div class="in"><h2 class="headline small2 rv">Continue learning.</h2><div class="rows">${started.map(resumeRow).join('')}</div></div></div>` : ''}
 <div class="band tight"><div class="in"><div class="th2"><h2 class="headline small2 rv">Courses.</h2><a class="link rv" href="#/explore">Search all courses ${CHEV}</a></div>
  <div class="cgrid two">${live().map(c => courseCard(c)).join('')}${planned().map(c => courseCard(c)).join('')}</div>
  ${failedNote(App.failed.length)}
  ${empty.length ? `<p class="note left rv">Planned topics, no courses yet: ${empty.map(t => esc(t.name)).join(' · ')}.</p>` : ''}</div></div>
 ${teamBand(P.team)}
 <div class="band gray"><div class="in"><h2 class="headline center rv">How a course works.</h2>
  <div class="steps three"><div class="rv"><b>1</b><h3>Watch</h3><p>Short videos, one skill at a time, in the trainer's own voice.</p></div><div class="rv"><b>2</b><h3>Practise</h3><p>Do it yourself in the session workbook.</p></div><div class="rv"><b>3</b><h3>Check</h3><p>A self-marking test after each session, then a final task. Progress is saved in this browser only.</p></div></div></div></div>`
  };
}
