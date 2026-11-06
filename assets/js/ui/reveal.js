/**
 * Scroll reveal (UI UX Pro Max GSAP preset “Scroll Reveal”: 300–400ms, power1.out,
 * small 8–16px offset) implemented with IntersectionObserver + CSS transitions.
 * Content is visible without JS; reduced motion renders the final state immediately.
 */
import { reducedMotion } from '../core/settings.js';

export function initReveal(root = document) {
  const items = [...root.querySelectorAll('[data-reveal]')];
  if (!items.length) return;
  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-revealed'));
    return;
  }
  // Stagger siblings that share a parent (0.04s per item, capped).
  const groups = new Map();
  items.forEach((el) => {
    const i = groups.get(el.parentElement) || 0;
    el.style.setProperty('--reveal-i', String(Math.min(i, 8)));
    groups.set(el.parentElement, i + 1);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
  items.forEach((el) => io.observe(el));
}
