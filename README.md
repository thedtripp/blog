# Blog

Public personal blog, built with [Astro](https://astro.build) (Astro's official blog starter
template as the base). Previously Jekyll + Chirpy; rewritten for full design control. Deployed via
GitHub Pages at [thedtripp.github.io/blog](https://thedtripp.github.io/blog).

## TODO

- [ ] Replace placeholder site title/description in `src/consts.ts`.
- [ ] Remove the template's sample posts in `src/content/blog/` once real content exists
      (`markdown-style-guide.md` is worth keeping longer as a formatting reference).
- [ ] Custom visual design/theming -- currently unstyled-default Astro starter look.

## Commands

All commands are run from the repo root:

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`      | Install dependencies                          |
| `npm run dev`       | Start local dev server at `localhost:4321`    |
| `npm run build`     | Build production site to `./dist/`            |
| `npm run preview`   | Preview the build locally before deploying    |

## Structure

- `src/content/blog/` -- posts (Markdown/MDX)
- `src/pages/` -- routes
- `src/components/`, `src/layouts/` -- shared UI
- `.github/workflows/deploy.yml` -- builds and deploys to GitHub Pages on push to `main`
