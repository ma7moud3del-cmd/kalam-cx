/** Fade-in of ".rv" elements as they scroll into view. Everything shows after 2.5 s even without IntersectionObserver. */
import { $, $$ } from '../core/dom.js?v=5d6558d6';

const io = 'IntersectionObserver' in window
  ? new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' })
  : null;

export function reveal(scope) {
  $$('.rv:not(.seen)', scope).forEach(el => io ? io.observe(el) : el.classList.add('seen'));
  setTimeout(() => { if (!$('.rv.seen', scope)) $$('.rv', scope).forEach(el => el.classList.add('seen')); }, 2500);
}
/** Show every ".rv" in scope at once (used after redrawing a list in place). */
export const revealNow = scope => $$('.rv', scope).forEach(e => e.classList.add('seen'));
