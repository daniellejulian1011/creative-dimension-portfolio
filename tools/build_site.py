#!/usr/bin/env python3
"""Build the static site (GitHub Pages ready) from data + templates.

    python3 tools/build_site.py

Inputs
  data/projects.json      portfolio content (single source of truth)
  src/pages/*.html        hand-written page bodies (home, about, résumé, contact)
  assets/img/work/*.webp  artwork extracted by tools/extract_assets.py

Outputs (committed, served as-is — no runtime build, no package manager)
  index.html, work.html, about.html, resume.html, contact.html, 404.html,
  visual-design.html, interactive-design.html, digital-worlds.html,
  projects/<slug>.html, ASSET_MANIFEST.md

Python 3 standard library only. Every page is fully readable without JavaScript.
"""
from __future__ import annotations

import html
import json
import re
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
DATA = json.loads((ROOT / "data" / "projects.json").read_text(encoding="utf-8"))
SITE_TITLE = "The Creative Dimension — Danielle Julian"
EMAIL = "daniellejulian1011@gmail.com"
LINKEDIN = "https://www.linkedin.com/in/danielle-julian-55664a25b"
THREE_VERSION = "0.170.0"

CATS = {c["id"]: c for c in DATA["categories"]}
PROJECTS = DATA["projects"]
BY_SLUG = {p["slug"]: p for p in PROJECTS}
PORTALS = DATA["portals"]
esc = html.escape


# --------------------------------------------------------------------------- utils
def webp_size(path: Path) -> tuple[int, int]:
    """Read width/height from a WebP header (VP8, VP8L or VP8X) — stdlib only."""
    b = path.read_bytes()[:40]
    chunk = b[12:16]
    if chunk == b"VP8 ":
        w, h = struct.unpack("<HH", b[26:30])
        return w & 0x3FFF, h & 0x3FFF
    if chunk == b"VP8L":
        bits = int.from_bytes(b[21:25], "little")
        return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
    if chunk == b"VP8X":
        return int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1
    raise ValueError(f"unsupported webp: {path}")


def img_info(file: str) -> dict:
    full = ROOT / "assets" / "img" / "work" / f"{file}.webp"
    small = ROOT / "assets" / "img" / "work" / f"{file}-sm.webp"
    w, h = webp_size(full)
    sw, sh = webp_size(small)
    return {"full": f"assets/img/work/{file}.webp", "small": f"assets/img/work/{file}-sm.webp", "w": w, "h": h, "sw": sw, "sh": sh}


def icon(name: str, cls: str = "") -> str:
    c = f' class="{cls}"' if cls else ""
    return f'<svg{c} aria-hidden="true" focusable="false"><use href="#i-{name}"></use></svg>'


def cat_labels(ids) -> str:
    return " • ".join(CATS[c]["label"] for c in ids if c in CATS)


def kind_label(p) -> str:
    return {"case-study": "UX case study", "weblab": "Coded projects", "project": "Project"}.get(p["kind"], "")


# --------------------------------------------------------------------------- layout
ICONS = """
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <symbol id="i-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></symbol>
  <symbol id="i-sound-on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></symbol>
  <symbol id="i-sound-off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/></symbol>
  <symbol id="i-display" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="12" rx="2"/><path d="M9 20h6M12 16.5V20"/><path d="M7.5 13l3-3 2 2 4-4"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
  <symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-leaf" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l7-7"/></symbol>
  <symbol id="i-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18.5 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path d="M5 15.5l.6 1.4 1.4.6-1.4.6L5 19.5l-.6-1.4L3 17.5l1.4-.6z"/></symbol>
  <symbol id="i-gem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 4h11L21 9l-9 11L3 9z"/><path d="M3 9h18M9 4l3 16 3-16"/></symbol>
  <symbol id="i-motion" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 9h.01M12 9h.01M16 9h.01M8 15h8"/></symbol>
  <symbol id="i-controls" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="7" width="19" height="10" rx="5"/><path d="M7 10v4M5 12h4M15.5 11h.01M18 13h.01"/></symbol>
  <symbol id="i-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10-6.5z"/></symbol>
  <symbol id="i-grid" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></symbol>
  <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6.5L20.5 7"/></symbol>
  <symbol id="i-linkedin" viewBox="0 0 24 24" fill="currentColor"><path d="M5.2 8.6h3v10h-3zM6.7 4.2a1.75 1.75 0 1 1 0 3.5 1.75 1.75 0 0 1 0-3.5zM10.2 8.6h2.9V10h.04c.4-.76 1.38-1.56 2.85-1.56 3.05 0 3.6 2 3.6 4.6v5.56h-3V13.7c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.29-1.9 2.62v4.98h-3z"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/></symbol>
  <symbol id="i-info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6h.01"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-mouse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><rect x="6.5" y="3" width="11" height="18" rx="5.5"/><path d="M12 7v3"/></symbol>
  <symbol id="i-hand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11M12 10V4.5a1.5 1.5 0 0 1 3 0V11M15 10.5V6.5a1.5 1.5 0 0 1 3 0v7.5a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3.3 14.6a1.5 1.5 0 0 1 2.4-1.8L9 15.5V8.5a1.5 1.5 0 0 1 3 0"/></symbol>
  <symbol id="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11.5" height="11.5" rx="2"/><path d="M15.5 8.5V5.5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3"/></symbol>
  <symbol id="i-external" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></symbol>
  <symbol id="i-zoom" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5M11 8.5v5M8.5 11h5"/></symbol>
  <symbol id="logo" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
    <path d="M32 5c6 7 6.5 15 0 22C25.5 20 26 12 32 5z"/><path d="M32 59c6-7 6.5-15 0-22-6.5 7-6 15 0 22z"/>
    <path d="M5 32c7-6 15-6.5 22 0-7 6.5-15 6-22 0z"/><path d="M59 32c-7-6-15-6.5-22 0 7 6.5 15 6 22 0z"/>
    <path d="M32 18l14 14-14 14-14-14z" stroke-width="1.6" opacity=".8"/>
    <path d="M18.5 18.5c4 1.2 6 3.6 6.5 6.5-3-.4-5.4-2.5-6.5-6.5zM45.5 18.5c-4 1.2-6 3.6-6.5 6.5 3-.4 5.4-2.5 6.5-6.5zM18.5 45.5c4-1.2 6-3.6 6.5-6.5-3 .4-5.4 2.5-6.5 6.5zM45.5 45.5c-4-1.2-6-3.6-6.5-6.5 3 .4 5.4 2.5 6.5 6.5z" stroke-width="1.6"/>
    <circle cx="32" cy="32" r="3.2" fill="currentColor" stroke="none"/>
  </symbol>
</svg>"""

