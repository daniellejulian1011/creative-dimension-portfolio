/** "Copy email" buttons — honest feedback only after the clipboard write succeeds. */
import { toast } from './toast.js';

export function initCopy() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        toast('Email address copied');
      } catch {
        toast('Copy is not available here — the address is shown on the page');
      }
    });
  });
}
