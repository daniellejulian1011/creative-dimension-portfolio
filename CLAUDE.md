# CLAUDE.md — creative-dimension-portfolio

An immersive, cinematic, interactive graphic design and UX/UI portfolio.

## Design intelligence: UI UX Pro Max (required for UI/UX decisions)

This repository includes the official, open-source **UI UX Pro Max** skill (MIT, v2.15.0)
as a repository-level skill at `.claude/skills/ui-ux-pro-max/`. Claude Code discovers it
automatically from `.claude/skills/` in every session, local or cloud.

**Rule:** for any task that changes how the portfolio looks, feels, moves, or is interacted
with — layout, visual style, color, typography, spacing, motion/animation, navigation,
accessibility, responsive behavior, component design, or UI review — consult UI UX Pro Max
first and ground recommendations in its search results. Do not substitute generic,
from-memory design advice. If a query returns nothing relevant after one narrower retry,
say so and label any guidance as a fallback.

How to use it:

1. Load the skill (`Skill` tool → `ui-ux-pro-max`) and follow `SKILL.md`.
2. Run the bundled search script with Python 3 (standard library only — no installs needed):

   ```bash
   python3 "$(git rev-parse --show-toplevel)/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <style|color|typography|ux|gsap|landing|product|icons|chart|web|react|google-fonts>
   python3 "$(git rev-parse --show-toplevel)/.claude/skills/ui-ux-pro-max/scripts/search.py" "cinematic graphic design portfolio interactive" --design-system -p "Creative Dimension" --format markdown
   python3 "$(git rev-parse --show-toplevel)/.claude/skills/ui-ux-pro-max/scripts/search.py" "<query>" --stack <threejs|nextjs|react|html-tailwind|astro|...>
   ```

   `--variance/--motion/--density 1-10` tune the design-system output (a cinematic
   portfolio typically wants higher motion and variance).
3. Before delivering UI work, check it against `references/pro-rules.md` (pre-delivery
   checklist) and `references/quick-reference.md` (full UX rules).

Maintenance notes:

- The skill is vendored from https://github.com/nextlevelbuilder/ui-ux-pro-max-skill —
  see `.claude/skills/ui-ux-pro-max/UPSTREAM.md` for the source commit and the one local
  adaptation (`${CLAUDE_PLUGIN_ROOT}` paths → git-root paths in `SKILL.md`).
- Do not hand-edit the CSV data files; update by re-copying from upstream.
- Do not use the `npx ui-ux-pro-max-cli` installer in this repo.

## Project rules

- Do not modify, delete, or overwrite existing portfolio pages, components, screenshots,
  assets, or project content unless the task explicitly asks for it.

## Site architecture (Phase 1 — The Creative Dimension)

- **Static, build-free site** for GitHub Pages: HTML + CSS + native ES modules. Do not add npm, a bundler, React/Vite or a backend.
- **Content lives in `data/projects.json`; page bodies in `src/pages/`.** Never hand-edit the generated `*.html`. Regenerate with `python3 tools/build_site.py` (Python 3 standard library only) and commit the output.
- **Artwork** comes only from Danielle's PDFs (`tools/extract_assets.py`). Never invent projects, metrics, clients, employers or tools. Tools are limited to the résumé list: Figma, Photoshop, Illustrator, Lightroom, Canva, HTML, CSS, JavaScript, GitHub, PowerPoint.
- **Design system:** `design-system/the-creative-dimension/MASTER.md` (tokens in `assets/css/tokens.css`). Read it before UI work; Danielle's reference screenshots take priority over generic suggestions.
- **3D:** Three.js r170 is vendored at `vendor/three-0.170.0/` and resolved through the import map in `index.html`. The scene modules are in `assets/js/scene/`. Quality profiles (`quality.js`) must keep changing real GPU work. The site must stay fully usable without WebGL or JavaScript.
- **Licensing:** record every third-party asset in `ASSET_CREDITS.md`.
- **QA:** headless Chromium renders WebGL via SwiftShader (very slow). Use small viewports for 3D screenshots, and never claim GPU performance from it.
