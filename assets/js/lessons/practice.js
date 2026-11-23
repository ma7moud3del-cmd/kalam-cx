/** Practice lessons: instructions plus the module's workbook and slides. */
import { esc } from '../core/dom.js?v=e03e6c67';
import { CHEV } from '../core/icons.js?v=e03e6c67';
import { actionBar } from './common.js?v=e03e6c67';

export const practiceLesson = {
  render(ctx) {
    const { L, F } = ctx;
    return `<div class="card"><p class="eyebrow">Practice</p>${(L.body || []).map(b => `<p>${esc(b)}</p>`).join('')}
      <div class="ctas left">${F.workbook ? `<a class="pill" href="${esc(F.workbook)}">Download the workbook</a>` : ''}${F.slides ? `<a class="link" href="${esc(F.slides)}" target="_blank" rel="noopener">Slides (PDF) ${CHEV}</a>` : ''}</div></div>
      ${actionBar(ctx, `About ${+L.minutes || 30} min · do it in Excel on your own copy`)}`;
  }
};
