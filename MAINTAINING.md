# Maintaining this profile

GitHub shows `README.md` from this repository (`RK-Rohan/RK-Rohan`) at the top of
https://github.com/RK-Rohan.

## Layout

| Path | What it is |
| :-- | :-- |
| `README.md` | The profile page. Text, links, stats cards and tables are edited here directly. |
| `scripts/data.mjs` | Content for the generated SVGs: name, roles, career, skill groups, featured projects. |
| `scripts/generate.mjs` | Builds every SVG in `assets/` from `data.mjs`. No dependencies. |
| `assets/` | Generated animated SVGs (hero, skill ledger, career chain, project cards). Don't edit by hand. |
| `.github/workflows/snake.yml` | Daily job that draws the contribution snake into the `output` branch. |

## Changing content

1. Edit `scripts/data.mjs`.
2. Run `node scripts/generate.mjs` (Node 18+).
3. If you added or removed a featured project, update its `<a><img></a>` pair under **Featured Work** in `README.md`.
4. Commit `scripts/` and `assets/` together.

Project descriptions are limited to four lines on the card; the generator stops with an error if
one runs longer.

## Content rules

- Keep content in line with https://www.rezaul-karim.com. No invented metrics, projects or claims.
  The Web3 styling (blocks, hashes, chain) is presentation only. The hashes come from FNV-1a over
  the text and mean nothing.
- Link **public** repositories only. Check visibility with
  `gh repo view RK-Rohan/<repo> --json visibility` before adding one.
- Link a live demo only after checking it responds.

## External images

The stats and streak cards come from public services
(`github-readme-stats.vercel.app`, `streak-stats.demolab.com`).
They only count public activity, plus private contribution *counts* if "Include private
contributions on my profile" is turned on in GitHub settings. They never show private repository
names. If a service goes down or rate-limits, the card shows as a broken image: self-host it on
Vercel or remove that `<img>`.

The snake doubles as the contribution-activity graph. (`github-readme-activity-graph.vercel.app`
was dropped: it returned HTTP 402 in October 2026.) The snake images exist once the **Contribution snake** workflow has run. Trigger it from the
Actions tab (or `gh workflow run snake.yml`) if they're missing.
