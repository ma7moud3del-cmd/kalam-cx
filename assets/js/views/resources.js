/** A course's files: practice workbooks, slides and printable tests per module, and guides. */
import { esc } from '../core/dom.js?v=5d6558d6';
import { CHEV } from '../core/icons.js?v=5d6558d6';
import { url, secsOf, filesOf, word } from '../data/course.js?v=5d6558d6';
import { trail } from '../ui/nav.js?v=5d6558d6';

/** @returns {import('../router.js').View} */
export function resources(c) {
  const all = c.resources || [], files = all.filter(r => r.type === 'xlsx'), docs = all.filter(r => r.type !== 'xlsx'), W = word(c);
  const tile = (r, open) => `<a class="doc ${r.type === 'xlsx' ? 'xl' : ''}" href="${esc(url(c, r.href))}" ${open ? 'target="_blank" rel="noopener"' : ''}><span class="badge">${esc(String(r.type || 'file').toUpperCase())}</span><b>${esc(r.title)}</b><span>${esc(r.summary || '')}</span><span class="link">${open ? 'Open' : 'Download'} ${CHEV}</span></a>`;
  const mods = secsOf(c).map((s, i) => [s, i, filesOf(c, s)]).filter(([, , f]) => f.slides || f.testPdf);
  return {
    title: `Resources · ${c.title}`, crumbs: trail(c, ['Resources']),
    html: `<section><div class="band slim"><div class="in">
  <h1 class="display">Resources.</h1><p class="sub wide">Practice files, slides, printable tests and guides for ${esc(c.title)}.</p>
  ${files.length ? `<h2 class="headline small">Practice files</h2><div class="grid3">${files.map(r => tile(r, false)).join('')}</div>` : ''}
  ${mods.length ? `<h2 class="headline small">By ${W.toLowerCase()}</h2><div class="grid3">${mods.map(([s, i, f]) => `<div class="doc"><span class="badge">PDF</span><b>${W} ${i + 1}: ${esc(s.title)}</b><span>${f.slides ? `<a href="${esc(f.slides)}" target="_blank" rel="noopener">Slides</a>` : ''}${f.slides && f.testPdf ? ' · ' : ''}${f.testPdf ? `<a href="${esc(f.testPdf)}" target="_blank" rel="noopener">Printable test with answer key</a>` : ''}</span></div>`).join('')}</div>` : ''}
  ${docs.length ? `<h2 class="headline small">Guides</h2><div class="grid3">${docs.map(r => tile(r, true)).join('')}</div>` : ''}</div></div></section>`
  };
}
