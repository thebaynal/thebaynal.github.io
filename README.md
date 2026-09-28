# Divino Al Ricafort — Portfolio

A responsive React portfolio featuring Divino’s cybersecurity journey, AI work, and software projects. Built with Vite and plain CSS for GitHub Pages or Vercel.

## Structure

```text
public/             Portrait and favicon
src/components/     Sections and shared controls
src/data/portfolio.js  Editable portfolio content
src/styles/         Color tokens, layouts, and motion
.github/workflows/  GitHub Pages deployment
```

The portrait-led hero uses a copper and charcoal palette drawn from the local photo. A compact technology index moves horizontally, the project cards use custom diagrams, and the About section includes a small interactive project-detail button. Motion respects the visitor’s reduced-motion setting.

## Featured projects

- [UsTogether](https://github.com/thebaynal/UsTogether) — An interactive memory timeline built with React and Express.
- [MaScan](https://github.com/thebaynal/QR-Attendance-Checker) — A team-built QR attendance checker using Python, Flet, and SQLite.
- [Taglish Grammar Correction](https://github.com/thebaynal/taglish_grammar_correction) — A collaborative language AI project for Filipino-English text.
- [3D Image Projection](https://github.com/thebaynal/3D-Image-Projection-Using-Linear-Algebra) — An interactive Python visualizer for 3D transformations and projection.
- [Lexical Analyzer Visualizer](https://github.com/thebaynal/LexicalAnalyzerVisualizer) — A React and Flex dashboard for exploring lexical analysis of C code.

The project cards link directly to these repositories. Edit their content in `src/data/portfolio.js`.

## Requirements

- Node.js 22.12 or newer
- npm

## Run locally

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To check the production version locally:

```sh
npm run build
npm run preview
```

## Personalize the portfolio

1. Edit `src/data/portfolio.js` to refine the biography, social profiles, projects, skills, education, experience, achievements, and certifications.
2. The hero uses `public/images/divinoalricafort.png`. To change it, replace that image or update the path in `src/components/sections/Hero.jsx`. Use a portrait crop with the subject centered.
3. Add project demo and repository links when you have them. Cards without links do not display inactive buttons.
4. Adjust colors and typography in `src/styles/tokens.css`; layout and responsive rules are in `src/styles/global.css`.
5. Change the page title and description in `index.html`.

The stack immediately after the hero reflects tools used in the linked repositories. PyTorch, Transformers, and PEFT appear in the [Taglish project dependency file](https://github.com/thebaynal/taglish_grammar_correction/blob/main/taglish_gec_project/requirements.txt). The horizontal movement is defined in `src/styles/skills.css`.

The contact section currently points visitors to LinkedIn. Add a real address to the `email` value in `portfolio.js` to show the email copy button and form. The form opens the visitor’s email application with its fields prefilled; it does not send messages through a server.

## Profile sources

- The [CSPC College of Computer Studies report](https://ccs.cspc.edu.ph/2025/08/20/day2aideas2025hackathon/) confirms Divino Al Ricafort’s BS Computer Science studies, Team INFRA membership, and the team’s third-place finish at AI.DEAS for Impact 2025.
- The featured repositories are linked above. Their READMEs document the features and technologies shown on the site.
- The [Taglish model dependencies](https://github.com/thebaynal/taglish_grammar_correction/blob/main/taglish_gec_project/requirements.txt) document PyTorch, Transformers, and PEFT used in the model workflow.
- The WorldSkills Philippines and Philippine Startup Challenge entries come from Divino’s own details provided for this portfolio.
- The four completed course certificates and issue dates were transcribed from Divino’s LinkedIn screenshot. The overall Google Cybersecurity Certificate and Cisco Ethical Hacking are marked in progress based on Divino’s own updates.

## Deploy to GitHub Pages

1. Push this project to the configured [`thebaynal/thebaynal.github.io`](https://github.com/thebaynal/thebaynal.github.io) repository on its `main` branch.
2. In the repository, open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source.
3. The workflow in `.github/workflows/deploy.yml` builds the site on each push to `main` and publishes the `dist` folder. The Vite config uses relative asset paths so the site works from a repository subpath.
4. The user site will be available at [thebaynal.github.io](https://thebaynal.github.io/) after the first successful deployment.

## Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. Select the Vite framework preset. The default build command is `npm run build` and the output directory is `dist`.
3. Deploy. Vercel will rebuild when you push changes to the connected branch.

## Security and maintenance

- The app uses React, React DOM, Vite, and the official Vite React plugin. There are no form-processing services, UI libraries, analytics scripts, or remote font requests.
- Commit `package-lock.json` and use `npm ci` for repeatable installs.
- Review dependency advisories periodically with `npm audit`. Update dependencies deliberately, review the lockfile diff, then rebuild before publishing.
- External profile and project links open with `noopener noreferrer`.