NAV = [("index.html", "Home", "home"), ("work.html", "Work", "work"), ("about.html", "About", "about"),
       ("resume.html", "Resume", "resume"), ("contact.html", "Contact", "contact")]


def header(root: str, section: str) -> str:
    links = "".join(
        f'<li><a class="site-nav__link" href="{root}{href}"{" aria-current=\"page\"" if key == section else ""}>{label}</a></li>'
        for href, label, key in NAV)
    return f"""
<header class="site-header">
  <div class="site-header__inner">
    <a class="brand" href="{root}index.html" aria-label="Berry Vibes Studio — home">
      <svg class="brand__mark" aria-hidden="true"><use href="#logo"></use></svg>
      <span class="brand__text" aria-hidden="true"><span class="brand__name">Berry Vibes</span><span class="brand__sub">Studio</span></span>
    </a>
    <nav class="site-nav" aria-label="Main">
      <ul class="site-nav__list" id="site-nav-list">{links}</ul>
    </nav>
    <div class="header-tools">
      <button class="icon-btn js-only" type="button" data-sound-toggle aria-pressed="false" aria-label="Sound off — turn on ambient sound">
        <svg data-icon-off aria-hidden="true"><use href="#i-sound-off"></use></svg>
        <svg data-icon-on hidden aria-hidden="true"><use href="#i-sound-on"></use></svg>
      </button>
      <button class="quality-btn js-only" type="button" data-open-settings aria-haspopup="dialog">
        {icon('display')}<span class="quality-btn__label">Graphics: <span data-quality-label>Balanced</span></span><span class="visually-hidden"> — open Experience Settings</span>
      </button>
      <button class="icon-btn menu-btn js-only" type="button" data-menu-toggle aria-expanded="false" aria-controls="site-nav-list" aria-label="Menu">{icon('menu')}</button>
    </div>
  </div>
</header>"""


SETTINGS = f"""
<dialog class="settings-dialog" id="settings-dialog" aria-labelledby="settings-title">
  <div class="settings__head">
    <h2 id="settings-title">Experience Settings</h2>
    <button class="icon-btn" type="button" data-close-settings aria-label="Close settings">{icon('close')}</button>
  </div>
  <div class="settings__body">
    <div class="settings__group">
      <fieldset class="segmented">
        <legend class="settings__label">Graphics quality</legend>
        <label class="segmented__opt"><input type="radio" name="quality" value="lite"><span>{icon('leaf')}Lite<small>Fastest</small></span></label>
        <label class="segmented__opt"><input type="radio" name="quality" value="balanced"><span>{icon('sparkles')}Balanced<small>Recommended</small></span></label>
        <label class="segmented__opt"><input type="radio" name="quality" value="high"><span>{icon('gem')}High<small>Most detail</small></span></label>
      </fieldset>
      <p class="settings__hint" data-quality-hint></p>
    </div>
    <div class="settings__group">
      <div class="setting-row">
        <span class="setting-row__text" id="lbl-sound">{icon('sound-on')}Ambient sound</span>
        <button class="switch" type="button" role="switch" aria-checked="false" aria-labelledby="lbl-sound" data-setting="sound"></button>
      </div>
      <p class="settings__hint">Off by default. An original generated soundscape — it never starts on its own.</p>
      <div class="setting-row">
        <span class="setting-row__text" id="lbl-motion">{icon('motion')}Reduce motion</span>
        <button class="switch" type="button" role="switch" aria-checked="false" aria-labelledby="lbl-motion" data-setting="motion"></button>
      </div>
      <p class="settings__hint" data-motion-hint></p>
    </div>
    <div class="settings__group">
      <details class="controls-guide">
        <summary><span class="setting-row__text">{icon('controls')}Control guide</span>{icon('chevron')}</summary>
        <dl>
          <dt>Mouse</dt><dd>Move to look around the courtyard; click a portal to enter it.</dd>
          <dt><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></dt><dd>Explore the 3D homepage on desktop (optional).</dd>
          <dt><kbd>Tab</kbd></dt><dd>Move between links, portals and controls. <kbd>Enter</kbd> activates.</dd>
          <dt><kbd>Esc</kbd></dt><dd>Close menus, dialogs and the artwork viewer; skip the intro.</dd>
          <dt>Touch</dt><dd>Tap any portal or card. Swipe category filters sideways.</dd>
          <dt><kbd>←</kbd> <kbd>→</kbd></dt><dd>Step through artwork in the viewer.</dd>
        </dl>
      </details>
    </div>
    <div class="settings__actions">
      <button class="btn btn--ghost btn--sm" type="button" data-replay-intro>{icon('play')}Replay intro</button>
      <button class="btn btn--ghost btn--sm" type="button" data-reset-settings>Reset to defaults</button>
    </div>
  </div>
</dialog>"""

