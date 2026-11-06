/** Header behaviour: compact mobile menu (Esc / outside click closes) + scrolled state. */
export function initNav() {
  const header = document.querySelector('.site-header');
  const btn = document.querySelector('[data-menu-toggle]');
  const list = document.getElementById('site-nav-list');
  if (btn && list) {
    const close = (focusButton = false) => {
      list.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      if (focusButton) btn.focus();
    };
    btn.addEventListener('click', () => {
      const open = !list.classList.contains('is-open');
      list.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) list.querySelector('a')?.focus();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && list.classList.contains('is-open')) close(true);
    });
    document.addEventListener('click', (e) => {
      if (list.classList.contains('is-open') && !list.contains(e.target) && !btn.contains(e.target)) close();
    });
    matchMedia('(min-width: 861px)').addEventListener('change', () => close());
  }
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
}
