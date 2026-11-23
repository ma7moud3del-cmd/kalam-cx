/** DOM helpers shared by every module. */

/** First element matching `sel` inside `root` (default: the document). */
export const $ = (sel, root = document) => root.querySelector(sel);
/** All elements matching `sel` inside `root`, as a real array. */
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape any value for use in HTML text or a quoted attribute. null/undefined become ''. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ENT[c]);

/**
 * A link or file address that is safe to put in href/src: http(s), protocol-relative or relative.
 * Anything with another scheme (javascript:, data:, vbscript:, file:) becomes ''. Still pass the result through esc().
 */
export const safeUrl = u => {
  const s = String(u ?? '').trim();
  return /^[a-z][a-z0-9+.-]*:/i.test(s) && !/^https?:/i.test(s) ? '' : s;
};

/* safeHtml(): the tags and attributes course.json may use in its HTML fields (exam tasks, answer keys) */
const TAGS = new Set('P BR HR STRONG B EM I U S SMALL MARK SUB SUP CODE PRE KBD BLOCKQUOTE UL OL LI DL DT DD H2 H3 H4 H5 H6 TABLE CAPTION COLGROUP COL THEAD TBODY TFOOT TR TH TD SPAN DIV A IMG FIGURE FIGCAPTION'.split(' '));
const DROP = new Set('SCRIPT STYLE IFRAME FRAME OBJECT EMBED TEMPLATE NOSCRIPT LINK META BASE FORM INPUT BUTTON TEXTAREA SELECT SVG MATH'.split(' '));
const ATTRS = new Set(['href', 'src', 'alt', 'title', 'colspan', 'rowspan', 'scope', 'class', 'start', 'width', 'height']);

/**
 * Clean HTML written in course.json before it goes into the page: only simple text, list and table markup is kept.
 * Scripts, frames, forms, event handlers (onclick=…), style and unsafe links are removed; unknown tags keep their text.
 * The template element parses without running anything or loading images.
 */
export function safeHtml(html) {
  const t = document.createElement('template');
  t.innerHTML = String(html ?? '');
  [...t.content.querySelectorAll('*')].forEach(el => {
    const tag = el.tagName.toUpperCase();
    if (!TAGS.has(tag)) { if (DROP.has(tag)) el.remove(); else el.replaceWith(...el.childNodes); return; }
    [...el.attributes].forEach(a => {
      const n = a.name.toLowerCase();
      if (!ATTRS.has(n) || ((n === 'href' || n === 'src') && !safeUrl(a.value))) el.removeAttribute(a.name);
    });
    if (tag === 'A' && /^(https?:)?\/\//i.test(el.getAttribute('href') || '')) { el.target = '_blank'; el.rel = 'noopener noreferrer'; }
  });
  return t.innerHTML;
}

/** Move keyboard focus to a heading (or any element) without scrolling, making it focusable if needed. */
export function focusEl(el) {
  if (!el) return;
  if (el.tabIndex < 0 && !el.hasAttribute('tabindex')) el.tabIndex = -1;
  el.focus({ preventScroll: true });
}

/** Read / write localStorage without ever throwing (private mode, blocked storage, full quota). */
export const storage = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); return true; } catch (e) { return false; } }
};