LIGHTBOX = f"""
<dialog class="lightbox" id="lightbox" aria-label="Artwork viewer">
  <div class="lightbox__bar">
    <p class="lightbox__title" data-lb-title></p>
    <button class="icon-btn" type="button" data-lb-close aria-label="Close viewer">{icon('close')}</button>
  </div>
  <div class="lightbox__stage"><img alt="" decoding="async"></div>
  <div class="lightbox__foot">
    <button class="icon-btn" type="button" data-lb-prev aria-label="Previous artwork">{icon('arrow-left')}</button>
    <span data-lb-count aria-live="polite"></span>
    <button class="icon-btn" type="button" data-lb-next aria-label="Next artwork">{icon('arrow')}</button>
    <span>Click the image to view at 100%</span>
  </div>
</dialog>"""

BRANCH = """<svg class="scenery__branch" viewBox="0 0 360 260" aria-hidden="true">
  <defs><radialGradient id="bl" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd4e8"/><stop offset=".6" stop-color="#ef6fa8"/><stop offset="1" stop-color="#b8326f" stop-opacity="0"/></radialGradient></defs>
  <path d="M-10 40 C 60 50 110 70 160 110 S 250 170 330 160" stroke="#3a2030" stroke-width="7" fill="none" stroke-linecap="round"/>
  <path d="M120 85 C 140 60 170 45 200 40 M190 140 C 210 175 240 195 270 200 M70 52 C 80 30 95 18 120 10" stroke="#3a2030" stroke-width="4" fill="none" stroke-linecap="round"/>
  <g fill="url(#bl)"><circle cx="200" cy="40" r="26"/><circle cx="120" cy="12" r="22"/><circle cx="270" cy="198" r="24"/><circle cx="330" cy="160" r="28"/><circle cx="160" cy="108" r="22"/><circle cx="235" cy="165" r="18"/><circle cx="60" cy="48" r="20"/><circle cx="300" cy="185" r="16"/><circle cx="95" cy="70" r="14"/></g>
</svg>"""


def footer(root: str) -> str:
    return f"""
<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <a class="brand" href="{root}index.html" aria-label="Berry Vibes Studio — home"><svg class="brand__mark" aria-hidden="true"><use href="#logo"></use></svg><span class="brand__text" aria-hidden="true"><span class="brand__name">Berry Vibes</span><span class="brand__sub">Studio</span></span></a>
        <p class="site-footer__tag">Playful Systems. Purposeful Stories.</p>
      </div>
      <nav aria-label="Footer"><h2>Explore</h2><ul>
        <li><a href="{root}work.html">All work</a></li><li><a href="{root}visual-design.html">Visual Design</a></li>
        <li><a href="{root}interactive-design.html">Interactive Design</a></li><li><a href="{root}digital-worlds.html">Digital Worlds</a></li></ul></nav>
      <div><h2>Connect</h2><ul>
        <li><a href="mailto:{EMAIL}">{EMAIL}</a></li>
        <li><a href="{LINKEDIN}" rel="noopener" target="_blank">LinkedIn<span class="visually-hidden"> (opens in a new tab)</span></a></li>
        <li><a href="{root}assets/docs/Danielle-Julian-Creative-Resume.pdf" download>Download résumé (PDF)</a></li></ul></div>
    </div>
    <div class="site-footer__legal"><span>© 2026 Danielle Julian · Berry Vibes Studio. All portfolio artwork © Danielle Julian.</span><a href="{root}CREDITS.html">Credits &amp; licences</a></div>
  </div>
</footer>"""


def page(*, path: str, title: str, desc: str, section: str, body: str, page_id: str, home: bool = False,
         lightbox: bool = False, scenery: bool = True) -> None:
    depth = path.count("/")
    root = "../" * depth
    full_title = SITE_TITLE if home else f"{title} — The Creative Dimension · Danielle Julian"
    intro_js = "d.dataset.intro=s.introSeen?'skip':'play';" if home else ""
    mod_root = root or "./"
    import_map = f"""
  <script type="importmap">{{"imports":{{"three":"{mod_root}vendor/three-{THREE_VERSION}/build/three.module.min.js","three/addons/":"{mod_root}vendor/three-{THREE_VERSION}/examples/jsm/"}}}}</script>
  <link rel="modulepreload" href="{root}vendor/three-{THREE_VERSION}/build/three.module.min.js">""" if home else ""
    css = ["tokens", "base", "components"] + (["home"] if home else ["pages"])
    styles = "\n".join(f'  <link rel="stylesheet" href="{root}assets/css/{c}.css">' for c in css)
    scenery_html = f"""
<div class="scenery" aria-hidden="true"><div class="scenery__glow"></div><div class="scenery__arch"></div>{BRANCH}<canvas class="scenery__canvas" data-ambient></canvas></div>""" if scenery and not home else ""
    doc = f"""<!doctype html>
<html lang="en" class="no-js" data-root="{root}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{esc(full_title)}</title>
  <meta name="description" content="{esc(desc)}">
  <meta name="theme-color" content="#180c23">
  <meta property="og:title" content="{esc(full_title)}">
  <meta property="og:description" content="{esc(desc)}">
  <meta property="og:type" content="website">
  <link rel="icon" href="{root}assets/img/favicon.svg" type="image/svg+xml">
  <script>(function(){{var d=document.documentElement,s={{}};d.classList.remove('no-js');d.classList.add('has-js');try{{s=JSON.parse(localStorage.getItem('creative-dimension:settings:v1')||'{{}}')}}catch(e){{}}var rm=s.motion==='reduce'||(s.motion!=='full'&&window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);d.dataset.motion=rm?'reduce':'full';{intro_js}}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,400;0,500;0,600;1,400;1,500&amp;family=Montserrat:wght@400;500;600;700&amp;display=swap">
{styles}{import_map}
  <script type="module" src="{root}assets/js/app.js"></script>
</head>
<body class="page page--{page_id}" data-page="{page_id}">
{ICONS}
<a class="skip-link" href="#main">Skip to main content</a>
{scenery_html}
{header(root, section)}
{body.replace("{{ROOT}}", root)}
{footer(root)}
{SETTINGS}
{LIGHTBOX if lightbox else ""}
</body>
</html>
"""
    out = ROOT / path
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(doc, encoding="utf-8")
    GENERATED.append(path)


