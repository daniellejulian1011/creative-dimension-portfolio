/**
 * Work gallery filters: real <button aria-pressed> filters, deep-linkable
 * (?category=branding), result count announced politely, FLIP transition for
 * cards that stay, quick fade for cards that enter (exit faster than enter).
 * Without JS every project is listed, so nothing is ever hidden from no-JS users.
 */
import { reducedMotion } from '../core/settings.js';

export function initGallery() {
  const root = document.querySelector('[data-gallery]');
  if (!root) return;
  const buttons = [...root.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-categories]')];
  const status = root.querySelector('[data-gallery-status]');
  const labels = Object.fromEntries(buttons.map((b) => [b.dataset.filter, b.dataset.label]));

  function apply(filter, { push = true, animate = true } = {}) {
    if (!labels[filter]) filter = 'all';
    const first = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
    let shown = 0;
    cards.forEach((card) => {
      const match = filter === 'all' || card.dataset.categories.split(' ').includes(filter);
      card.classList.toggle('is-hidden', !match);
      if (match) shown += 1;
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    status.textContent = filter === 'all'
      ? `Showing all ${shown} works`
      : `Showing ${shown} ${shown === 1 ? 'work' : 'works'} in ${labels[filter]}`;

    if (animate && !reducedMotion() && 'animate' in Element.prototype) {
      cards.forEach((card) => {
        if (card.classList.contains('is-hidden')) return;
        const a = first.get(card);
        const b = card.getBoundingClientRect();
        if (a.width === 0) {
          card.animate([{ opacity: 0, transform: 'translateY(14px) scale(0.98)' }, { opacity: 1, transform: 'none' }],
            { duration: 380, easing: 'cubic-bezier(0.22,1,0.36,1)' });
        } else if (a.left !== b.left || a.top !== b.top) {
          card.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: 'none' }],
            { duration: 420, easing: 'cubic-bezier(0.22,1,0.36,1)' });
        }
      });
    }
    if (push) {
      const url = new URL(window.location.href);
      if (filter === 'all') url.searchParams.delete('category'); else url.searchParams.set('category', filter);
      history.replaceState(null, '', url);
    }
  }

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  const initial = new URLSearchParams(window.location.search).get('category') || 'all';
  apply(initial, { push: false, animate: false });
}
