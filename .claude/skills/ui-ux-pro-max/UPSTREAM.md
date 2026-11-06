# Upstream provenance

- Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
- Path copied: `.claude/skills/ui-ux-pro-max/` (complete: SKILL.md, data/, scripts/, references/)
- Commit: `b7d5353e0130feb8c5574ef1251f8a1db1873ccb` (2026-11-05), skill version 2.15.0
- License: MIT — copied verbatim to `LICENSE` in this directory
- Symlinks: none inside the skill directory (the only upstream symlink is
  `gallery/data/styles.csv`, outside the skill; its target is byte-identical to `data/styles.csv`).

## Local adaptation

`SKILL.md` only: the 11 commands of the form
`"${CLAUDE_PLUGIN_ROOT}/.claude/skills/ui-ux-pro-max/scripts/search.py"` were rewritten to
`"$(git rev-parse --show-toplevel)/.claude/skills/ui-ux-pro-max/scripts/search.py"`, and a
short note explaining this was added under "Running the search tool".
`${CLAUDE_PLUGIN_ROOT}` is only set for marketplace-installed plugins, not repository-level skills.
All data and script files are unmodified.

## Tests

`scripts/tests/` is kept as shipped. Four test modules (`test_catalog_refresh`,
`test_catalog_summary_line_endings`, `test_relevance_evaluator`, `test_skill_script_paths`)
import maintainer tooling from the upstream repository root (`scripts/*.py`), which is not part
of the skill, so they error on import here. The remaining 150 tests pass.

## Updating

Clone upstream, replace this directory's `data/`, `scripts/` and `references/` with the new
copies, re-apply the `SKILL.md` path rewrite, and update the commit above.