GENERATED: list[str] = []


# --------------------------------------------------------------------------- components
def frame_img(info: dict, alt: str, *, small: bool = True, ar_clamp=(0.72, 1.33), eager=False) -> str:
    src = info["small"] if small else info["full"]
    w, h = (info["sw"], info["sh"]) if small else (info["w"], info["h"])
    ar = max(ar_clamp[0], min(ar_clamp[1], info["w"] / info["h"]))
    loading = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<span class="art-frame"><span class="art-frame__mat" style="--ar:{ar:.3f}">'
            f'<img src="{{{{ROOT}}}}{src}" width="{w}" height="{h}" alt="{esc(alt)}" {loading} decoding="async"></span></span>')


def card(p: dict, *, reveal=True) -> str:
    cats = " ".join(p["categories"])
    kind = kind_label(p)
    kind_html = f'<span class="work-card__kind"><span class="chip">{kind}</span></span>' if kind and p["kind"] != "project" else ""
    if p["images"]:
        visual = frame_img(img_info(p["images"][0]["file"]), "")
    else:
        visual = ('<span class="art-frame"><span class="art-frame__mat" style="--ar:1"><span class="text-art"><span class="text-art__code">&lt;/&gt;</span>'
                  f'<span class="text-art__tag">{esc(p["disciplines"])}</span><span class="text-art__title">{esc(p["title"])}</span></span></span></span>')
    return (f'<li class="work-card" data-categories="{cats}"{" data-reveal" if reveal else ""}>'
            f'<a class="work-card__link" href="{{{{ROOT}}}}projects/{p["slug"]}.html">{visual}{kind_html}'
            f'<span class="work-card__plate"><span class="work-card__title">{esc(p["title"])}</span>'
            f'<span class="work-card__meta">{esc(cat_labels(p["categories"]))}</span></span></a></li>')


def entry_card(parent: dict, e: dict) -> str:
    cats = " ".join(e["categories"])
    return (f'<li class="work-card" data-categories="{cats}" data-reveal>'
            f'<a class="work-card__link" href="{{{{ROOT}}}}projects/{parent["slug"]}.html#{e["id"]}">'
            f'<span class="art-frame"><span class="art-frame__mat" style="--ar:1"><span class="text-art"><span class="text-art__code">&lt;/&gt;</span>'
            f'<span class="text-art__tag">{esc(e["tag"])}</span><span class="text-art__title">{esc(e["title"])}</span>'
            f'<span class="text-art__text">{esc(e["text"])}</span></span></span></span>'
            f'<span class="work-card__plate"><span class="work-card__title">{esc(e["title"])}</span>'
            f'<span class="work-card__meta">Interactive Web Lab · {esc(cat_labels(e["categories"]))}</span></span></a></li>')


def gallery_items() -> list[tuple[str, list[str]]]:
    """Every gallery entry: projects + each documented Web Lab entry (by category)."""
    items = []
    seen_images = set()
    for p in PROJECTS:
        if p["kind"] == "weblab":
            for e in p["entries"]:
                items.append((entry_card(p, e), e["categories"]))
            continue
        # Skip pure duplicates (e.g. Cup$i identity shares its only image with SaveSip) — still listed via filters.
        items.append((card(p), p["categories"]))
        seen_images.update(i["file"] for i in p["images"])
    return items


def lightbox_figure(info: dict, im: dict, cls: str = "", eager: bool = False) -> str:
    loading = 'fetchpriority="high"' if eager else 'loading="lazy"'
    return (f'<figure class="{cls}"><button class="figure-btn" type="button" data-lightbox data-full="{{{{ROOT}}}}{info["full"]}" '
            f'data-w="{info["w"]}" data-h="{info["h"]}" data-alt="{esc(im["alt"])}" data-caption="{esc(im["caption"])}" '
            f'aria-label="View larger: {esc(im["caption"])}">'
            f'<span class="art-frame"><span class="art-frame__mat"><img src="{{{{ROOT}}}}{info["full"]}" width="{info["w"]}" height="{info["h"]}" '
            f'alt="{esc(im["alt"])}" {loading} decoding="async" style="max-width:min(100%,{info["w"]}px)"></span></span></button>'
            f'<figcaption>{esc(im["caption"])}</figcaption></figure>')


def images_by_caption(p: dict, *keys) -> list[dict]:
    return [im for im in p["images"] if any(k in im["file"] for k in keys)]


def media_grid(p: dict, ims: list[dict], wide=False) -> str:
    if not ims:
        return ""
    figs = "".join(f"<li>{lightbox_figure(img_info(im['file']), im)}</li>" for im in ims)
    return f'<ul class="media-grid{" media-grid--wide" if wide else ""}" role="list">{figs}</ul>'


def bullets(items) -> str:
    return '<ul class="check-list" role="list">' + "".join(f"<li>{icon('check')}<span>{esc(i)}</span></li>" for i in items) + "</ul>"


# --------------------------------------------------------------------------- project pages
def chapter(cid: str, num: int, title: str, inner: str) -> str:
    return (f'<section class="chapter" id="{cid}" aria-labelledby="{cid}-h" data-reveal>'
            f'<p class="chapter__num">Chapter {num:02d}</p><h2 id="{cid}-h">{title}</h2>{inner}</section>')


