# Divino Al Ricafort — Portfolio

A React and Vite portfolio with a white editorial canvas, iridescent hero sculpture, live public GitHub projects, and draggable project blocks powered by Matter.js. The project scene is the only physics area; the biography, skills, experience, and credentials stay readable.

## Run and preview

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
npm run build
npm run preview
```

The production build goes to `dist/`. The existing GitHub Pages workflow deploys on pushes to `main`; this revision does not publish automatically from the local workspace. Relative Vite asset paths support GitHub Pages repository subpaths.

## Project playground

Blocks fall into a bounded scene, collide, and stack. Drag a whole block with a mouse or its dotted grip on a touch screen. Click, tap, Enter, or Space opens the same project details. Search covers the entire loaded collection; the playground shows eight results per page, while List view displays all matches.

Reset restores the arrangement. Pause stops motion. Movement controls offer a tap/keyboard alternative to dragging. Physics pauses when the scene is offscreen, the browser tab is hidden, or details are open. Reduced-motion preferences default to List view. Mobile scrolling remains available outside the drag grips.

## GitHub connection

The portfolio reads all public repositories belonging to `thebaynal`, including forks and archived repositories, using the public GitHub REST API. No account sign-in, browser token, or backend is required. It fetches every page before publishing a refreshed collection; no extra request is made per repository.

A complete collection is cached locally for one hour, with stale data refreshed in the background. Manual refresh has a 60-second cooldown. Failed or rate-limited requests retain the last complete collection; if none exists, the five authored projects stay usable. A successful empty collection shows an empty state. New public repositories appear after the next successful refresh.

GitHub requests are subject to its public API limits, so a successful refresh is required to discover changes. Cached data and authored fallback projects are explicitly identified in the interface.

## Edit your content

- `src/data/portfolio.js`: biography, socials, skills, milestones, credentials, and project notes. Project notes match live repositories using `fullName` (for example, `thebaynal/UsTogether`).
- Each authored project includes `overview`, `features`, `stack`, and `skillsDeveloped`. These are editorial notes grounded in documented project functionality. Review or refine them to reflect your individual contributions, especially team projects.
- Repositories without authored notes show GitHub descriptions and primary language; they explicitly state that full stack and personal learning notes are unavailable.
- `src/styles/tokens.css`: theme colors and typography. `global.css` handles page layout; `projects.css` handles the scene, blocks, list, and dialog.
- `public/images/divinoalricafort.png`: existing portrait. `index.html`: page title and description.
- Add a real email address in the data file to enable the existing email draft/copy controls. Otherwise contact links point to LinkedIn and GitHub.

## Browser checks

```sh
npx playwright install chromium
npm test
```

If Chrome or Edge is already installed, use it instead of downloading Chromium:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome' # or 'msedge'
npm test
```

Tests mock GitHub and cover multi-page discovery, cache preservation on failure, empty results, disabled storage, details and focus, drag-versus-click, stacking, reduced motion, responsive bounds, and collection updates during interaction. Test output is ignored by Git.

## Content sources

The five authored projects retain the repository links and documented technologies from the original portfolio: UsTogether, MaScan, Taglish Grammar Correction, 3D Image Projection, and Lexical Analyzer Visualizer. [The CSPC report](https://ccs.cspc.edu.ph/2025/08/20/day2aideas2025hackathon/) supports the education and Team INFRA achievement entries. WorldSkills and Philippine Startup Challenge details were supplied by Divino. Certificate records preserve the supplied titles, issuers, dates, and completion statuses.
