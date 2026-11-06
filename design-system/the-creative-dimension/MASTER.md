# The Creative Dimension — Design System (MASTER)

This file is the source of truth for the site's visual and interaction rules. Implementation:

- Tokens: `assets/css/tokens.css`
- Components: `assets/css/components.css`
- Pages: `assets/css/home.css` and `assets/css/pages.css`

Evidence: every UI UX Pro Max query and its raw output is in `research/uupm-search-log.md`.

**Priority order:** Danielle's visual references, then UI UX Pro Max findings, then general best practice. Where the skill's suggestion conflicted with the references, the references won. Each conflict is recorded below.

---

## 1. UI UX Pro Max findings and how they were applied

| Query | Skill result | Decision |
|---|---|---|
| `--design-system` "cinematic immersive creative portfolio storytelling" (variance 7, motion 8, density 3) | Pattern: **Scroll-Triggered Storytelling**. Style: Brutalism. Colours: monochrome plus blue. Type: Archivo + Space Grotesk | **Pattern adopted.** The homepage below the portals runs as chapters: Intro hook → Chapter I (work) → II (philosophy) → III (process) → climax CTA. The pattern's reduced-motion rule is adopted too: final readable state, no scrub. **Style, colours and type rejected.** They contradict the reference screenshots (plum, rose-gold, ornate, serif) and the brief ("not a generic dark SaaS website"). |
| `style` "immersive 3D storytelling portfolio" | 3D & Hyperrealism; Skeuomorphism; **Parallax Storytelling**; **Motion-Driven** | Combined: a real 3D courtyard (3D & Hyperrealism) plus Motion-Driven page reveals. Every style row lists `requires: contrast-text-4.5, keyboard, visible-focus, reduced-motion` and all four are implemented. |
| `typography` "elegant editorial luxury serif" | Classic Elegant (Playfair/Inter); **Luxury Serif (Cormorant + Montserrat)**; Cinzel/Josefin | **Cormorant + Montserrat.** Cormorant's high-contrast classical capitals and italics match the reference titles ("THE CREATIVE DIMENSION", italic "Danielle Julian"). Montserrat gives exceptionally readable UI and body text. |
| `color` "dark luxury magenta plum" | Auction, E-commerce Luxury, **Beauty/Spa (soft pink + lavender luxury)**, Hotel | No database palette matched plum. The closest hue family (pink + lavender luxury) confirmed the direction, so Danielle's provisional palette was kept and refined. The contrast rule from the `ux` domain was applied below. |
| `landing` "storytelling portfolio gallery" | Portfolio Grid; Horizontal Scroll Journey; Scroll-Triggered Storytelling | Gallery uses Portfolio Grid ("let work shine"); home uses Scroll-Triggered Storytelling. |
| `gsap` "scroll reveal stagger" | Scroll Reveal **300–400 ms, power1.out, 8–16 px offset**; Stagger **0.02–0.04 s per item**; never hide SEO content without a no-JS fallback | Implemented with IntersectionObserver and CSS: `--dur-base: 320ms`, `--ease-soft`, `--reveal-distance: 14px`, 40 ms stagger capped at 8 items. Content is visible without JS. GSAP itself was not needed (no runtime dependency added). |
| `ux` reduced motion / excessive motion | Respect `prefers-reduced-motion`; animate 1–2 key elements per view | OS preference plus an in-site toggle. Under reduced motion: no camera flight, parallax, petals or reveal offsets, and the scene time is slowed. Each view has one hero motion (the camera or the portal glow). |
| `ux` focus / focus not obscured / skip links / sticky nav | Visible focus ring on every control; keep the focused element unobscured; skip link; offset for the sticky header | 2 px rose focus ring with 3 px offset; `scroll-padding-top` = header height; a skip link on every page; native `<dialog>` for settings and the viewer. |
| `ux` touch target / hover vs tap | 44 px (iOS) / 48 dp; WCAG minimum 24 px; never hover-only | All controls are ≥ 44 px. Portal previews are an enhancement only: tap or Enter navigates directly. Automated QA reported no targets < 24 px. |
| `ux` loading / progress / content jumping / font loading | Progress indicators; keep layout stable; reserve space | The intro progress bar counts real work (fonts, 3D engine, HDRI and artworks via `THREE.LoadingManager`). Images carry `width`/`height`; fonts use `display=swap`. |
| `ux` lazy loading / alt text / image optimisation | Lazy-load below the fold; descriptive alt; WebP | All artwork is WebP with 480 px thumbnails; below-the-fold images are `loading="lazy"`, hero images `fetchpriority="high"`; every artwork has descriptive alt text in `data/projects.json`. |
| `threejs` pixel ratio / resize / dispose / loop / shadows / tone mapping / canvas label | Cap DPR at 2; update aspect on resize; dispose textures and geometry; `setAnimationLoop` + pause on hidden; shadows on the key light only; set `outputColorSpace` + `toneMapping`; give the canvas `role="img"` + `aria-label` | All implemented in `assets/js/scene/world.js` (ResizeObserver, `dispose()`, render pause when the tab is hidden **or** the hero is scrolled off-screen, selective shadows, ACES tone mapping + sRGB output, labelled canvas). |
| `threejs` "postprocessing bloom" and retry "EffectComposer" | **0 results both times** | **Fallback, not a database match:** UnrealBloomPass with a high threshold (0.92) so only emissive trims, bulbs and lanterns bloom. Off on Lite. |