def case_study_chapters(p: dict) -> list[tuple[str, str, str]]:
    cs = p["caseStudy"]
    s = p["slug"]
    ch: list[tuple[str, str, str]] = []
    if s == "savesip":
        ch = [
            ("summary", "Project summary", f"<p>{esc(p['summary'])}</p><p>{esc(cs['direction'])}</p>"),
            ("problem", "The problem", f"<p>{esc(cs['problem'])}</p>"),
            ("audience", "Intended audience", f"<p>{esc(cs['audience'])}</p>" + media_grid(p, images_by_caption(p, "persona"))),
            ("research", "Research &amp; discovery", f"<p>{esc(cs['research'])}</p>" + media_grid(p, images_by_caption(p, "research-notes"))),
            ("process", "Design process", '<ol class="flow" role="list">' + "".join(f"<li><span>{esc(x)}</span></li>" for x in cs["process"]) + "</ol>"
             + media_grid(p, images_by_caption(p, "wireframe-notes", "interface-planning"))),
            ("wireframes", "Wireframes &amp; iterations", "<p>Low-fidelity flows were planned before visual polish, then carried into the high-fidelity system.</p>"
             + media_grid(p, images_by_caption(p, "lowfi"), wide=True)),
            ("visual", "Visual design decisions", f"<p>{esc(cs['visual'])}</p>" + media_grid(p, images_by_caption(p, "mascots", "cupsi-logo"))),
            ("final", "Final concept", "<p>The feature system combines tracking, comparisons, goals, unlockables, challenges, and savings feedback:</p>"
             + bullets(cs["features"]) + f'<p class="principle">{esc(cs["goal"])}</p>' + media_grid(p, images_by_caption(p, "hifi-flow", "feature-screens"), wide=True)),
            ("reflection", "Reflection &amp; next steps", f"<p>{esc(cs['status'])}</p><p><strong>Deliverables documented:</strong> {esc(', '.join(cs['deliverables']))}.</p>"),
        ]
    elif s == "smartcart":
        rows = "".join(f"<tr><th scope=\"row\">{esc(k)}</th><td>{esc(v)}</td></tr>" for k, v in cs["researchMeta"])
        ch = [
            ("summary", "Project summary", f"<p>{esc(p['summary'])}</p><table class=\"meta-table\"><caption class=\"visually-hidden\">Research sprint details</caption><tbody>{rows}</tbody></table>"),
            ("problem", "The problem", f"<p>{esc(cs['problem'])}</p>"),
            ("audience", "Intended audience", f"<p>{esc(cs['audience'])}</p>"),
            ("research", "Research &amp; discovery", "<h3 class=\"visually-hidden\">Research goals</h3><p><strong>Research goals</strong></p>" + bullets(cs["goals"])
             + "<p style=\"margin-top:1.5rem\"><strong>Key research questions</strong></p>" + bullets(cs["questions"])
             + media_grid(p, p["images"])),
            ("process", "Design process", "<p><strong>Hypotheses to test</strong></p>" + bullets(cs["hypotheses"])
             + "<p style=\"margin-top:1.5rem\"><strong>Research focus &amp; synthesis plan</strong></p>" + bullets(cs["focus"])
             + f'<p class="principle">{esc(cs["principle"])}</p>'),
            ("next", "Reflection &amp; next steps", f"<p>{esc(cs['next'])}</p><p>{esc(cs['status'])}</p>"),
        ]
    elif s == "crosswalks":
        states = "".join(f'<li class="state-card"><h3><span class="state-card__light" aria-hidden="true"></span>{esc(n)}</h3><p>{esc(d)}</p></li>'
                         for n, d in cs["states"])
        ch = [
            ("summary", "Project summary", f"<p>{esc(p['summary'])}</p>"),
            ("problem", "The problem", f"<p>{esc(cs['problem'])}</p>" + media_grid(p, images_by_caption(p, "area-of-interest"))),
            ("audience", "Intended audience", f"<p>{esc(cs['audience'])}</p>"),
            ("research", "Research &amp; discovery", f"<p>{esc(cs['research'])}</p>"),
            ("concept", "Final concept: nowWhat", f"<p>{esc(cs['proposal'])}</p>" + media_grid(p, images_by_caption(p, "proposal"))),
            ("states", "Interface states", f'<p>Four core states, including explicit failure behaviour.</p><ul class="state-grid" role="list">{states}</ul>'),
            ("visual", "Visual design decisions", bullets(cs["uiLook"]) + media_grid(p, images_by_caption(p, "interface-details"))),
            ("next", "Reflection &amp; next steps", f"<p>{esc(cs['status'])}</p>"),
        ]
    return ch


def related_html(p: dict) -> str:
    rel = [BY_SLUG[s] for s in p.get("related", []) if s in BY_SLUG]
    if not rel:
        return ""
    cards = "".join(card(r) for r in rel)
    return (f'<section class="section" aria-labelledby="related-h"><div class="container"><div class="section__head">'
            f'<p class="eyebrow">Keep exploring</p><h2 class="section__title" id="related-h">Related <em>projects</em></h2></div>'
            f'<ul class="related" role="list">{cards}</ul></div></section>')


