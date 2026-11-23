/** Reading lessons: an optional picture and text blocks (heading, paragraph, copyable code). Opening counts as done. */
import { $, $$, esc } from '../core/dom.js?v=8ddd3cd7';
import { mediaUrl } from '../data/media.js?v=8ddd3cd7';
import { Store } from '../progress/store.js?v=8ddd3cd7';
import { actionBar, moduleFiles, showCompleted } from './common.js?v=8ddd3cd7';

/** Copy text to the clipboard; falls back to selecting it for older browsers. */
async function copyText(src) {
  try { await navigator.clipboard.writeText(src.textContent); return true; } catch (e) { /* fall through */ }
  const rg = document.createRange(); rg.selectNodeContents(src);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(rg);
  try { return document.execCommand('copy'); } catch (e) { return false; }
}

const block = (b, n) => `<section class="rb${b.tone === 'warn' ? ' warn' : ''}">${b.h ? `<h2>${esc(b.h)}</h2>` : ''}${b.p ? `<p>${esc(b.p)}</p>` : ''}${b.code != null ? `<div class="code"><pre id="code-${n}"><code>${esc(b.code)}</code></pre><button type="button" class="pill ghost small" data-copy="code-${n}" aria-label="Copy${b.h ? ': ' + esc(b.h) : ''}">Copy</button></div>` : ''}</section>`;

export const readingLesson = {
  render(ctx) {
    const { c, L } = ctx;
    const fig = L.image ? `<figure class="rfig"><a href="${esc(mediaUrl(c, L.image))}" target="_blank" rel="noopener" title="Open the picture full size"><img src="${esc(mediaUrl(c, L.image))}" alt="${esc(L.alt || '')}"></a><figcaption>Tap the picture to open it full size.</figcaption></figure>` : '';
    return `${fig}
      <div class="rblocks">${(L.blocks || []).map(block).join('')}</div>
      ${actionBar(ctx, `Reading${L.minutes ? ` · about ${+L.minutes} min` : ''}`)}${moduleFiles(ctx)}`;
  },
  wire(ctx) {
    Store.setDone(ctx.c.id, ctx.L.id); showCompleted();
    $$('[data-copy]').forEach(b => b.addEventListener('click', async () => {
      const ok = await copyText($('#' + b.dataset.copy));
      b.textContent = ok ? 'Copied' : 'Select and copy'; setTimeout(() => (b.textContent = 'Copy'), 1800);
    }));
  }
};
