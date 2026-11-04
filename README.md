# Open Hours Studio

The website of **Open Hours Studio**, a small web studio that builds websites for small local businesses (cafés, bakeries, restaurants, salons, barbers, shops) in London, Tokyo, Milan, Amsterdam, Berlin and Toronto.

Live site: https://openhoursstudio.github.io

## How it works

Plain static site with no build step: hand-written HTML, one stylesheet (`studio.css`) and a few scripts in `assets/`. GitHub Pages serves the `main` branch as is (`.nojekyll`).

Run it locally:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. All links are relative, so pages also open straight from disk.

## What's where

| Path | Contents |
|---|---|
| `index.html` | Home |
| `about/`, `contact/`, `faq/`, `privacy/`, `terms/`, `404.html` | Studio pages |
| `services/`, `sectors/` | Services and prices; pages per type of business |
| `work/` | Work index and one case study per concept site |
| `works/` | The concept demo sites (fictional businesses, always labelled "concept") |
| `journal/` | Articles for shop owners |
| `assets/` | Scripts, screenshots (`shots/`) and photos (`photos/` + `CREDITS.json`) |
| `docs/PLAN.md` | Roadmap, status and decisions (in Persian) |

## Languages

Studio pages are written in Japanese with English in `data-en="…"` attributes; the language button swaps them. Concept sites use their local language as the base, plus English and Japanese. See [`AGENTS.md`](AGENTS.md) for the details.

## Contributing

Read [`AGENTS.md`](AGENTS.md) (how to work on the site and the checklist before a PR) and [`docs/PLAN.md`](docs/PLAN.md) (what's next). Work on a branch and open a pull request; the owner merges.

## Credits

Photos are CC0, CC BY or CC BY-SA; creators, licences and sources are listed in [`assets/photos/CREDITS.json`](assets/photos/CREDITS.json).
