/** Explore: search + filters over the real course data. Filters live in the URL (#/explore?q=&topic=…) so links can be shared. */
import { $, $$, esc } from '../core/dom.js?v=8ddd3cd7';
import { LANG, plural, isFree } from '../core/format.js?v=8ddd3cd7';
import { App, live, planned, topicId, topicOf, peopleOf } from '../data/catalog.js?v=8ddd3cd7';
import { secsOf, allLessons, timeOf } from '../data/course.js?v=8ddd3cd7';
import { courseCard, searchForm } from '../ui/cards.js?v=8ddd3cd7';
import { revealNow } from '../ui/reveal.js?v=8ddd3cd7';
import { failedNote } from './status.js?v=8ddd3cd7';

const DUR = [['short', 'Under 2 hours of video', m => m < 120], ['medium', '2 to 6 hours of video', m => m >= 120 && m <= 360], ['long', 'Over 6 hours of video', m => m > 360]];

/**
 * Does the course match every word of the query? Also returns matching lesson titles to show on the card.
 * @returns {{ok:boolean, hits:string[]}}
 */
export function searchHits(c, q) {
  if (!q) return { ok: true, hits: [] };
  const words = q.toLowerCase().split(/\s+/).filter(Boolean), t = topicOf(c);
  const head = [c.title, c.subtitle, c.intro, ...(c.description || []), ...(c.outcomes || []), t?.name, ...peopleOf(c).map(p => p.name), ...secsOf(c).map(s => `${s.title} ${s.covers || ''}`)].join(' ').toLowerCase();
  const lessons = allLessons(c).filter(L => L.title);
  const hits = lessons.filter(L => words.every(w => L.title.toLowerCase().includes(w))).map(L => L.title);
  const ok = words.every(w => head.includes(w) || lessons.some(L => L.title.toLowerCase().includes(w)));
  return { ok, hits: [...new Set(hits)] };
}

const select = (name, label, items, cur) => `<label class="flt"><span>${label}</span><select name="${name}"><option value="">Any</option>${items.map(([v, t]) => `<option value="${esc(v)}"${cur === v ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select></label>`;
const params = () => new URLSearchParams(location.hash.split('?')[1] || '');

/** @param {URLSearchParams} Q  @returns {import('../router.js').View} */
export function explore(Q) {
  const all = live(), soon = planned();
  const levels = [...new Set(all.map(c => c.level).filter(Boolean))], langs = [...new Set(all.map(c => c.language).filter(Boolean))];
  const html = `<section><div class="band slim"><div class="in">
  <h1 class="display rv">Courses.</h1><p class="sub wide rv">Search every course and lesson, or narrow by topic, level, language, length and price.</p>
  ${searchForm(Q.get('q'))}
  <form class="filters" id="flt" aria-label="Filter courses">
   ${select('topic', 'Topic', App.topics.map(t => [t.id, t.name]), Q.get('topic') || '')}
   ${select('level', 'Level', levels.map(l => [l, l]), Q.get('level') || '')}
   ${select('lang', 'Language', langs.map(l => [l, LANG[l] || l]), Q.get('lang') || '')}
   ${select('dur', 'Video length', DUR.map(([v, t]) => [v, t]), Q.get('dur') || '')}
   ${select('price', 'Price', [['free', 'Free'], ['paid', 'Paid']], Q.get('price') || '')}
   <button type="button" class="link btnlink" id="clr">Clear filters</button></form>
  <p class="count" id="count" role="status" aria-live="polite"></p>
  <div class="cgrid" id="results"></div>
  ${failedNote(App.failed.length)}
  ${soon.length ? `<h2 class="headline small2 rv">Planned.</h2><p class="tblurb">Not available yet. Shown so you know what's coming.</p><div class="cgrid">${soon.map(c => courseCard(c)).join('')}</div>` : ''}
  </div></div></section>`;

  function draw() {
    const P = params(), q = (P.get('q') || '').trim(), d = DUR.find(x => x[0] === P.get('dur'));
    const res = all.map(c => [c, searchHits(c, q)]).filter(([c, s]) => s.ok
      && (!P.get('topic') || topicId(c) === P.get('topic')) && (!P.get('level') || c.level === P.get('level')) && (!P.get('lang') || c.language === P.get('lang'))
      && (!d || d[2](timeOf(c).video)) && (!P.get('price') || (P.get('price') === 'free') === isFree(c)));
    const plannedTopic = App.topics.find(t => t.id === P.get('topic')) && !all.some(c => topicId(c) === P.get('topic'));
    $('#results').innerHTML = res.map(([c, s]) => courseCard(c, s.hits)).join('') || `<div class="empty"><h3>No courses match.</h3><p>${plannedTopic ? 'This topic is planned and has no courses yet. ' : ''}Try fewer filters or another word.</p></div>`;
    $('#count').textContent = `${plural(res.length, 'course')}${q ? ` for "${q}"` : ''}`;
    revealNow($('#results'));
  }
  /* write the form into the URL without adding a history entry, then redraw */
  function push() {
    const P = new URLSearchParams(), q = $('#q').value.trim(); if (q) P.set('q', q);
    $$('#flt select').forEach(s => s.value && P.set(s.name, s.value));
    history.replaceState(null, '', '#/explore' + (P.toString() ? '?' + P : '')); draw();
  }
  let timer = 0;
  return {
    title: 'Courses', crumbs: [['Home', '#/'], ['Courses']], html,
    after() {
      draw();
      $('#flt').addEventListener('change', push);
      $('[data-search]').addEventListener('submit', e => { e.preventDefault(); push(); });
      $('#q').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(push, 250); });
      $('#clr').addEventListener('click', () => { $$('#flt select').forEach(s => (s.value = '')); push(); });
    }
  };
}