def project_page(p: dict, idx: int) -> None:
    prev_p = PROJECTS[idx - 1]
    next_p = PROJECTS[(idx + 1) % len(PROJECTS)]
    hero_media = ""
    if p["images"]:
        first = p["images"][0]
        hero_media = f'<div class="project-hero__media">{lightbox_figure(img_info(first["file"]), first, eager=True)}</div>'
    else:
        hero_media = ('<div class="project-hero__media" data-reveal><span class="art-frame"><span class="art-frame__mat" style="aspect-ratio:4/3">'
                      f'<span class="text-art"><span class="text-art__code">&lt;/&gt;</span><span class="text-art__tag">{esc(p["disciplines"])}</span>'
                      f'<span class="text-art__title">{esc(p["title"])}</span></span></span></span></div>')
    status = ""
    if p["kind"] == "case-study":
        status = f'<p class="status-note">{icon("info")}<span>{esc(p["caseStudy"]["status"])}</span></p>'
    elif p.get("note"):
        status = f'<p class="status-note">{icon("info")}<span>{esc(p["note"])}</span></p>'
    hero = f"""
<section class="page-hero"><div class="container">
  <p class="breadcrumb"><a class="link-arrow link-arrow--back" href="{{{{ROOT}}}}work.html">{icon('arrow-left')}Back to Work</a></p>
  <div class="project-hero">
    <div>
      <p class="eyebrow">{esc(cat_labels(p['categories']))}</p>
      <h1 class="project-hero__title">{esc(p['title'])}</h1>
      {f'<p class="project-hero__disciplines">Also titled <em>{esc(p["altTitle"])}</em></p>' if p.get("altTitle") else ""}
      <p class="project-hero__disciplines">{esc(p['disciplines'])}</p>
      <p class="project-hero__summary">{esc(p['summary'])}</p>
      {status}
      <p class="settings__hint">Source: {esc(p['source'])}.</p>
    </div>
    {hero_media}
  </div>
</div></section>"""

    body = ""
    if p["kind"] == "case-study":
        chs = case_study_chapters(p)
        index = "".join(f'<li><a href="#{cid}">{t}</a></li>' for cid, t, _ in chs)
        chapters = "".join(chapter(cid, i + 1, t, inner) for i, (cid, t, inner) in enumerate(chs))
        body = f"""
<div class="container"><div class="case">
  <nav class="case-index" aria-label="Case study chapters"><ol role="list">{index}</ol></nav>
  <div class="case__body">{chapters}</div>
</div></div>"""
    elif p["kind"] == "weblab":
        entries = "".join(
            f'<li id="{e["id"]}" data-reveal><span class="art-frame"><span class="art-frame__mat"><span class="text-art"><span class="text-art__code">&lt;/&gt;</span>'
            f'<span class="text-art__tag">{esc(e["tag"])}</span><span class="text-art__title">{esc(e["title"])}</span>'
            f'<span class="text-art__text">{esc(e["text"])}</span></span></span></span></li>' for e in p["entries"])
        body = f"""
<section class="section" aria-labelledby="lab-h"><div class="container">
  <div class="section__head"><p class="eyebrow">HTML • CSS • JavaScript</p><h2 class="section__title" id="lab-h">Eight coded <em>experiences</em></h2>
  <p class="lede">Game logic, drag-and-drop puzzles, nonlinear storytelling, concrete poetry and semantic web design — built by hand in HTML, CSS and JavaScript.</p></div>
  <ul class="weblab-grid" role="list">{entries}</ul>
</div></section>"""
    else:
        paras = "".join(f"<p>{esc(t)}</p>" for t in p.get("body", []))
        rest = p["images"][1:]
        grid = media_grid(p, rest) if rest else ""
        body = f"""
<section class="section" aria-labelledby="about-h"><div class="container">
  <div class="section__head"><p class="eyebrow">About the work</p><h2 class="section__title" id="about-h">{esc(p['disciplines'])}</h2></div>
  <div class="prose">{paras or f"<p>{esc(p['summary'])}</p>"}<p>Presented in the Master Design Portfolio as original work by Danielle Julian.</p></div>
  {grid}
</div></section>"""

    pager = f"""
<div class="container"><nav class="pager" aria-label="More projects">
  <a class="link-arrow link-arrow--back" href="{{{{ROOT}}}}projects/{prev_p['slug']}.html">{icon('arrow-left')}Previous: {esc(prev_p['title'])}</a>
  <a class="link-arrow" href="{{{{ROOT}}}}projects/{next_p['slug']}.html">Next: {esc(next_p['title'])}{icon('arrow')}</a>
</nav></div>"""
    page(path=f"projects/{p['slug']}.html", title=p["title"], desc=p["summary"], section="work",
         page_id="project", lightbox=True,
         body=f'<main id="main" class="page-main" tabindex="-1">{hero}{body}{related_html(p)}{pager}</main>')


# --------------------------------------------------------------------------- gallery + wings
def work_page() -> None:
    items = gallery_items()
    counts = {c["id"]: sum(1 for _, cs in items if c["id"] in cs) for c in DATA["categories"]}
    filters = [("all", "All Projects", len(items))] + [(c["id"], c["label"], counts[c["id"]]) for c in DATA["categories"]]
    btns = "".join(
        f'<li><button class="filter-btn" type="button" data-filter="{fid}" data-label="{esc(label)}" aria-pressed="{"true" if fid == "all" else "false"}">'
        f'<span class="filter-btn__dot" aria-hidden="true"></span>{esc(label)}<span class="filter-btn__count">{n}</span>{icon("arrow", "filter-btn__arrow")}</button></li>'
        for fid, label, n in filters)
    cards = "".join(html_ for html_, _ in items)
    body = f"""
<main id="main" class="page-main" tabindex="-1">
  <section class="page-hero"><div class="container">
    <p class="eyebrow">The gallery</p>
    <h1 class="page-hero__title">Explore the <em>Work</em></h1>
    <p class="lede">A museum of original work from 2022–2026 — UX case studies, brand systems, campaigns, posters, composites and coded web experiments. Every piece is Danielle's own.</p>
  </div></section>
  <div class="container" data-gallery>
    <div class="gallery">
      <aside class="filter-rail js-only" aria-label="Filter projects by category">
        <h2 class="filter-rail__title">Categories</h2>
        <ul class="filter-list" role="list">{btns}</ul>
      </aside>
      <div>
        <p class="gallery__status" data-gallery-status role="status" aria-live="polite">Showing all {len(items)} works</p>
        <ul class="hall" role="list">{cards}</ul>
      </div>
    </div>
  </div>
</main>"""
    page(path="work.html", title="Work", desc="Explore Danielle Julian's work: UX/UI case studies, branding, web design, interaction design, advertising, visual design and coded digital worlds.",
         section="work", page_id="work", body=body)


