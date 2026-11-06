# Asset credits & licences

Every third-party asset in this site is listed here with its source and licence. Licences were checked before use. Anything not listed is original work.

## Portfolio artwork — © Danielle Julian

All project images under `assets/img/work/` are Danielle Julian's original portfolio work. They were extracted at their original embedded resolution from *Danielle Julian — Master Design Portfolio 2026* (PDF) by `tools/extract_assets.py`, without redrawing, retouching or upscaling. The résumé (`assets/docs/Danielle-Julian-Creative-Resume.pdf`) is Danielle's own document. All rights reserved by the author.

Some student and concept pieces reference real brands or public figures (for example culture-jamming parodies, celebrity typography posters, and concept ads). They are presented as academic or independent concept work, not as commissioned client projects.

## Third-party assets

| Asset | Used for | Source | Licence |
|---|---|---|---|
| Three.js r170 (`three@0.170.0`): core build plus the EXRLoader, Reflector, EffectComposer, RenderPass, ShaderPass, MaskPass, UnrealBloomPass, OutputPass, RoomEnvironment, BufferGeometryUtils and fflate add-ons | WebGL rendering of the homepage world | [threejs.org](https://threejs.org), downloaded from the npm registry tarball; sha512 integrity verified against the registry | MIT. Licence kept at `vendor/three-0.170.0/LICENSE` |
| “Venice Sunset” HDRI (`assets/env/sunset-512.exr`) | Image-based lighting and metallic reflections | [Poly Haven — venice_sunset](https://polyhaven.com/a/venice_sunset), via the CC0 [pmndrs/assets](https://github.com/pmndrs/assets) mirror (512 px, DWAB-compressed EXR) | CC0 1.0 (public domain) |
| “Dikhololo Night” HDRI (`assets/env/night-512.exr`) | Reserved alternative night environment | [Poly Haven — dikhololo_night](https://polyhaven.com/a/dikhololo_night), via the pmndrs/assets mirror | CC0 1.0 (public domain) |
| Cormorant (display typeface) | Headlines | [Google Fonts — Cormorant](https://fonts.google.com/specimen/Cormorant) | SIL Open Font License 1.1 |
| Montserrat (body typeface) | Interface and body text | [Google Fonts — Montserrat](https://fonts.google.com/specimen/Montserrat) | SIL Open Font License 1.1 |

## Original assets created for this site

- **3D environment.** The moon gate, portal arches, colonnade, lanterns, cherry-blossom trees, petals, floating island, sky, mountains and light shafts are generated procedurally in `assets/js/scene/`. No third-party models are used.
- **Materials.** The marble, stone and column-fluting textures are generated on a canvas at load time (`assets/js/scene/textures.js`).
- **Vector art.** The fallback scene, studio window, luminous portal, blossom branch, icons and the Berry Vibes Studio mark are hand-written inline SVG.
- **Sound.** The ambient soundscape is synthesised live with the Web Audio API (`assets/js/ui/sound.js`). The site contains no audio files.

## Sources researched but not used

- **Poly Haven, ambientCG, Sketchfab and Fab.** Network policy blocked direct access to these hosts in the cloud build environment, and Sketchfab and Fab models carry per-asset licences that could not be checked. Instead of guessing, the build uses CC0 Poly Haven HDRIs from a verified mirror plus procedurally generated geometry and materials.
- **jsDelivr and unpkg CDNs.** Also blocked in the build environment, so Three.js is vendored at the exact pinned version instead. The import map in `index.html` is the only place that references it. See `README.md` to switch it to a CDN.