---

## 2. Colour

The palette is Danielle's provisional palette. Contrast was measured with the WCAG formula and the pairings below were adjusted.

| Token | Hex | Role | Contrast |
|---|---|---|---|
| `--surface-base` | `#180C23` Midnight Plum | page background | — |
| `--surface-raised` | `#2B103A` Blackberry | panels, cards | — |
| `--burgundy-600` | `#521D43` Deep Burgundy | depth, gradients | — |
| `--text-primary` | `#FFF5EB` Warm Ivory | body and headings | 17.5:1 on base |
| `--text-secondary` | `#D9C6DF` | secondary text | 10.6:1 on raised |
| `--text-tertiary` | `#BFA9C8` | captions, meta | 7.9:1 on raised |
| `--text-accent` | `#F7B4D4` Soft Rose | display accents, links | 11.1:1 on base |
| `--accent` | `#EA478B` Berry Pink | glows, borders, large or bold text only | 5.2:1 on base |
| `--accent-fill` | `#C42E6E` Berry Deep | **filled buttons** | ivory text 4.9:1 |
| `--accent-fill-pressed` | `#B3285F` | pressed state | ivory text 5.8:1 |
| `--text-gold` / `--metal` | `#E6A98D` Rose Gold | eyebrows, frames, metal | 9.3:1 on base |
| `--accent-cool` | `#B89DFA` Lavender Glow | secondary light (Interactive portal) | 8.3:1 on base |

**Refinement:** ivory text on Berry Pink is only 3.38:1 (fails AA), so filled buttons use the deeper `#C42E6E → #B3285F` gradient. Berry Pink is kept for glows and accents.

**Restraint:** at most one bright accent per component. Lavender appears only as secondary light.

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Display | **Cormorant** 400/500/600 + italic 400/500 | Art-directed: an uppercase stack for the hero; italics carry names and emphasis (`<em>`); tracking +0.01 to 0.08em. |
| Body / UI | **Montserrat** 400/500/600/700 | 16 px minimum, line-height 1.65, caps labels 13 px at +0.16em. |

Scale: `--fs-xs` 13 → `--fs-hero` clamp(3rem … 6.4rem). The hero title is capped at 5.6rem so it never collides with the portals.

## 4. Component rules

- **Buttons.** Primary uses the berry gradient fill with an ivory label and glow. Ghost uses a rose-gold outline. Height 52 px (small: 44 px). Pill radius. Hover lifts 1 px; press scales 0.985.
- **Portal (arch).** Rose-gold metal gradient frame; an arched window shows real artwork; label with kicker, display title and a circular arrow. Hover or focus raises the glow and shows a preview (never required). In 3D mode the HTML portal becomes a transparent, precisely projected hotspot over the WebGL arch.
- **Art frame.** Rose-gold frame, dark mat, spotlight on hover, label plate below. Images are never upscaled beyond their natural pixels.
- **Filter rail.** Vertical "timeline" of pill buttons with `aria-pressed`. Becomes a horizontal swipe strip on mobile.
- **Panels and dialogs.** Glass plum surface, subtle rose border, 22 px radius, native `<dialog>`.
- **Icons.** Inline SVG sprite, 1.6–1.8 stroke. No emoji anywhere.

## 5. Motion principles

| Use | Duration | Easing |
|---|---|---|
| Hover / press feedback | 200 ms (`--dur-fast`) | `--ease-out` |
| Scroll reveal | 320 ms, 14 px | `--ease-soft` (power1.out) |
| Dialogs / filters (FLIP) | 320–420 ms | `--ease-out` |
| Section / portal transitions | 600 ms – 1.1 s | `--ease-in-out` |
| Intro camera reveal | 3.6 s (wall-clock) | cubic in-out |

- **Hierarchy.** One hero motion per view; ambient motion (petals, motes, shimmer) stays low-amplitude.
- **Exits are faster than entrances.** Filtered-out cards disappear instantly; entering cards fade over 380 ms.
- **No screen shake or forced camera moves.** Pointer parallax is ≤ 0.45 units and damped.
- **Reduced motion.** Everything renders its final state; the 3D camera stays put; petals stop.

## 6. Responsive guidelines

- **Breakpoints:** 420, 700, 860 (navigation), 960 (gallery/case), 1100 (3D portal hotspots), plus a landscape rule for heights ≤ 520 px.
- **Mobile.** Compact menu; stacked arch-portal cards (with art) under the hero; full-width primary buttons; a swipeable filter strip; a single-column case study with a horizontal chapter index. The 3D scene auto-selects Lite and acts as an ambient backdrop.
- **Width.** No horizontal page scroll at any width (verified by automated QA at 390 px and 1280 px).

## 7. Experience settings (game-inspired)

| Profile | Pixel ratio | Shadows | Reflections | Bloom | Petals | Flowers | Foliage cards | Lantern lights |
|---|---|---|---|---|---|---|---|---|
| Lite | 1 | off | env-mapped gloss (no mirror pass) | off | 140 | 900 | 55% | off |
| Balanced | ≤ 1.5 | 1024 | mirror at ½ resolution | 0.38 | 420 | 2400 | 85% | off |
| High | ≤ 2 | 2048 soft | mirror at full resolution | 0.50 | 900 | 5000 | 100% | on |

Auto-detection never picks High. Software GPUs, phones, ≤ 4 GB memory or Data Saver get Lite. Sound is off by default. All settings persist in `localStorage`.
