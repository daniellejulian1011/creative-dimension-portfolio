# UI UX Pro Max — raw search outputs (2026-11-06)

Unedited output of the repository's UI UX Pro Max skill (v2.15.0). Commands are listed above each block.

## Design system

`search.py "cinematic immersive creative portfolio storytelling" --design-system -p "The Creative Dimension" --variance 7 --motion 8 --density 3 --format markdown`

## Design System: The Creative Dimension

### Design Dials
- **Variance:** 7/10 — Balanced / Modern
- **Motion:** 8/10 — Complex
- **Density:** 3/10 — Spacious

### Pattern
- **Name:** Scroll-Triggered Storytelling
- **Conversion Focus:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable state under reduced motion.
- **CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Color Strategy:** Progressive reveal. Each chapter has distinct color. Building intensity.
- **Sections:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA

### Style
- **Name:** Brutalism
- **Mode Support:** Light supported | Dark supported
- **Keywords:** Raw, unpolished, stark, high contrast, plain text, default fonts, visible borders, asymmetric, anti-design
- **Best For:** Design portfolios, artistic projects, counter-culture brands, editorial/media sites, tech blogs
- **Performance:** cost:low|drivers:none | **Accessibility:** risk:low|requires:contrast-text-4.5,keyboard,visible-focus,reduced-motion

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#18181B` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#3F3F46` | `--color-secondary` |
| On Secondary | `#FFFFFF` | `--color-on-secondary` |
| Accent/CTA | `#2563EB` | `--color-accent` |
| On Accent/CTA | `#FFFFFF` | `--color-on-accent` |
| Background | `#FAFAFA` | `--color-background` |
| Foreground | `#09090B` | `--color-foreground` |
| Card | `#FFFFFF` | `--color-card` |
| Card Foreground | `#09090B` | `--color-card-foreground` |
| Muted | `#E8ECF0` | `--color-muted` |
| Muted Foreground | `#475569` | `--color-muted-foreground` |
| Border | `#E4E4E7` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `--color-on-destructive` |
| Ring | `#18181B` | `--color-ring` |

*Notes: Monochrome + blue accent*