def wing_page(portal: dict) -> None:
    preview = BY_SLUG[portal["preview"]]
    info = img_info(preview["images"][0]["file"])
    chips = "".join(f'<li class="chip">{esc(x)}</li>' for x in portal["leadsTo"])
    sections = ""
    for cid in portal["categories"]:
        cat = CATS[cid]
        cards = []
        for p in PROJECTS:
            if p["kind"] == "weblab":
                cards += [entry_card(p, e) for e in p["entries"] if cid in e["categories"]]
            elif cid in p["categories"]:
                cards.append(card(p))
        sections += f"""
<section class="wing-section" aria-labelledby="wing-{cid}">
  <div class="wing-section__head"><h2 id="wing-{cid}">{esc(cat['label'])}</h2>
  <a class="link-arrow" href="{{{{ROOT}}}}work.html?category={cid}">See {esc(cat['label'])} in the gallery{icon('arrow')}</a></div>
  <ul class="hall" role="list">{''.join(cards)}</ul>
</section>"""
    others = [o for o in PORTALS if o["id"] != portal["id"]]
    other_links = " ".join(f'<a class="btn btn--ghost btn--sm" href="{{{{ROOT}}}}{o["page"]}">{esc(o["kicker"])}: {esc(o["title"])}{icon("arrow")}</a>' for o in others)
    body = f"""
<main id="main" class="page-main" tabindex="-1">
  <section class="page-hero"><div class="container wing-hero">
    <div>
      <p class="breadcrumb"><a class="link-arrow link-arrow--back" href="{{{{ROOT}}}}index.html">{icon('arrow-left')}Back to the portals</a></p>
      <p class="eyebrow">{esc(portal['kicker'])}</p>
      <h1 class="page-hero__title">{esc(portal['title']).replace(' ', ' <em>', 1)}</em></h1>
      <p class="lede">{esc(portal['intro'])}</p>
      <ul class="chip-list" role="list" style="margin-top:1.5rem" aria-label="This portal leads to">{chips}</ul>
    </div>
    <div class="wing-arch" data-reveal><div class="wing-arch__inner"><img src="{{{{ROOT}}}}{info['full']}" width="{info['w']}" height="{info['h']}" alt="{esc(preview['images'][0]['alt'])}" fetchpriority="high"></div></div>
  </div></section>
  <div class="container">{sections}
    <div class="btn-row" style="margin-top:4rem">{other_links}<a class="btn btn--primary btn--sm" href="{{{{ROOT}}}}work.html">{icon('grid')}All work</a></div>
  </div>
</main>"""
    page(path=portal["page"], title=portal["title"], desc=f"{portal['title']} portal — {portal['intro']}", section="work", page_id="wing", body=body)


# --------------------------------------------------------------------------- static pages
def home_page() -> None:
    tpl = (SRC / "pages" / "index.html").read_text(encoding="utf-8")
    portal_items = []
    for i, portal in enumerate(PORTALS):
        info = img_info(portal.get("image") or BY_SLUG[portal["preview"]]["images"][0]["file"])
        thumbs = []
        for p in PROJECTS:
            if p["images"] and p["categories"][0] in portal["categories"]:
                thumbs.append(img_info(p["images"][0]["file"]))
        if not thumbs:  # e.g. Digital Worlds: coded work is mostly text-documented
            thumbs = [img_info(im["file"]) for p in PROJECTS if any(c in portal["categories"] for c in p["categories"]) for im in p["images"]]
        thumbs_html = "".join(f'<img src="{{{{ROOT}}}}{t["small"]}" width="{t["sw"]}" height="{t["sh"]}" alt="" loading="lazy">' for t in thumbs[:3])
        chips = "".join(f'<li class="chip">{esc(x)}</li>' for x in portal["leadsTo"][:4])
        portal_items.append(f"""
<li><a class="portal" href="{{{{ROOT}}}}{portal['page']}" data-portal-index="{i}" data-portal-image="{info['full']}">
  <span class="portal__window" aria-hidden="true"><img src="{{{{ROOT}}}}{info['small']}" width="{info['sw']}" height="{info['sh']}" alt="" loading="lazy"></span>
  <span class="portal__label"><span class="portal__kicker">{esc(portal['kicker'])}</span><span class="portal__title">{esc(portal['title']).replace(' ', '<br>', 1)}</span>
  <span class="portal__arrow" aria-hidden="true">{icon('arrow')}</span></span>
  <span class="portal-preview" aria-hidden="true"><span class="portal-preview__thumbs">{thumbs_html}</span><p>{esc(portal['intro'])}</p><ul class="chip-list">{chips}</ul></span>
</a></li>""")
    featured = "".join(card(p) for p in PROJECTS if p.get("featured"))
    body = tpl.replace("<!--PORTALS-->", "".join(portal_items)).replace("<!--FEATURED-->", featured)
    page(path="index.html", title="Home", desc="The Creative Dimension — an immersive portfolio by Danielle Julian, graphic designer, UX/UI designer and visual storyteller. Playful Systems. Purposeful Stories.",
         section="home", page_id="home", body=body, home=True)


def static_page(name: str, title: str, desc: str, section: str, lightbox=False) -> None:
    tpl = (SRC / "pages" / f"{name}.html").read_text(encoding="utf-8")
    page(path=f"{name}.html", title=title, desc=desc, section=section, page_id=name, body=tpl, lightbox=lightbox)


