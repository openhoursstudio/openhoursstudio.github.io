# AGENTS.md: how to work on this project

Read this first if you are an AI agent (or a new person) picking up the Open Hours Studio website.

**The plan and current status live in [`docs/PLAN.md`](docs/PLAN.md).** Read it before starting, pick the next open item, and update it when you finish (status, decisions, work log, "last updated" date).

## The project in one paragraph

Open Hours Studio is a small web studio that builds websites for small local businesses (cafés, bakeries, restaurants, salons, barbers, shops) in six cities: London, Tokyo, Milan, Amsterdam, Berlin, Toronto. This repo is the studio's own marketing site, served by GitHub Pages at https://openhoursstudio.github.io from the `main` branch. Its job is to win real clients: a shop owner should trust the work and send an enquiry.

## Owner

- **Javadjan** (GitHub `Javad1942`) owns the project and makes every business decision.
- The owner writes in **Persian**. Talk to them in Persian. Site content stays in the site's own languages (see below), not Persian.
- Contact email on the site is `hmohammadjavad48@gmail.com`, by the owner's decision. Do not change it.

## Tech: plain static site, no build step

- Hand-written HTML, one shared stylesheet (`studio.css`) and two scripts (`assets/studio.js`, `assets/concept.js`). No framework, no package.json, no generator.
- `.nojekyll` is present, so GitHub Pages serves files as they are.
- The header, menu and footer are **copied into every page**. A nav or footer change must be applied to every studio page with a script (Python is fine), then checked with `git diff`.
- All links are relative (`../../index.html`), so pages work when opened from disk too.

## Map of the repo

| Path | What it is |
|---|---|
| `index.html` | Home |
| `about/`, `contact/`, `privacy/`, `terms/`, `404.html` | Studio pages |
| `services/` (+ `websites/`, `google-maps/`, `photos/`, `care/`) | Services and prices |
| `sectors/` (+ `cafes/`, `restaurants/`, `beauty/`, `shops/`) | Pages per type of business |
| `work/` and `work/<slug>/` | Work index and one case study per concept site |
| `works/<slug>/` | The concept demo sites themselves (fictional businesses), each with its own `style.css` plus shared `works/pages.css` |
| `assets/shots/<slug>-desk.webp` (1200×750), `<slug>-phone.webp` (520×1125) | Screenshots of each concept site |
| `assets/photos/` + `CREDITS.json` | Photos (CC0 etc.); every new photo needs a credits entry |
| `flyers/` | Printable flyers for local partners; hidden from search in `robots.txt` |
| `sitemap.xml`, `robots.txt` | SEO |
| `docs/PLAN.md` | Roadmap, status, decisions (Persian) |

## Languages

Each page has a **base language** in the HTML text and **English in `data-en="…"`** attributes; `concept.js` swaps them with the JA/EN button.

- `<body data-base="ja|en|it|nl|de">` sets the base language; `data-title-en` gives the English `<title>`.
- Studio pages (home, services, about, etc.) are Japanese-base with English alternates.
- The city landing pages were removed on 2026-10-20. `it`/`nl`/`de` base languages now only occur on concept sites.
- Every new visible string needs both the base text and a `data-en` translation.

## Concept sites (`works/`)

- The businesses are fictional and must always be labelled "concept".
- `<body>` sets opening hours for the live "open now" badge: `data-tz`, `data-open`, `data-close`, `data-closed-day` (0 = Sunday), `data-key`.
- A **new concept site** must be added to: `work/index.html`, a `work/<slug>/index.html` case study, its sector page, its city page, the home page strip if featured, `sitemap.xml`, and get desk and phone screenshots in `assets/shots/`.
- The cloud environment usually cannot download new photos, and Unsplash/Pexels are blocked from the owner's network too. What worked (2026-10-14): search Wikimedia Commons (CC0, CC BY, CC BY-SA only) and download on the owner's laptop through the connected device tools, then copy the files in. Every photo gets a `CREDITS.json` entry with creator, licence and source page; the concept footer lists them.
- Photo-led concept sites with scroll animation use the shared `works/scroll.js` (see the comment at its top for the `data-*` hooks). Keep motion to transform/opacity and make sure the page reads fine with reduced motion.

## How to work

1. Read `docs/PLAN.md`. Items marked ⏳ wait on the owner: remind, don't do.
2. Work on a branch, never push straight to `main`. Open a PR and let the owner merge it.
3. Keep changes focused: one topic per PR.
4. Don't change visible design (colours, fonts, layout) or prices without the owner's OK. Fixes that don't change the look (accessibility, SEO, broken links, performance) are fine.
5. Never invent clients, testimonials, reviews, partner names or numbers and present them as real.

## Before a PR

- Serve locally: `python3 -m http.server 8000` and open the changed pages.
- Check on a phone-width viewport (about 375px) and desktop: no horizontal scroll, nothing overlapping.
- Toggle the language button on changed pages: every string switches.
- No broken internal links or missing images (a quick crawl script or Playwright is fine; Chromium is often preinstalled).
- No console errors.
- New pages: unique `<title>`, meta description, canonical URL, absolute `og:image`, added to `sitemap.xml` and to menus/cards where they belong.
- Update `docs/PLAN.md`.