### Typography
- **Heading:** Archivo
- **Body:** Space Grotesk
- **Mood:** minimal, portfolio, designer, creative, clean, artistic
- **Best For:** Design portfolios, creative professionals, minimalist brands
- **Google Fonts:** https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap
- **CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
```

### Key Effects
No smooth transitions (instant), sharp corners (0px), bold typography (700+), visible grid, large blocks

### Motion
**Scroll Reveal** (Complex) — Trigger: scroll (continuous scrub) | Duration: tied to scroll position | Easing: `none (scrub-driven)`
```js
gsap.timeline({ scrollTrigger: { trigger: section, start: 'top top', end: '+=150%', scrub: 1, pin: true } }).from('.headline', { opacity: 0, y: 40 }).to('.bg-layer', { yPercent: -20 }, '<');
```
*Framework notes: Pinning needs the section to have deterministic height; recalc ScrollTrigger.refresh() after images/fonts load; Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately*
- ✅ Use scrub: true or a small number (0.5-1.5) instead of instant jumps so it feels tied to the scrollbar
- ❌ Don't pin more than 1-2 sections per page; excessive pinning fights native scroll feel and hurts mobile UX

### Avoid (Anti-patterns)
- Corporate templates
- Generic layouts

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px


## style

`search.py "immersive 3D storytelling portfolio" --domain style -n 4`

## UI Pro Max Search Results
**Domain:** style | **Query:** immersive 3D storytelling portfolio
**Source:** styles.csv | **Found:** 4 results

### Result 1
- **Style ID:** 3d-and-hyperrealism
- **Style Category:** 3D & Hyperrealism
- **Aliases:** 
- **Status:** active
- **Parent Style ID:** 
- **Preferred Mode:** auto
- **Type:** General
- **Keywords:** Depth, realistic textures, 3D models, spatial navigation, tactile, skeuomorphic elements, rich detail, immersive
- **Primary Colors:** Deep Navy #001F3F, Forest Green #228B22, Burgundy #800020, Gold #FFD700, Silver #C0C0C0
- **Effects & Animation:** WebGL/Three.js 3D, realistic shadows (layers), physics lighting, parallax (3-5 layers), smooth 3D (300-400ms)
- **Best For:** Gaming, product showcase, immersive experiences, high-end e-commerce, architectural viz, VR/AR
- **Light Mode ✓:** conditional
- **Dark Mode ✓:** conditional
- **Performance:** cost:high|drivers:animation,large-images
- **Accessibility:** risk:high|requires:contrast-text-4.5,keyboard,visible-focus,reduced-motion
- **Framework Compatibility:** threejs|react-three-fiber|custom
- **Complexity:** High
- **AI Prompt Keywords:** Build an immersive 3D interface using realistic textures, 3D models (Three.js/Babylon.js), complex shadows, realistic lighting, parallax scrolling (3-5 layers), physics-based motion. Include skeuomorphic elements with tactile detail.
- **CSS/Technical Keywords:** transform: translate3d, perspective: 1000px, WebGL canvas, Three.js/Babylon.js library, box-shadow: complex multi-layer, background: complex gradients, filter: drop-shadow()
- **Implementation Checklist:** ☐ WebGL/Three.js integrated, ☐ 3D models loaded, ☐ Parallax 3-5 layers, ☐ Realistic lighting verified, ☐ Complex shadows rendered, ☐ Physics animation smooth 300-400ms
- **Design System Variables:** --perspective: 1000px, --parallax-layers: 5, --lighting-intensity: realistic, --shadow-depth: 20-40%, --animation-duration: 300-400ms
- **rtl_level:** full

### Result 2
- **Style ID:** skeuomorphism
- **Style Category:** Skeuomorphism
- **Aliases:** 
- **Status:** active
- **Parent Style ID:** 
- **Preferred Mode:** auto
- **Type:** General
- **Keywords:** Realistic, texture, depth, 3D appearance, real-world metaphors, shadows, gradients, tactile, detailed, material
- **Primary Colors:** Rich realistic: wood, leather, metal colors, detailed gradients (8-12 stops), metallic effects
- **Effects & Animation:** Realistic shadows (layers), depth (perspective), texture details (noise, grain), realistic animations (300-500ms)
- **Best For:** Legacy apps, gaming, immersive storytelling, premium products, luxury, realistic simulations, education
- **Light Mode ✓:** conditional
- **Dark Mode ✓:** conditional
- **Performance:** cost:high|drivers:animation,large-images
- **Accessibility:** risk:low|requires:contrast-text-4.5,keyboard,visible-focus,reduced-motion
- **Framework Compatibility:** css-in-js|custom
- **Complexity:** High
- **AI Prompt Keywords:** Design a realistic, textured interface with 3D depth, real-world metaphors (leather, wood, metal), complex gradients (8-12 stops), realistic shadows, grain/texture overlays, tactile press animations. Perfect for premium/luxury products.
- **CSS/Technical Keywords:** background: complex gradient (8-12 stops), box-shadow: realistic multi-layer, background-image: texture overlay (noise, grain), filter: drop-shadow, transform: scale on press (300-500ms)
- **Implementation Checklist:** ☐ Realistic textures applied, ☐ Complex gradients 8-12 stops, ☐ Multi-layer shadows, ☐ Texture overlays present, ☐ Tactile animations smooth, ☐ Depth effect pronounced
- **Design System Variables:** --gradient-stops: 8-12, --texture-overlay: noise+grain, --shadow-layers: 3+, --animation-duration: 300-500ms, --depth-effect: pronounced, --tactile: true
- **rtl_level:** full

### Result 3
- **Style ID:** parallax-storytelling
- **Style Category:** Parallax Storytelling
- **Aliases:** Parallax
- **Status:** active
- **Parent Style ID:** 
- **Preferred Mode:** auto
- **Type:** General
- **Keywords:** Scroll-driven, narrative, layered scrolling, immersive, progressive disclosure, cinematic, scroll-triggered
- **Primary Colors:** Story-dependent, often gradients and natural colors, section-specific palettes
- **Effects & Animation:** transform: translateY(scroll), position: fixed/sticky, perspective: 1px, scroll-triggered animations
- **Best For:** Brand storytelling, product launches, case studies, portfolios, annual reports, marketing campaigns
- **Light Mode ✓:** supported
- **Dark Mode ✓:** supported
- **Performance:** cost:high|drivers:animation,large-images
- **Accessibility:** risk:high|requires:contrast-text-4.5,keyboard,visible-focus,reduced-motion
- **Framework Compatibility:** custom|locomotive-scroll
- **Complexity:** High
- **AI Prompt Keywords:** Design a parallax storytelling page. Use: scroll-driven narrative, layered backgrounds (3-5 layers), fixed/sticky sections, cinematic transitions, progressive disclosure, full-screen chapters, depth perception.
- **CSS/Technical Keywords:** position: fixed/sticky, transform: translateY(calc()), perspective: 1px, z-index layering, scroll-snap-type, Intersection Observer for triggers, will-change: transform
- **Implementation Checklist:** ☐ Layers parallax smoothly, ☐ Story flows naturally, ☐ Mobile alternative provided, ☐ Performance optimized, ☐ Skip option available, ☐ Reduced motion fallback
- **Design System Variables:** --parallax-speed-bg: 0.3, --parallax-speed-mid: 0.6, --parallax-speed-fg: 1, --section-height: 100vh, --transition-duration: 600ms, --perspective: 1px
- **rtl_level:** caveats

### Result 4
- **Style ID:** motion-driven
- **Style Category:** Motion-Driven
- **Aliases:** 
- **Status:** active
- **Parent Style ID:** 
- **Preferred Mode:** auto
- **Type:** General
- **Keywords:** Animation-heavy, microinteractions, smooth transitions, scroll effects, parallax, entrance anim, page transitions
- **Primary Colors:** Bold colors emphasize movement, high contrast animated, dynamic gradients, accent action colors
- **Effects & Animation:** Scroll anim (Intersection Observer), hover (300-400ms), entrance, parallax (3-5 layers), page transitions
- **Best For:** Portfolio sites, storytelling platforms, interactive experiences, entertainment apps, creative, SaaS
- **Light Mode ✓:** supported
- **Dark Mode ✓:** supported
- **Performance:** cost:low|drivers:none
- **Accessibility:** risk:conditional|requires:contrast-text-4.5,keyboard,visible-focus,reduced-motion
- **Framework Compatibility:** gsap|framer-motion
- **Complexity:** High
- **AI Prompt Keywords:** Build an animation-heavy interface with scroll-triggered animations, microinteractions, parallax scrolling (3-5 layers), smooth transitions (300-400ms), entrance animations, page transitions. Use Intersection Observer for scroll effects, transform for performance, GPU acceleration.
- **CSS/Technical Keywords:** animation: @keyframes scroll-reveal, transform: translateY/X, Intersection Observer API, will-change: transform, scroll-behavior: smooth, animation-duration: 300-400ms
- **Implementation Checklist:** ☐ Scroll animations active, ☐ Parallax 3-5 layers, ☐ Entrance animations smooth, ☐ Page transitions fluid, ☐ GPU accelerated, ☐ Prefers-reduced-motion respected
- **Design System Variables:** --animation-duration: 300-400ms, --parallax-layers: 5, --scroll-behavior: smooth, --gpu-accelerated: true, --entrance-animation: true, --page-transition: smooth
- **rtl_level:** partial


## color

`search.py "dark luxury magenta plum" --domain color -n 4`

## UI Pro Max Search Results
**Domain:** color | **Query:** dark luxury magenta plum
**Source:** colors.csv | **Found:** 4 results

### Result 1
- **Product Type:** Auction Platform
- **Primary:** #0F172A
- **On Primary:** #FFFFFF
- **Secondary:** #1E293B
- **On Secondary:** #FFFFFF
- **Accent:** #16A34A
- **On Accent:** #0F172A
- **Background:** #020617
- **Foreground:** #F8FAFC
- **Card:** #0E1223
- **Card Foreground:** #F8FAFC
- **Muted:** #1A1E2F
- **Muted Foreground:** #94A3B8
- **Border:** #334155
- **Destructive:** #DC2626
- **On Destructive:** #FFFFFF
- **Ring:** #FFFFFF
- **Notes:** Dark luxury + bid green + outbid red + urgency

### Result 2
- **Product Type:** E-commerce Luxury
- **Primary:** #1C1917
- **On Primary:** #FFFFFF
- **Secondary:** #44403C
- **On Secondary:** #FFFFFF
- **Accent:** #A16207
- **On Accent:** #FFFFFF
- **Background:** #FAFAF9
- **Foreground:** #0C0A09
- **Card:** #FFFFFF
- **Card Foreground:** #0C0A09
- **Muted:** #E8ECF0
- **Muted Foreground:** #475569
- **Border:** #D6D3D1
- **Destructive:** #DC2626
- **On Destructive:** #FFFFFF
- **Ring:** #1C1917
- **Notes:** Premium dark + gold accent [Accent adjusted from #CA8A04]

### Result 3
- **Product Type:** Beauty/Spa/Wellness Service
- **Primary:** #EC4899
- **On Primary:** #000000
- **Secondary:** #F9A8D4
- **On Secondary:** #0F172A
- **Accent:** #8B5CF6
- **On Accent:** #000000
- **Background:** #FDF2F8
- **Foreground:** #831843
- **Card:** #FFFFFF
- **Card Foreground:** #831843
- **Muted:** #F1EEF5
- **Muted Foreground:** #475569
- **Border:** #FBCFE8
- **Destructive:** #DC2626
- **On Destructive:** #FFFFFF
- **Ring:** #EC4899
- **Notes:** Soft pink + lavender luxury

### Result 4
- **Product Type:** Hotel/Hospitality
- **Primary:** #1E3A8A
- **On Primary:** #FFFFFF
- **Secondary:** #3B82F6
- **On Secondary:** #000000
- **Accent:** #A16207
- **On Accent:** #FFFFFF
- **Background:** #F8FAFC
- **Foreground:** #1E40AF
- **Card:** #FFFFFF
- **Card Foreground:** #1E40AF
- **Muted:** #E9EEF5
- **Muted Foreground:** #475569
- **Border:** #BFDBFE
- **Destructive:** #DC2626
- **On Destructive:** #FFFFFF
- **Ring:** #1E3A8A
- **Notes:** Luxury navy + gold service [Accent adjusted from #CA8A04]


## type

`search.py "elegant editorial luxury serif" --domain typography -n 4`

## UI Pro Max Search Results
**Domain:** typography | **Query:** elegant editorial luxury serif
**Source:** typography.csv | **Found:** 4 results

### Result 1
- **Font Pairing Name:** Classic Elegant
- **Category:** Serif + Sans
- **Heading Font:** Playfair Display
- **Body Font:** Inter
- **Mood/Style Keywords:** elegant, luxury, sophisticated, timeless, premium, editorial
- **Best For:** Luxury brands, fashion, spa, beauty, editorial, magazines, high-end e-commerce
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap
- **CSS Import:** @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap');
- **Tailwind Config:** fontFamily: { serif: ['Playfair Display', 'serif'], sans: ['Inter', 'sans-serif'] }
- **Notes:** High contrast between elegant heading and clean body. Perfect for luxury/premium.

### Result 2
- **Font Pairing Name:** Luxury Serif
- **Category:** Serif + Sans
- **Heading Font:** Cormorant
- **Body Font:** Montserrat
- **Mood/Style Keywords:** luxury, high-end, fashion, elegant, refined, premium
- **Best For:** Fashion brands, luxury e-commerce, jewelry, high-end services
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap
- **CSS Import:** @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
- **Tailwind Config:** fontFamily: { serif: ['Cormorant', 'serif'], sans: ['Montserrat', 'sans-serif'] }
- **Notes:** Cormorant's elegance with Montserrat's geometric precision.

### Result 3
- **Font Pairing Name:** Minimalist Monochrome Editorial
- **Category:** Serif + Serif + Mono (Triple Stack)
- **Heading Font:** Playfair Display
- **Body Font:** Source Serif 4
- **Mood/Style Keywords:** monochrome, editorial, austere, typographic, pocket manifesto, luxury, high contrast, brutalist mobile
- **Best For:** Luxury fashion mobile apps, editorial publications, digital exhibitions, portfolio apps, high-contrast e-reader aesthetics
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300
- **CSS Import:** @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,600;1,300&display=swap');
- **Tailwind Config:** fontFamily: { display: ['Playfair Display', 'serif'], body: ['Source Serif 4', 'serif'], mono: ['JetBrains Mono', 'monospace'] }
- **Notes:** Triple stack: Playfair Display 900 tracking-tighter leading-[0.9] for heroes (text-5xl–text-6xl breaks words graphically). Source Serif 4 300–600 for body legibility. JetBrains Mono 400–500 uppercase tracking-widest for tags/dates/labels. NO UI sans-serif — 100% serif/mono.

### Result 4
- **Font Pairing Name:** Real Estate Luxury
- **Category:** Serif + Sans
- **Heading Font:** Cinzel
- **Body Font:** Josefin Sans
- **Mood/Style Keywords:** real estate, luxury, elegant, sophisticated, property, premium
- **Best For:** Real estate, luxury properties, architecture, interior design
- **Google Fonts URL:** https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap
- **CSS Import:** @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Josefin+Sans:wght@300;400;500;600;700&display=swap');
- **Tailwind Config:** fontFamily: { serif: ['Cinzel', 'serif'], sans: ['Josefin Sans', 'sans-serif'] }
- **Notes:** Cinzel's elegance for headlines. Josefin for modern body.


## landing

`search.py "storytelling portfolio gallery" --domain landing -n 3`

## UI Pro Max Search Results
**Domain:** landing | **Query:** storytelling portfolio gallery
**Source:** landing.csv | **Found:** 3 results

### Result 1
- **Pattern ID:** portfolio-grid
- **Pattern Name:** Portfolio Grid
- **Aliases:** Portfolio + Hero-Centric
- **Keywords:** portfolio, grid, showcase, gallery, masonry, portfolio grid + visuals
- **Section Order:** Hero (Name/Role) > Project Grid (Masonry) > About/Philosophy > Contact
- **Primary CTA Placement:** Project Card Hover + Footer Contact
- **Color Strategy:** Neutral background (let work shine). Text: Black/White. Accent: Minimal.
- **Conversion Optimization:** Visuals first. Filter by category. Fast loading essential.

### Result 2
- **Pattern ID:** horizontal-scroll-journey
- **Pattern Name:** Horizontal Scroll Journey
- **Aliases:** 
- **Keywords:** horizontal, scroll, journey, gallery, storytelling, panoramic, storytelling-driven
- **Section Order:** Intro (Vertical) > The Journey (Horizontal Track) > Detail Reveal > Vertical Footer
- **Primary CTA Placement:** Floating Sticky CTA or End of Horizontal Track
- **Color Strategy:** Continuous palette transition. Chapter colors. Progress bar #000000.
- **Conversion Optimization:** Immersive product discovery. High engagement. Keep navigation visible. Preserve a normal vertical navigation path and disable scroll-jacking under reduced motion. Pause effects when offscreen/hidden and render every chapter in its final vertical reading state under reduced motion.

### Result 3
- **Pattern ID:** scroll-triggered-storytelling
- **Pattern Name:** Scroll-Triggered Storytelling
- **Aliases:** Storytelling + Data|Storytelling + Feature-Rich|Storytelling + Hero-Centric|Storytelling-Driven|Storytelling-Driven + Feature-Rich|Storytelling-Driven + Hero|Storytelling-Driven + Hero-Centric
- **Keywords:** storytelling, scroll, narrative, story, immersive
- **Section Order:** Intro hook > Chapter 1 (problem) > Chapter 2 (journey) > Chapter 3 (solution) > Climax CTA
- **Primary CTA Placement:** End of each chapter (mini) + Final climax CTA
- **Color Strategy:** Progressive reveal. Each chapter has distinct color. Building intensity.
- **Conversion Optimization:** Keep the narrative understandable without scroll-driven effects. Use progress indicator. Mobile: simplify animations. Keep DOM reading order complete; disable parallax and scroll-scrub under reduced motion. Pause scroll animation when offscreen or hidden and render each chapter in its final readable...


## gsap

`search.py "scroll reveal stagger" --domain gsap -n 3`

## UI Pro Max Search Results
**Domain:** gsap | **Query:** scroll reveal stagger
**Source:** motion.csv | **Found:** 3 results

### Result 1
- **Category:** Stagger List
- **Intensity Tier:** Complex
- **Trigger:** load or scroll
- **Duration:** 400-700ms
- **Easing:** expo.out
- **GSAP Snippet:** const split = new SplitText(headline, { type: 'chars' }); gsap.from(split.chars, { opacity: 0, y: 20, rotateX: -40, duration: 0.6, stagger: 0.015, ease: 'expo.out' });
- **Framework Notes:** SplitText is included with GSAP 3.13+; register it before use, review the current GSAP license, and keep a plain-text fade fallback; Use gsap.matchMedia('(prefers-reduced-motion: reduce)') to skip character motion and render the readable final state immediately
- **Do:** Revert SplitText on unmount/cleanup (split.revert()) to restore original text nodes for accessibility tools
- **Don't:** Don't split-animate long paragraphs; reserve for short headlines (under ~8 words)
- **Performance Notes:** Splitting text creates one element per character; keep it to headline-length copy only for DOM size

### Result 2
- **Category:** Scroll Reveal
- **Intensity Tier:** Subtle
- **Trigger:** scroll (viewport enter)
- **Duration:** 300-400ms
- **Easing:** power1.out
- **GSAP Snippet:** gsap.from(el, { opacity: 0, y: 12, duration: 0.35, ease: 'power1.out', scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' } });
- **Framework Notes:** Requires the ScrollTrigger plugin registered once via gsap.registerPlugin(ScrollTrigger); Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately
- **Do:** Keep the y offset small (8-16px) so it reads as a fade, not a slide
- **Don't:** Don't reveal below-the-fold content needed for SEO/crawlers as invisible-by-default without a no-JS fallback
- **Performance Notes:** toggleActions 'play none none reverse' avoids re-triggering on every scroll direction change

### Result 3
- **Category:** Stagger List
- **Intensity Tier:** Subtle
- **Trigger:** load or scroll
- **Duration:** 250-350ms
- **Easing:** power1.out
- **GSAP Snippet:** gsap.from('.list-item', { opacity: 0, y: 8, duration: 0.3, stagger: 0.03 });
- **Framework Notes:** Select items with a stable class/data-attribute (not array index) so re-renders in React don't break targeting; Use matchMedia('(prefers-reduced-motion: reduce)') to skip non-essential motion and render the final state immediately
- **Do:** Keep per-item stagger delay small (0.02-0.04s) for lists longer than 10 items
- **Don't:** Don't stagger by more than 0.1s per item on long lists; total reveal time becomes sluggish
- **Performance Notes:** For virtualized lists, only animate items currently mounted in the DOM


## UX guidelines (11 queries)

### reduced motion
## UI Pro Max Search Results
**Domain:** ux | **Query:** reduced motion
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Animation
- **Issue:** Reduced Motion
- **Platform:** All
- **Description:** Respect user's motion preferences
- **Do:** Check prefers-reduced-motion media query
- **Don't:** Ignore accessibility motion settings
- **Code Example Good:** @media (prefers-reduced-motion: reduce)
- **Code Example Bad:** No motion query check
- **Severity:** High

### Result 2
- **Category:** Animation
- **Issue:** Excessive Motion
- **Platform:** All
- **Description:** Too many animations cause distraction and motion sickness
- **Do:** Animate 1-2 key elements per view maximum
- **Don't:** Animate everything that moves
- **Code Example Good:** Single hero animation
- **Code Example Bad:** animate-bounce on 5+ elements
- **Severity:** High

### focus states keyboard
## UI Pro Max Search Results
**Domain:** ux | **Query:** focus states keyboard
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Interaction
- **Issue:** Focus States
- **Platform:** All
- **Description:** Keyboard focus, including controls inside a modal, needs a visible indicator
- **Do:** Use a visible focus ring on every interactive control, including modal controls
- **Don't:** Remove focus outline without replacement
- **Code Example Good:** focus:ring-2 focus:ring-blue-500
- **Code Example Bad:** outline-none without alternative
- **Severity:** High

### Result 2
- **Category:** Accessibility
- **Issue:** Focus Not Obscured (Enhanced)
- **Platform:** Web
- **Description:** WCAG 2.2 AAA requires keyboard focus to remain fully visible
- **Do:** Keep the entire focused component unobscured by author-created content
- **Don't:** Present this enhanced AAA criterion as an AA requirement or allow persistent UI to hide any part of focus
- **Code Example Good:** close persistent overlay before focus moves behind it
- **Code Example Bad:** sticky footer covers half the focused button
- **Severity:** Medium

### color contrast
## UI Pro Max Search Results
**Domain:** ux | **Query:** color contrast
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Accessibility
- **Issue:** Color Contrast
- **Platform:** All
- **Description:** Text must be readable against background
- **Do:** Minimum 4.5:1 ratio for normal text
- **Don't:** Low contrast text
- **Code Example Good:** #333 on white (7:1)
- **Code Example Bad:** #999 on white (2.8:1)
- **Severity:** High

### Result 2
- **Category:** Accessibility
- **Issue:** Color Only
- **Platform:** All
- **Description:** Don't convey information by color alone
- **Do:** Use icons/text in addition to color
- **Don't:** Red/green only for error/success
- **Code Example Good:** Red text + error icon
- **Code Example Bad:** Red border only for error
- **Severity:** High

### touch target size
## UI Pro Max Search Results
**Domain:** ux | **Query:** touch target size
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Touch
- **Issue:** Touch Target Size
- **Platform:** Mobile
- **Description:** Touch target guidance depends on platform and web context
- **Do:** Use 44pt on iOS and 48dp on Android; for web use the separate WCAG Target Size rule
- **Don't:** Treat one unit or minimum as universal across platforms
- **Code Example Good:** iOS 44pt; Android 48dp; Web 24 CSS px plus WCAG exceptions
- **Code Example Bad:** w-6 h-6 buttons
- **Severity:** High

### Result 2
- **Category:** Accessibility
- **Issue:** Target Size (Minimum)
- **Platform:** Web
- **Description:** WCAG 2.2 AA requires 24 CSS px pointer targets or an applicable exception
- **Do:** Use at least 24 by 24 CSS px or verify spacing equivalent inline user-agent or essential exceptions
- **Don't:** Assume native 44pt or 48dp guidance defines web conformance
- **Code Example Good:** min-width: 24px; min-height: 24px
- **Code Example Bad:** tiny adjacent icon buttons
- **Severity:** High

### skip link navigation
## UI Pro Max Search Results
**Domain:** ux | **Query:** skip link navigation
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Accessibility
- **Issue:** Skip Links
- **Platform:** Web
- **Description:** Allow keyboard users to skip navigation
- **Do:** Provide skip to main content link
- **Don't:** No skip link on nav-heavy pages
- **Code Example Good:** Skip to main content link
- **Code Example Bad:** 100 tabs to reach content
- **Severity:** Medium

### Result 2
- **Category:** Navigation
- **Issue:** Sticky Navigation
- **Platform:** Web
- **Description:** Fixed nav should not obscure content
- **Do:** Add padding-top to body equal to nav height
- **Don't:** Let nav overlap first section content
- **Code Example Good:** pt-20 (if nav is h-20)
- **Code Example Bad:** No padding compensation
- **Severity:** Medium

### loading state progress
## UI Pro Max Search Results
**Domain:** ux | **Query:** loading state progress
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Feedback
- **Issue:** Progress Indicators
- **Platform:** All
- **Description:** Show progress for multi-step processes
- **Do:** Step indicators or progress bar
- **Don't:** No indication of progress
- **Code Example Good:** Step 2 of 4 indicator
- **Code Example Bad:** No step information
- **Severity:** Medium

### Result 2
- **Category:** Feedback
- **Issue:** Loading Indicators
- **Platform:** All
- **Description:** Loading feedback should match the expected wait and avoid flashing for near-instant work
- **Do:** Follow platform and component guidance; preserve layout focus and accessible busy status
- **Don't:** Apply one timing threshold to every operation or leave long waits unexplained
- **Code Example Good:** Stable skeleton or progress with aria-busy
- **Code Example Bad:** Flickering spinner or frozen UI
- **Severity:** High

### lazy loading images
## UI Pro Max Search Results
**Domain:** ux | **Query:** lazy loading images
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Performance
- **Issue:** Lazy Loading
- **Platform:** All
- **Description:** Load content as needed
- **Do:** Lazy load below-fold images and content
- **Don't:** Load everything upfront
- **Code Example Good:** loading='lazy'
- **Code Example Bad:** All images eager load
- **Severity:** Medium

### Result 2
- **Category:** Accessibility
- **Issue:** Alt Text
- **Platform:** All
- **Description:** Images need text alternatives
- **Do:** Descriptive alt text for meaningful images
- **Don't:** Empty or missing alt attributes
- **Code Example Good:** alt='Dog playing in park'
- **Code Example Bad:** alt='' for content images
- **Severity:** High

### image alt text
## UI Pro Max Search Results
**Domain:** ux | **Query:** image alt text
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Accessibility
- **Issue:** Alt Text
- **Platform:** All
- **Description:** Images need text alternatives
- **Do:** Descriptive alt text for meaningful images
- **Don't:** Empty or missing alt attributes
- **Code Example Good:** alt='Dog playing in park'
- **Code Example Bad:** alt='' for content images
- **Severity:** High

### Result 2
- **Category:** Performance
- **Issue:** Image Optimization
- **Platform:** All
- **Description:** Large images slow page load
- **Do:** Use appropriate size and format (WebP)
- **Don't:** Unoptimized full-size images
- **Code Example Good:** srcset with multiple sizes
- **Code Example Bad:** 4000px image for 400px display
- **Severity:** High

### content jumping layout shift
## UI Pro Max Search Results
**Domain:** ux | **Query:** content jumping layout shift
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Layout
- **Issue:** Content Jumping
- **Platform:** Web
- **Description:** Images badges validation text and skeleton replacements can shift nearby content when they update
- **Do:** Reserve appropriate space or keep async states in a stable content-driven container
- **Don't:** Insert compact text or media without a layout strategy
- **Code Example Good:** aspect-ratio for media; stable count slot for badges
- **Code Example Bad:** Badge insertion pushes toolbar actions
- **Severity:** High

### Result 2
- **Category:** Typography
- **Issue:** Font Loading
- **Platform:** Web
- **Description:** Fonts should load without layout shift
- **Do:** Reserve space with fallback font
- **Don't:** Layout shift when fonts load
- **Code Example Good:** font-display: swap + similar fallback
- **Code Example Bad:** No fallback font
- **Severity:** Medium

### z-index modal focus trap
## UI Pro Max Search Results
**Domain:** ux | **Query:** z-index modal focus trap
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Interaction
- **Issue:** Focus States
- **Platform:** All
- **Description:** Keyboard focus, including controls inside a modal, needs a visible indicator
- **Do:** Use a visible focus ring on every interactive control, including modal controls
- **Don't:** Remove focus outline without replacement
- **Code Example Good:** focus:ring-2 focus:ring-blue-500
- **Code Example Bad:** outline-none without alternative
- **Severity:** High

### Result 2
- **Category:** Layout
- **Issue:** Stacking Context
- **Platform:** Web
- **Description:** New stacking contexts reset z-index
- **Do:** Understand what creates new stacking context
- **Don't:** Expect z-index to work across contexts
- **Code Example Good:** Parent with z-index isolates children
- **Code Example Bad:** z-index: 9999 not working
- **Severity:** Medium

### hover only interaction
## UI Pro Max Search Results
**Domain:** ux | **Query:** hover only interaction
**Source:** ux-guidelines.csv | **Found:** 2 results

### Result 1
- **Category:** Interaction
- **Issue:** Hover States
- **Platform:** Web
- **Description:** Visual feedback on interactive elements
- **Do:** Change cursor and add subtle visual change
- **Don't:** No hover feedback on clickable elements
- **Code Example Good:** hover:bg-gray-100 cursor-pointer
- **Code Example Bad:** No hover style
- **Severity:** Medium

### Result 2
- **Category:** Animation
- **Issue:** Hover vs Tap
- **Platform:** All
- **Description:** Hover effects don't work on touch devices
- **Do:** Use click/tap for primary interactions
- **Don't:** Rely only on hover for important actions
- **Code Example Good:** onClick handler
- **Code Example Bad:** onMouseEnter only
- **Severity:** High


## Three.js stack (6 queries)

### pixel ratio performance
## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** pixel ratio performance
**Source:** stacks/threejs.csv | **Found:** 2 results

### Result 1
- **Category:** Setup
- **Guideline:** Pixel Ratio Cap at 2
- **Description:** Cap devicePixelRatio at 2. Retina displays report 3x or higher. Going from 2x to 3x multiplies pixel count by 2.25x with no visible quality improvement at normal viewing distance.
- **Do:** Apply Math.min(window.devicePixelRatio, 2) — cap is at 2 not at 3
- **Don't:** Pass window.devicePixelRatio directly without any cap
- **Code Good:** renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
- **Code Bad:** renderer.setPixelRatio(window.devicePixelRatio); // 3x display = 9 pixels per CSS pixel = 2.25x GPU cost for zero quality gain
- **Severity:** High
- **Docs URL:** https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setPixelRatio
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### Result 2
- **Category:** Camera
- **Guideline:** Aspect Ratio on Resize
- **Description:** Always update camera.aspect and call camera.updateProjectionMatrix() inside every resize handler. A stale aspect ratio causes the entire scene to appear stretched or squashed horizontally.
- **Do:** Update camera.aspect then call updateProjectionMatrix() on every resize
- **Don't:** Let aspect ratio become stale after the browser window changes size
- **Code Good:** window.addEventListener('resize', () => { camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(canvas.clientWidth, canvas.clientHeight); });
- **Code Bad:** // No resize handler — scene stretches to fill a wider window without correcting the projection
- **Severity:** High
- **Docs URL:** https://threejs.org/docs/#api/en/cameras/PerspectiveCamera
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### dispose memory cleanup
## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** dispose memory cleanup
**Source:** stacks/threejs.csv | **Found:** 2 results

### Result 1
- **Category:** Materials
- **Guideline:** Dispose Textures Explicitly
- **Description:** Textures are the single largest consumer of GPU VRAM in most Three.js scenes. Call texture.dispose() when switching scenes or removing objects — Three.js does not garbage-collect GPU resources automatically.
- **Do:** Track all loaded textures and call dispose() on each one during scene teardown or on object removal
- **Don't:** Load textures without any cleanup path — they persist in VRAM for the entire page lifetime
- **Code Good:** const tex = new THREE.TextureLoader().load('img.jpg'); mesh.material.map = tex; // on teardown: tex.dispose(); mesh.material.dispose();
- **Code Bad:** const tex = new THREE.TextureLoader().load('img.jpg'); scene.remove(mesh); // tex occupies GPU VRAM until page reload
- **Severity:** High
- **Docs URL:** https://threejs.org/docs/#api/en/textures/Texture.dispose
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### Result 2
- **Category:** Geometry
- **Guideline:** dispose on Scene Removal
- **Description:** Call geometry.dispose() and material.dispose() and texture.dispose() for every texture map when removing objects from the scene. Three.js never releases GPU resources automatically — they stay in VRAM until explicitly freed.
- **Do:** Dispose of geometry + material + every texture map before calling scene.remove()
- **Don't:** Call scene.remove() alone without any dispose calls
- **Code Good:** function removeMesh(mesh) { scene.remove(mesh); mesh.geometry.dispose(); if (mesh.material.map) mesh.material.map.dispose(); if (mesh.material.normalMap) mesh.material.normalMap.dispose(); mesh.material.dispose(); }
- **Code Bad:** scene.remove(mesh); // geometry and all texture maps stay in GPU VRAM forever
- **Severity:** Critical
- **Docs URL:** https://threejs.org/docs/#api/en/core/BufferGeometry.dispose
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### render loop visibility
## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** render loop visibility
**Source:** stacks/threejs.csv | **Found:** 2 results

### Result 1
- **Category:** Animation
- **Guideline:** requestAnimationFrame Loop Only
- **Description:** Drive the render loop exclusively with requestAnimationFrame or renderer.setAnimationLoop(). Never use setInterval or setTimeout — they are not synchronized to the display refresh rate and keep running when the tab is hidden draining battery.
- **Do:** Use requestAnimationFrame or renderer.setAnimationLoop() as the sole render loop driver
- **Don't:** Use setInterval or setTimeout for render timing
- **Code Good:** function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); } animate();
- **Code Bad:** setInterval(() => renderer.render(scene, camera), 16); // not display-synced; runs at full speed even when tab is hidden
- **Severity:** Critical
- **Docs URL:** https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### Result 2
- **Category:** Animation
- **Guideline:** Pause Render Loop on Tab Hidden
- **Description:** Use renderer.setAnimationLoop() as the loop driver so you can pass null to pause and a function to resume. Continuous rendering in a hidden tab wastes CPU GPU and battery with no user benefit.
- **Do:** Use renderer.setAnimationLoop(animate) to drive the loop; pass null to pause on visibilitychange
- **Don't:** Drive with internal requestAnimationFrame and never stop the loop when the tab is hidden
- **Code Good:** const timer = new THREE.Timer(); timer.connect(document); // resets on tab return so the first delta after resume is not huge renderer.setAnimationLoop(animate); // use setAnimationLoop as the driver — not requestAnimationFrame inside animate function animate(timestamp) { timer.update(timestamp); const dt = timer.getDelta(); renderer.render(scene, camera); } document.addEventListener('visibilitychange', () => { if (document.hidden) renderer.setAnimationLoop(null); else renderer.setAnimationLoop(animate); });
- **Code Bad:** function animate() { requestAnimationFrame(animate); // self-referencing RAF cannot be stopped externally renderer.render(scene, camera); } animate(); // runs forever in background tab — drains battery
- **Severity:** High
- **Docs URL:** https://threejs.org/docs/#api/en/renderers/WebGLRenderer.setAnimationLoop
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-09-26

### postprocessing bloom
## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** postprocessing bloom
**Source:** stacks/threejs.csv | **Found:** 0 results

No matches. This is not a match with an empty value -- the query did not hit the database. Retry with broader/different keywords before falling back to general defaults, and say explicitly that no database match was found if you do fall back.
**Closest known terms:** bottom
### fallback webgl
## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** fallback webgl
**Source:** stacks/threejs.csv | **Found:** 2 results

### Result 1
- **Category:** Performance
- **Guideline:** antialias Set at Construction Only
- **Description:** The antialias option can only be set at WebGLRenderer construction time. Setting renderer.antialias after construction has absolutely no effect — the WebGL context is already created without it. Decide before instantiating.
- **Do:** Set antialias:true inside the WebGLRenderer constructor options object
- **Don't:** Construct the renderer without antialias then try to enable it by assigning the property
- **Code Good:** const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // antialias baked into the WebGL context
- **Code Bad:** const renderer = new THREE.WebGLRenderer(); renderer.antialias = true; // no effect — context created without AA — edges remain aliased
- **Severity:** High
- **Docs URL:** https://threejs.org/docs/#api/en/renderers/WebGLRenderer
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### Result 2
- **Category:** Accessibility
- **Guideline:** Canvas aria-label
- **Description:** Add role='img' and a descriptive aria-label to renderer.domElement after appending it to the DOM. Screen readers receive no information from a WebGL canvas — the aria-label is the only description they can announce to users.
- **Do:** Set role='img' and a meaningful aria-label on renderer.domElement before or after appending it
- **Don't:** Append the canvas to the DOM with no accessibility attributes — invisible to screen readers
- **Code Good:** renderer.domElement.setAttribute('role', 'img'); renderer.domElement.setAttribute('aria-label', 'Interactive 3D product viewer. Drag to rotate. Scroll to zoom.'); document.body.appendChild(renderer.domElement);
- **Code Bad:** document.body.appendChild(renderer.domElement); // bare canvas — screen readers announce nothing
- **Severity:** Medium
- **Docs URL:** https://developer.mozilla.org/en-US/docs/Web/HTML/Element/canvas#accessibility_concerns
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### texture compression
## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** texture compression
**Source:** stacks/threejs.csv | **Found:** 2 results

### Result 1
- **Category:** Geometry
- **Guideline:** dispose on Scene Removal
- **Description:** Call geometry.dispose() and material.dispose() and texture.dispose() for every texture map when removing objects from the scene. Three.js never releases GPU resources automatically — they stay in VRAM until explicitly freed.
- **Do:** Dispose of geometry + material + every texture map before calling scene.remove()
- **Don't:** Call scene.remove() alone without any dispose calls
- **Code Good:** function removeMesh(mesh) { scene.remove(mesh); mesh.geometry.dispose(); if (mesh.material.map) mesh.material.map.dispose(); if (mesh.material.normalMap) mesh.material.normalMap.dispose(); mesh.material.dispose(); }
- **Code Bad:** scene.remove(mesh); // geometry and all texture maps stay in GPU VRAM forever
- **Severity:** Critical
- **Docs URL:** https://threejs.org/docs/#api/en/core/BufferGeometry.dispose
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13

### Result 2
- **Category:** Materials
- **Guideline:** Dispose Textures Explicitly
- **Description:** Textures are the single largest consumer of GPU VRAM in most Three.js scenes. Call texture.dispose() when switching scenes or removing objects — Three.js does not garbage-collect GPU resources automatically.
- **Do:** Track all loaded textures and call dispose() on each one during scene teardown or on object removal
- **Don't:** Load textures without any cleanup path — they persist in VRAM for the entire page lifetime
- **Code Good:** const tex = new THREE.TextureLoader().load('img.jpg'); mesh.material.map = tex; // on teardown: tex.dispose(); mesh.material.dispose();
- **Code Bad:** const tex = new THREE.TextureLoader().load('img.jpg'); scene.remove(mesh); // tex occupies GPU VRAM until page reload
- **Severity:** High
- **Docs URL:** https://threejs.org/docs/#api/en/textures/Texture.dispose
- **Applies To:** threejs 0.185.1
- **Status:** active
- **Verified At:** 2026-08-13


## Retry for 0-result query

`search.py "EffectComposer" --stack threejs -n 2`

## UI Pro Max Stack Guidelines
**Stack:** threejs | **Query:** EffectComposer
**Source:** stacks/threejs.csv | **Found:** 0 results

No matches. This is not a match with an empty value -- the query did not hit the database. Retry with broader/different keywords before falling back to general defaults, and say explicitly that no database match was found if you do fall back.
