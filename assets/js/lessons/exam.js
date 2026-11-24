/** The final assessment: a workbook, the tasks (HTML from course.json, cleaned by safeHtml) and a hidden answer key. Self-marked. */
import { $, $$, esc, safeHtml } from '../core/dom.js?v=175c4d96';
import { CHEV } from '../core/icons.js?v=175c4d96';
import { url } from '../data/course.js?v=175c4d96';
import { actionBar } from './common.js?v=175c4d96';

export const examLesson = {
  render(ctx) {
    const { c, L } = ctx, R = L.resources || [];
    const wb = R.find(r => r.type === 'xlsx'), pdf = R.find(r => r.type === 'pdf');
    return `<p class="sub">${esc(L.intro || 'Open the workbook, complete every task, then reveal the answer key.')}${L.minutes ? ` ${esc(L.minutes)} minutes.` : ''}</p>
      <div class="ctas left">${wb ? `<a class="pill" href="${esc(url(c, wb.href))}">Download the workbook</a>` : ''}${pdf ? `<a class="link" href="${esc(url(c, pdf.href))}" target="_blank" rel="noopener">Printable exam ${CHEV}</a>` : ''}</div>
      <h2 class="headline small">The tasks</h2><div class="card exam">${safeHtml(L.html)}</div>
      ${L.keyHtml ? `<div class="center"><button class="pill ghost" id="keybtn" aria-expanded="false" aria-controls="key">Show the answer key</button></div><div id="key" class="card key" hidden>${safeHtml(L.keyHtml)}</div>` : ''}
      ${actionBar(ctx, 'Self-marked. Your result isn\'t sent anywhere.')}`;
  },
  wire() {
    /* wide tables scroll sideways on phones */
    $$('.exam table,.key table').forEach(t => { const w = document.createElement('div'); w.className = 'tw'; t.parentNode.insertBefore(w, t); w.appendChild(t); });
    const btn = $('#keybtn');
    if (btn) btn.onclick = () => {
      const k = $('#key'); k.hidden = !k.hidden;
      btn.setAttribute('aria-expanded', !k.hidden); btn.textContent = k.hidden ? 'Show the answer key' : 'Hide the answer key';
    };
  }
};
