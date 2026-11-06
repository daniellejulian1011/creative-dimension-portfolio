/**
 * Shared bootstrap for every page (native ES module, no build step).
 * Page-specific modules (home scene, gallery, lightbox) initialise only when their
 * markup is present, so one entry point serves the whole site.
 */
import { applyToDocument } from './core/settings.js';
import { initNav } from './ui/nav.js';
import { initSettingsPanel } from './ui/settings-panel.js';
import { initSound } from './ui/sound.js';
import { initReveal } from './ui/reveal.js';
import { initAmbient } from './ui/ambient.js';
import { initGallery } from './ui/gallery.js';
import { initLightbox } from './ui/lightbox.js';
import { initCaseIndex } from './ui/case-index.js';
import { initCopy } from './ui/copy.js';

applyToDocument();
document.documentElement.classList.add('has-js');
document.documentElement.classList.remove('no-js');

initNav();
initSettingsPanel();
initSound();
initReveal();
initAmbient();
initGallery();
initLightbox();
initCaseIndex();
initCopy();

if (document.body.dataset.page === 'home') {
  import('./home/home.js').then((m) => m.initHome()).catch((err) => {
    console.error('[home] failed to start', err);
    document.documentElement.classList.add('is-fallback');
    document.documentElement.dataset.intro = 'skip';
  });
}
