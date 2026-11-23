/** Reusable pieces of markup: course cards, category tiles, resume rows, progress bars, the search box. */
import { esc } from '../core/dom.js?v=8ddd3cd7';
import { PLAY } from '../core/icons.js?v=8ddd3cd7';
import { plural, hrs, langShort, isFree, clock } from '../core/format.js?v=8ddd3cd7';
import { topicOf, topicId, live, listed, peopleOf } from '../data/catalog.js?v=8ddd3cd7';
import { url, vids, timeOf, modShort } from '../data/course.js?v=8ddd3cd7';
import { thumbOf } from '../data/media.js?v=8ddd3cd7';
import { progress } from '../progress/progress.js?v=8ddd3cd7';

/** A progress bar with an accessible label. */
export const bar = p => `<span class="pbar" role="img" aria-label="${p}% complete"><i style="width:${p}%"></i></span>`;

/** Course picture: its cover, else up to 4 YouTube thumbnails from the first module, else the Kalam mark. */
export function coverOf(c) {
  if (c.cover) return `<img src="${esc(url(c, c.cover))}" alt="" loading="lazy">`;
  const yt = c.sections.length ? vids(c.sections[0]).filter(v => v.yt).slice(0, 4) : [];
  if (yt.length) return `<span class="ytmosaic">${yt.map(v => `<img src="${esc(thumbOf(c, v))}" alt="" loading="lazy">`).join('')}</span>`;
  return '<span class="blank"><img src="img/kalam-mark.png" alt=""></span>';
}

/**
 * A course card for grids. Planned courses are not links and are clearly labelled.
 * @param {string[]} [hits] lesson titles that matched a search
 */
export function courseCard(c, hits) {
  const t = topicOf(c);
  if (c.soon) return `<div class="ccard soon rv"><span class="cimg">${coverOf(c)}<span class="tag">Planned</span></span><span class="cx"><small>${esc(t?.name || 'Course')}</small><b>${esc(c.title)}</b><span class="cs">${esc(c.subtitle || 'Not available yet.')}</span><span class="cm">Planned · not available yet</span></span></div>`;
  const T = timeOf(c), p = progress(c), who = peopleOf(c).map(x => x.name).join(', ');
  return `<a class="ccard rv" href="#/${c.id}"><span class="cimg">${coverOf(c)}<span class="play">${PLAY}</span></span><span class="cx"><small>${esc(t?.name || 'Course')}</small><b>${esc(c.title)}</b>
  ${who ? `<span class="cwho">${esc(who)}</span>` : ''}<span class="cs">${esc(c.subtitle || '')}</span>
  <span class="cm"><span>${esc(c.level || 'All levels')}</span><span>${T.video ? `${hrs(T.video)} video` : `${T.readings} lessons · ${hrs(T.reading)}`}</span><span>${esc(langShort(c))}</span><span class="${isFree(c) ? 'free' : ''}">${isFree(c) ? 'Free' : 'Paid'}</span></span>
  ${hits && hits.length ? `<span class="chits">Includes: ${hits.slice(0, 3).map(esc).join(' · ')}</span>` : ''}
  ${p.started ? `<span class="cp">${bar(p.pct)}<span>${p.pct}% done</span></span>` : ''}</span></a>`;
}

/** A category tile with its real course count (or "Planned"). */
export function categoryTile(t) {
  const k = live().filter(c => topicId(c) === t.id).length, soon = listed().filter(c => c.soon && topicId(c) === t.id).length;
  return `<a class="cat rv" href="#/categories/${esc(t.id)}"><b>${esc(t.name)}</b><span>${esc(t.blurb || '')}</span>
  <small class="${k ? '' : 'plan'}">${k ? plural(k, 'course') : soon ? 'Planned · coming later' : 'Planned · no courses yet'}</small></a>`;
}

/** "Module 2 · Lesson title · from 4:12": where Resume will take the learner. */
export function nextLine(c, p) {
  if (!p.at) return '';
  if (p.complete) return 'Course complete. Every step is done.';
  return `${p.started ? 'Next' : 'First'}: ${esc(modShort(c, p.at))} · ${esc(p.at.L.title)}${p.pos ? ` · from ${clock(p.pos)}` : ''}`;
}

/** A "continue learning" row: course, progress, next step and a Resume button. */
export function resumeRow(c) {
  const p = progress(c), label = p.complete ? 'Review' : p.done || p.pos ? 'Resume' : 'Start';
  return `<div class="rrow rv${p.complete ? ' fin' : ''}"><a class="rimg" href="#/${c.id}" tabindex="-1" aria-hidden="true">${coverOf(c)}</a><div class="rx"><small>${esc(topicOf(c)?.name || 'Course')}</small><a class="rt" href="#/${c.id}">${esc(c.title)}</a>
  <span class="cp">${bar(p.pct)}<span>${p.done} of ${plural(p.total, 'step')} · ${p.watched} of ${plural(p.videos, 'video')}${p.tests ? ` · ${p.pass} of ${plural(p.tests, 'test')} passed` : ''}</span></span>
  ${p.at ? `<span class="rnext">${nextLine(c, p)}</span>` : ''}</div>
  <a class="pill" href="${p.complete ? `#/${c.id}` : p.resume}">${label}<span class="sr"> ${esc(c.title)}</span></a></div>`;
}

/** The search box (submits to Explore). */
export const searchForm = q => `<form class="search" role="search" action="#/explore" data-search>
  <label class="sr" for="q">Search courses</label><input id="q" name="q" type="search" value="${esc(q || '')}" placeholder="Search courses and lessons, e.g. VLOOKUP" autocomplete="off">
  <button class="pill" type="submit">Search</button></form>`;
