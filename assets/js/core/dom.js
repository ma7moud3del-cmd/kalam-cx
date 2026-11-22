/** DOM helpers shared by every module. */

/** First element matching `sel` inside `root` (default: the document). */
export const $ = (sel, root = document) => root.querySelector(sel);
/** All elements matching `sel` inside `root`, as a real array. */
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ENT = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
/** Escape any value for use in HTML text or a quoted attribute. null/undefined become ''. */
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ENT[c]);

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
