/** Collections (curated videos, e.g. Expert Picks): a grid of video cards that open in the pop-up player. */
import { $$, esc } from '../core/dom.js?v=5d6558d6';
import { PLAY } from '../core/icons.js?v=5d6558d6';
import { extrasOf } from '../data/catalog.js?v=5d6558d6';
import { secsOf, vids, allLessons } from '../data/course.js?v=5d6558d6';
import { thumbOf } from '../data/media.js?v=5d6558d6';
import { Store } from '../progress/store.js?v=5d6558d6';
import { trail } from '../ui/nav.js?v=5d6558d6';
import { openVideo } from '../ui/modal.js?v=5d6558d6';
import { notFound } from './status.js?v=5d6558d6';

function videoCard(c, L) {
  return `<button class="yt rv" data-c="${c.id}" data-l="${esc(L.id)}"><span class="ytimg"><img src="${esc(thumbOf(c, L))}" alt="" loading="lazy"><span class="play">${PLAY}</span>${L.minutes ? `<span class="dur">${+L.minutes} min</span>` : ''}${Store.isDone(c.id, L.id) ? '<span class="seen-mark">✓<span class="sr"> Watched</span></span>' : ''}</span>
  <span class="ytx"><small>${esc(L.by || L.kind || '')}</small><b>${esc(L.title)}</b>${L.summary ? `<span>${esc(L.summary)}</span>` : ''}</span></button>`;
}

/**
 * A collection page. With `parent`, it's shown as that course's "Extra videos".
 * @returns {import('../router.js').View}
 */
export function collection(c, parent) {
  const [h1a, h1b] = c.headline || [c.title, ''];
  const groups = secsOf(c).map(s => `<div class="egroup"><p class="eyebrow">${esc(s.summary || '')}</p><h2 class="headline small2">${esc(s.title)}</h2><div class="ytgrid">${vids(s).map(L => videoCard(c, L)).join('')}</div></div>`).join('');
  return {
    title: c.title, crumbs: parent ? null : trail(c),
    html: `<section><div class="band dark ehero"><div class="in">
  <p class="eyebrow center">Extra videos</p><h1 class="display center">${esc(h1a)}${h1b ? `<br><span class="grad">${esc(h1b)}</span>` : ''}</h1>
  <p class="sub center wide">${esc(c.intro || c.subtitle)}</p><div class="who">${(c.who || []).map(w => `<span>${esc(w)}</span>`).join('')}</div></div></div>
  <div class="band"><div class="in">${groups}${allLessons(c).some(L => L.type === 'youtube') ? '<p class="note">These videos play from YouTube and belong to their creators. Kalam CX isn\'t affiliated with these channels.</p>' : ''}
  ${parent ? `<div class="ctas"><a class="pill" href="#/${parent.id}">Back to ${esc(parent.title)}</a></div>` : ''}</div></div></section>`,
    after() { $$('.yt').forEach(b => b.addEventListener('click', () => openVideo(b))); }
  };
}

/** A course's "Extra videos" page (its first collection). */
export function extras(c) {
  const ex = extrasOf(c); if (!ex.length) return notFound();
  const v = collection(ex[0], c);
  v.title = `Extra videos · ${c.title}`; v.crumbs = trail(c, ['Extra videos']);
  return v;
}
