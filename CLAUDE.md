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
