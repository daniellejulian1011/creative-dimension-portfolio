#!/usr/bin/env python3
"""Extract Danielle Julian's original artwork from the Master Portfolio PDF.

The PDF embeds each artwork as a JPEG. This script pulls those embedded images
out at their original pixel size (no page re-rendering, no upscaling) and writes
optimised WebP copies that the site uses:

    assets/img/work/<file>.webp       full size (max = original embedded size)
    assets/img/work/<file>-sm.webp    480px-wide thumbnail for galleries

Which embedded image belongs to which project is declared in data/projects.json
(images[].id = "<page>-<index>" exactly as printed by `pdfimages -list`).

Requirements: Python 3 + Pillow, and poppler's `pdfimages` (both available in the
Claude Code cloud container). Usage:

    python3 tools/extract_assets.py path/to/Danielle_Julian_Master_Design_Portfolio_2026.pdf
"""
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "img" / "work"
THUMB_W = 480


def main(pdf: str) -> None:
    data = json.loads((ROOT / "data" / "projects.json").read_text(encoding="utf-8"))
    wanted = {}
    for p in data["projects"]:
        for im in p.get("images", []):
            wanted[im["id"]] = im["file"]

    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdfimages", "-j", "-p", pdf, str(Path(tmp) / "img")], check=True)
        written = 0
        for src_id, name in sorted(wanted.items()):
            src = Path(tmp) / f"img-{src_id}.jpg"
            if not src.exists():
                sys.exit(f"missing embedded image {src_id} for {name}")
            im = Image.open(src).convert("RGB")
            im.save(OUT / f"{name}.webp", "WEBP", quality=88, method=6)
            th = im.copy()
            if th.width > THUMB_W:
                th = th.resize((THUMB_W, round(th.height * THUMB_W / th.width)), Image.LANCZOS)
            th.save(OUT / f"{name}-sm.webp", "WEBP", quality=82, method=6)
            written += 1
    print(f"wrote {written} artworks to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    if len(sys.argv) != 2 or not shutil.which("pdfimages"):
        sys.exit(__doc__)
    main(sys.argv[1])