def not_found() -> None:
    body = f"""
<main id="main" class="page-main lost" tabindex="-1"><div>
  <p class="eyebrow">Error 404</p>
  <h1 class="page-hero__title">Lost between <em>dimensions</em></h1>
  <p class="lede" style="margin-inline:auto">This doorway leads nowhere yet. Return to the courtyard and choose a portal.</p>
  <div class="btn-row" style="justify-content:center;margin-top:2rem">
    <a class="btn btn--primary" href="{{{{ROOT}}}}index.html">{icon('arrow-left')}Back to the portals</a>
    <a class="btn btn--ghost" href="{{{{ROOT}}}}work.html">{icon('grid')}View all work</a>
  </div>
</div></main>"""
    page(path="404.html", title="Page not found", desc="Page not found.", section="", page_id="lost", body=body)
    # GitHub Pages serves 404.html at any depth: resolve assets from the site root.
    p = ROOT / "404.html"
    t = p.read_text(encoding="utf-8")
    base_js = ("<script>(function(){var s=location.pathname.split('/').filter(Boolean);"
               "var b=location.hostname.endsWith('github.io')&&s.length?'/'+s[0]+'/':'/';"
               "document.write('<base href=\"'+b+'\">');document.documentElement.dataset.root='';})();</script>")
    p.write_text(t.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n  ' + base_js, 1), encoding="utf-8")


def credits_page() -> None:
    md = (ROOT / "ASSET_CREDITS.md").read_text(encoding="utf-8")
    # Minimal Markdown → HTML for headings, lists, links, paragraphs and tables.
    out, in_list, in_table = [], False, False
    for line in md.splitlines():
        s = line.rstrip()
        s_html = esc(s)
        s_html = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2" rel="noopener">\1</a>', s_html)
        s_html = re.sub(r"`([^`]+)`", r"<code>\1</code>", s_html)
        s_html = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s_html)
        if s.startswith("|"):
            cells = [c.strip() for c in s_html.strip("|").split("|")]
            if set("".join(cells)) <= set("-: "):
                continue
            if not in_table:
                out.append('<table class="meta-table"><tbody>')
                in_table = True
            out.append("<tr>" + "".join(f"<td>{c}</td>" for c in cells) + "</tr>")
            continue
        if in_table:
            out.append("</tbody></table>")
            in_table = False
        if s.startswith("- "):
            if not in_list:
                out.append("<ul>")
                in_list = True
            out.append(f"<li>{s_html[2:]}</li>")
            continue
        if in_list:
            out.append("</ul>")
            in_list = False
        if s.startswith("# "):
            continue
        if s.startswith("## "):
            out.append(f'<h2 class="section__title" style="font-size:var(--fs-xl);margin-top:2.5rem">{s_html[3:]}</h2>')
        elif s.startswith("### "):
            out.append(f"<h3>{s_html[4:]}</h3>")
        elif s:
            out.append(f"<p>{s_html}</p>")
    if in_list:
        out.append("</ul>")
    if in_table:
        out.append("</tbody></table>")
    body = f"""
<main id="main" class="page-main" tabindex="-1">
  <section class="page-hero"><div class="container"><p class="eyebrow">Transparency</p><h1 class="page-hero__title">Credits &amp; <em>licences</em></h1></div></section>
  <div class="container"><div class="prose" style="max-width:52rem">{''.join(out)}</div></div>
</main>"""
    page(path="CREDITS.html", title="Credits & licences", desc="Third-party assets and licences used by The Creative Dimension.", section="", page_id="credits", body=body)


def manifest() -> None:
    rows = []
    for f in sorted((ROOT / "assets").rglob("*")):
        if f.is_file():
            rel = f.relative_to(ROOT).as_posix()
            kind = ("Portfolio artwork (extracted from Master Portfolio PDF)" if "/img/work/" in rel else
                    "HDR environment (Poly Haven CC0)" if rel.endswith(".exr") else
                    "Résumé" if "/docs/" in rel else "Stylesheet" if rel.endswith(".css") else
                    "JavaScript module" if rel.endswith(".js") else "Image")
            rows.append(f"| `{rel}` | {f.stat().st_size / 1024:.1f} KB | {kind} |")
    for f in sorted((ROOT / "vendor").rglob("*")):
        if f.is_file():
            rows.append(f"| `{f.relative_to(ROOT).as_posix()}` | {f.stat().st_size / 1024:.1f} KB | Three.js r170 (MIT), vendored |")
    pages = "\n".join(f"- `{p}`" for p in sorted(GENERATED))
    text = f"""# Asset manifest

Generated by `python3 tools/build_site.py`. Do not edit by hand.

## Generated pages

{pages}

## Files

| File | Size | Purpose |
|---|---|---|
""" + "\n".join(rows) + "\n"
    (ROOT / "ASSET_MANIFEST.md").write_text(text, encoding="utf-8")


def main() -> None:
    home_page()
    work_page()
    for portal in PORTALS:
        wing_page(portal)
    for i, p in enumerate(PROJECTS):
        project_page(p, i)
    static_page("about", "About", "About Danielle Julian — multidisciplinary designer working across graphic design, UX/UI, branding, web, interaction design, advertising and visual storytelling.", "about")
    static_page("resume", "Resume", "Danielle Julian's résumé: education, experience, skills, tools, selected projects and credentials. View or download the PDF.", "resume")
    static_page("contact", "Contact", "Contact Danielle Julian — email and LinkedIn. Let's make something memorable.", "contact")
    not_found()
    credits_page()
    manifest()
    print(f"built {len(GENERATED)} pages")


if __name__ == "__main__":
    main()
