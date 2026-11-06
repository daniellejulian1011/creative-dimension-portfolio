# The Creative Dimension — Danielle Julian

An immersive, cinematic, interactive graphic design and UX/UI portfolio.

An immersive, cinematic, interactive graphic design and UX/UI portfolio for **Berry Vibes Studio**. Tagline: *Playful Systems. Purposeful Stories.*

It is a static, build-free site: plain HTML, CSS and native ES modules, with **Three.js r170** (WebGL2) for the 3D homepage. It runs on GitHub Pages as-is, with no Node.js, npm, bundler or server needed.

## What's inside

| Page | What it does |
|---|---|
| `index.html` | The intro plays once and can be skipped. Its progress bar reflects real loading. The camera then flies from the moon gate into a 3D courtyard with **three interactive portals**: Visual Design, Interactive Design and Digital Worlds. Below the portals, the page continues as scroll-told story chapters. |
| `visual-design.html`, `interactive-design.html`, `digital-worlds.html` | Portal destinations (the "wings"), with projects grouped by category. |
| `work.html` | Gallery with working filters for All, UX/UI, Branding, Web, Interaction, Advertising, Visual and Digital Worlds. Filters can be linked to directly, e.g. `work.html?category=branding`. |
| `projects/*.html` | 45 project pages, including UX case studies for SaveSip/Cup$i, SmartCart and Crosswalks, plus an artwork viewer. |
| `about.html`, `resume.html`, `contact.html` | Studio and about page, an accessible HTML résumé with a PDF preview and download, and real contact links. |
| `CREDITS.html` | Licences for third-party assets (generated from `ASSET_CREDITS.md`). |

**Experience Settings** (the Graphics button in the header) offers Lite, Balanced and High quality profiles that change real rendering work. It also has a sound toggle (off by default; the sound is synthesised, so there are no audio files), a reduced-motion toggle, a control guide, and replay-intro and reset buttons. Settings persist per browser.

## Project structure

```
index.html … projects/*.html   generated pages (committed, served as-is)
assets/css/                     tokens.css → base.css → components.css → home.css | pages.css
assets/js/app.js                shared entry (native ES module)
assets/js/core/settings.js      persisted settings + device-capability detection
assets/js/ui/                   nav, settings dialog, sound, reveal, ambient petals, gallery, viewer…
assets/js/home/home.js          intro, WebGL detection/fallback, portal hotspots, render pausing
assets/js/scene/                Three.js world: world.js, architecture.js, blossoms.js, atmosphere.js,
                                portals.js, textures.js (procedural), quality.js (profiles)
assets/img/work/                Danielle's artwork (WebP, extracted from the portfolio PDF)
assets/env/                     CC0 Poly Haven HDRIs (EXR)
assets/docs/                    résumé PDF + preview
vendor/three-0.170.0/           pinned Three.js build + the add-ons used (MIT)
data/projects.json              ALL portfolio content (single source of truth)
src/pages/                      hand-written page bodies (home, about, résumé, contact)
tools/build_site.py             static page generator (Python 3 stdlib only)
tools/extract_assets.py         artwork extraction from the portfolio PDF
design-system/                  design system (MASTER.md) + UI UX Pro Max research log
```

## Editing content

1. Edit `data/projects.json` for projects, case-study text, image alt text and categories, or `src/pages/*.html` for the home, about, résumé and contact copy.
2. Rebuild the pages. This needs only Python 3, which the Claude Code cloud environment has:

   ```bash
   python3 tools/build_site.py
   ```

3. New artwork from an updated portfolio PDF: add `images[]` entries with the `pdfimages -list` id, then run:

   ```bash
   python3 tools/extract_assets.py path/to/portfolio.pdf
   ```

## Deploy to GitHub Pages

1. Merge the pull request into `main`.
2. On GitHub, go to **Settings → Pages → Build and deployment**.
3. Set **Source** to *Deploy from a branch*, the branch to `main`, and the folder to `/ (root)`, then **Save**.
4. After a minute the site is live at `https://daniellejulian1011.github.io/creative-dimension-portfolio/`.

All paths are relative, so the repository sub-path works without configuration. The `.nojekyll` file stops Jekyll from processing the site, and `404.html` works at any depth.

## Verify the 3D experience in your own Chrome

Automated cloud browsers render WebGL in software (SwiftShader), so final visual and performance checks belong on a real GPU:

1. Open the live URL in desktop Chrome. To see the intro again, open Graphics → **Replay intro**, or use an Incognito window.
2. Watch the loading percentage advance, press **Enter the Dimension**, and confirm the camera glides from the moon gate to the three portals.
3. Hover each portal: its light rises and a preview appears. Click one to see the portal flood with light and open its page.
4. Open **Graphics** and switch between Lite, Balanced and High. Mirror reflections and bloom appear on Balanced and High; High adds lantern lights, more petals and sharper shadows.
5. To test the fallback, quit Chrome and start it with the `--disable-webgl` flag (or use a browser with WebGL turned off). The designed vector scene replaces 3D, and every portal and page stays usable.
6. To test reduced motion, either turn on the site's *Reduce motion* setting, or use DevTools → Rendering → *Emulate CSS prefers-reduced-motion*.

## Dependencies (pinned)

| Dependency | Version | Delivery |
|---|---|---|
| Three.js | 0.170.0 | Vendored in `vendor/three-0.170.0/` (sha512 verified against the npm registry), loaded through the import map in `index.html`. To use a CDN instead, replace the two import-map URLs with `https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js` and `https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/`. |
| Cormorant, Montserrat | Google Fonts | `fonts.googleapis.com` stylesheet (`display=swap`, falls back to system serif and sans). |

The site has no other runtime dependencies. GSAP was considered but not needed: motion uses CSS, the Web Animations API and IntersectionObserver.

## Design intelligence

The design decisions were made with the repository's **UI UX Pro Max** skill. See `design-system/the-creative-dimension/MASTER.md` for the final system and `research/uupm-search-log.md` for the raw search outputs.
