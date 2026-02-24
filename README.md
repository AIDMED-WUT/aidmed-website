# AIDMED Website

Website of the AIDMED research group at the Faculty of Mathematics and Information Sciences, Warsaw University of Technology.

**Languages:** Polish (primary) · English (`/en/`)

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Astro](https://astro.build) | 5 | Static site generator |
| [Tailwind CSS](https://tailwindcss.com) | 4 (via `@tailwindcss/vite`) | Styling |
| TypeScript | strict | Type safety |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | – | Auto-generated sitemap |
| GitHub Actions | – | Deploy + content automation |
| GitHub Pages | – | Hosting |

---

## Local Development

**Prerequisites:** Node.js 20+

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:4321
npm run dev

# Build for production (output to dist/)
npm run build

# Preview the production build locally
npm run preview
```

---

## Project Structure

```
aidmed-website/
├── src/
│   ├── content/            # Markdown content files
│   │   ├── config.ts       # Zod schemas for all collections
│   │   ├── seminars/       # One .md per seminar
│   │   ├── publications/   # One .md per publication
│   │   ├── team/           # One .md per team member
│   │   └── projects/       # One .md per project
│   ├── i18n/
│   │   ├── pl.ts           # Polish UI strings
│   │   └── en.ts           # English UI strings
│   ├── layouts/
│   │   └── Layout.astro    # Base layout (SEO, fonts, JSON-LD)
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── SeminarCard.astro
│   │   ├── PublicationItem.astro
│   │   └── TeamMemberCard.astro
│   ├── pages/              # Polish pages (/)
│   │   ├── index.astro
│   │   ├── zespol.astro
│   │   ├── seminaria.astro
│   │   ├── seminaria/[slug].astro
│   │   ├── publikacje.astro
│   │   ├── projekty.astro
│   │   ├── kontakt.astro
│   │   └── en/             # English mirrors (/en/)
│   └── styles/
│       └── global.css      # Tailwind v4 entry + CSS variables
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── .github/
│   ├── ISSUE_TEMPLATE/     # GitHub issue forms
│   └── workflows/          # GitHub Actions
└── scripts/
    └── issue-to-content.mjs
```

---

## Adding Content

### Option A: GitHub Issue (recommended for non-developers)

Go to **Issues → New issue** and choose one of the three forms:

| Form | Label | What it creates |
|---|---|---|
| Add Seminar | `add-seminar` | `src/content/seminars/YYYY-MM-DD-speaker.md` |
| Add Publication | `add-publication` | `src/content/publications/YEAR-author-title.md` |
| Add Team Member | `add-team-member` | `src/content/team/name.md` |

After submitting, the **`issue-to-content`** Action automatically:
1. Parses the issue form fields
2. Generates the markdown file
3. Opens a pull request for review
4. Merging the PR triggers a new deployment

### Option B: Edit files directly

Create a markdown file in the appropriate `src/content/` subdirectory.

**Seminar** (`src/content/seminars/YYYY-MM-DD-speaker-keyword.md`):
```yaml
---
date: "2025-03-19"
speaker: "Jan Kowalski"
affiliation: "Wydział MiNI PW"          # optional
title: "Title in English"
title_pl: "Tytuł po polsku"             # optional
abstract: "Abstract in English"         # optional
abstract_pl: "Streszczenie po polsku"   # optional
slides: "https://..."                   # optional URL to PDF
---
```

**Publication** (`src/content/publications/YEAR-author-keyword.md`):
```yaml
---
authors:
  - "A. Kowalski"
  - "B. Nowak"
title: "Publication title"
journal: "Journal Name"                 # for journal articles
booktitle: "Conference / Book Name"     # for chapters/conference papers
year: 2025
doi: "10.1000/xyz"                      # optional
url: "https://..."                      # optional, if no DOI
impact_factor: 3.5                      # optional
type: "journal"                         # journal | book_chapter | conference
---
```

**Team member** (`src/content/team/firstname-lastname.md`):
```yaml
---
name: "Jan Kowalski"
role: "PhD Student"
role_pl: "Doktorant"                    # optional
affiliation: "Wydział MiNI PW"         # optional
email: "jan.kowalski@pw.edu.pl"        # optional
research_areas:                         # optional
  - "Medical image analysis"
  - "Deep learning"
active: true
order: 20                               # optional, controls sort order
---
```

---

## GitHub Actions

### `deploy.yml` — Deploy to GitHub Pages

**Trigger:** push to `main`

```
push to main → npm ci → npm run build → deploy dist/ to GitHub Pages
```

**First-time setup:**
1. Go to **Settings → Pages**
2. Set Source to **GitHub Actions**
3. The workflow runs automatically on the next push

### `issue-to-content.yml` — Issue to Content PR

**Trigger:** issue labeled with `add-seminar`, `add-publication`, or `add-team-member`

```
Issue labeled → parse form body → generate .md file → create branch → open PR
```

**Required permissions** (set in repository Settings → Actions → General):
- Workflow permissions: **Read and write**
- Check: **Allow GitHub Actions to create and approve pull requests**

---

## Deployment

Every push to `main` triggers a full rebuild and redeploy via GitHub Actions. No manual steps needed after the initial setup.

To deploy manually (e.g., after the initial repo setup):

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

Then watch the **Actions** tab for the deploy workflow to complete (~1 minute).

---

## Updating the Site URL

If the site moves to a different domain, update two places:

1. **`astro.config.mjs`** — `site:` field
2. **`public/robots.txt`** — `Sitemap:` line

---

## Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `grafitowy` | `#3C3C4C` | Primary text, headings |
| `szafirowy` | `#7896CF` | Accent, links, active nav |
| `mietowy` | `#6ABA9C` | Secondary accent, badges |
| `surface` | `#F8F8FA` | Card backgrounds |

Colors are defined as CSS variables in `src/styles/global.css` and available as Tailwind utilities: `text-grafitowy`, `bg-szafirowy`, etc.
