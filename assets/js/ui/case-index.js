/** Highlights the current chapter in a case study's sticky index. */
export function initCaseIndex() {
  const links = [...document.querySelectorAll('.case-index a[href^="#"]')];
  if (!links.length || !('IntersectionObserver' in window)) return;
  const map = new Map(links.map((a) => [document.querySelector(a.getAttribute('href')), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
      const a = map.get(e.target);
      a?.classList.add('is-current');
      a?.setAttribute('aria-current', 'location');
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  map.forEach((_, section) => section && io.observe(section));
}
