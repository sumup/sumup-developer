# Repository Guidelines

## Project Structure & Organization

The portal uses Astro with the Starlight theme. Application source sits in `src/`, with `pages/` for route entry points, `content/` for MDX docs, `components/` for reusable UI (React, Astro, and Circuit UI), and `utils/`/`lib/` for shared logic. Assets live in `src/assets` and `public/`. Build outputs go to `dist/`. Configuration resides in `astro.config.ts`, `ec.config.mjs`, and `wrangler.jsonc`; adjust them when adding new content types or deployment targets. API documentation is based on `openapi.yaml`, this file is synchronized from outside this repository, do not edit it.

## Build, Test, and Development Commands

- `npm run dev` — watch mode with Hot Module Reloading; use when authoring docs or components.
- `npm run build` — production Astro build targeting Cloudflare; ensure it succeeds before merging.
- `npm run check` — runs `astro check` for type and content schema validation after `astro sync`.
- `npm run lint` — ESLint across Astro/TSX files; required before pushing structural changes.
- `npm run format` — Prettier write for source and content; run after bulk edits.
- `npm run linkcheck` — builds with `CHECK_LINKS=true` to surface broken internal/external links.

## Coding Style & Naming Conventions

Prettier (project defaults) handles whitespace, so commit formatted files rather than manual styling. Stick to TypeScript where possible; Astro islands may embed React components. Name components and directories in PascalCase (`src/components/LogoSlider`), utility modules in camelCase (`src/utils/formats.ts`), and content files in kebab-case (`src/content/docs/payments-overview.mdx`). Favor SumUp design tokens and Circuit UI primitives; extend `src/base.css` sparingly.

## Testing Guidelines

CI relies on `npm run check`. When editing MDX content, preview via `npm run dev` to verify navigation, sidebar ordering, and snippet rendering. There is no Jest-style test suite; document any manual verification steps in the pull request if behavior changes or APIs are added.

## Commit & Pull Request Guidelines

Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `build:`) with concise summaries (`fix: disable edit link`). Group related content updates into a single commit when possible. Pull requests should include context, linked issues, and, for UI/documentation changes, before/after screenshots or preview URLs.
