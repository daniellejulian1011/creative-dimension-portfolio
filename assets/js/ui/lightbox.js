/**
 * Artwork viewer. Opens any [data-lightbox] button in a native <dialog>.
 * Images are never enlarged beyond their original pixel width (no blurry upscaling);
 * click/Enter toggles zoom to 100%; ←/→ step through the artwork set on the page.
 */
export function initLightbox() {
  const triggers = [...document.querySelectorAll('[data-lightbox]')];
  const dialog = document.getElementById('lightbox');
  if (!triggers.length || !dialog) return;
  const img = dialog.querySelector('img');
  const title = dialog.querySelector('[data-lb-title]');
  const count = dialog.querySelector('[data-lb-count]');
  const stage = dialog.querySelector('.lightbox__stage');
  const prev = dialog.querySelector('[data-lb-prev]');
  const next = dialog.querySelector('[data-lb-next]');
  let index = 0;
  let opener = null;

  function show(i) {
    index = (i + triggers.length) % triggers.length;
    const t = triggers[index];
    stage.classList.remove('is-zoomed');
    img.src = t.dataset.full;
    img.alt = t.dataset.alt || '';
    img.style.setProperty('--natural-w', `${t.dataset.w}px`);
    stage.style.setProperty('--natural-w', `${t.dataset.w}px`);
    img.width = Number(t.dataset.w); img.height = Number(t.dataset.h);
    title.textContent = t.dataset.caption || '';
    count.textContent = `${index + 1} / ${triggers.length}`;
    const single = triggers.length < 2;
    prev.hidden = single; next.hidden = single;
  }

  triggers.forEach((t, i) => t.addEventListener('click', () => {
    opener = t;
    show(i);
    dialog.showModal();
  }));
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  img.addEventListener('click', () => stage.classList.toggle('is-zoomed'));
  dialog.querySelector('[data-lb-close]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  dialog.addEventListener('close', () => { img.removeAttribute('src'); opener?.focus(); });
}
