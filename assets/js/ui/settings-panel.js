/**
 * Experience Settings dialog (native <dialog>: focus trap, Esc to close, inert page).
 * Every control writes through core/settings.js, so all pages and the 3D scene react.
 */
import * as settings from '../core/settings.js';
import { toast } from './toast.js';

export function initSettingsPanel() {
  const dialog = document.getElementById('settings-dialog');
  if (!dialog) return;
  const openers = document.querySelectorAll('[data-open-settings]');
  const qualityInputs = dialog.querySelectorAll('input[name="quality"]');
  const soundSwitch = dialog.querySelector('[data-setting="sound"]');
  const motionSwitch = dialog.querySelector('[data-setting="motion"]');
  const qualityHint = dialog.querySelector('[data-quality-hint]');
  const motionHint = dialog.querySelector('[data-motion-hint]');
  const qualityLabels = document.querySelectorAll('[data-quality-label]');
  let lastOpener = null;

  function sync() {
    const q = settings.get('quality');
    qualityInputs.forEach((input) => { input.checked = input.value === q; });
    qualityLabels.forEach((el) => { el.textContent = settings.QUALITY_LABELS[q]; });
    qualityHint.textContent = settings.isQualityAuto()
      ? `Auto-selected for this device: ${settings.QUALITY_LABELS[q]}. Choose another profile at any time.`
      : `You chose ${settings.QUALITY_LABELS[q]}. It is saved on this device.`;
    soundSwitch.setAttribute('aria-checked', String(!!settings.get('sound')));
    motionSwitch.setAttribute('aria-checked', String(settings.reducedMotion()));
    motionHint.textContent = settings.get('motion') === 'system'
      ? `Following your system setting (${settings.systemPrefersReducedMotion() ? 'reduced motion is on' : 'full motion'}).`
      : 'Your choice overrides the system setting on this site.';
  }

  openers.forEach((btn) => btn.addEventListener('click', () => {
    lastOpener = btn;
    sync();
    dialog.showModal();
  }));
  dialog.querySelector('[data-close-settings]').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); }); // backdrop
  dialog.addEventListener('close', () => { if (lastOpener) lastOpener.focus(); });

  qualityInputs.forEach((input) => input.addEventListener('change', () => {
    settings.set('quality', input.value);
    toast(`Graphics set to ${settings.QUALITY_LABELS[input.value]}`);
  }));
  soundSwitch.addEventListener('click', () => settings.set('sound', !settings.get('sound')));
  motionSwitch.addEventListener('click', () => {
    settings.set('motion', settings.reducedMotion() ? 'full' : 'reduce');
  });
  dialog.querySelector('[data-replay-intro]')?.addEventListener('click', () => {
    settings.set('introSeen', false);
    const home = document.documentElement.dataset.root + 'index.html';
    window.location.href = home;
  });
  dialog.querySelector('[data-reset-settings]')?.addEventListener('click', () => {
    settings.reset();
    toast('Settings reset to recommended defaults');
  });

  settings.onChange(sync);
  sync();
}
