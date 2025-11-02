# Repository Guidelines

## Project Structure & Organization

The portal uses Astro with the Starlight theme. Application source sits in `src/`, with `pages/` for route entry points, `content/` for MDX docs, `components/` for reusable UI (React, Astro, and Circuit UI), and `utils/`/`lib/` for shared logic. Assets live in `src/assets` and `public/`. Build outputs go to `dist/`. Configuration resides in `astro.config.ts`, `ec.config.mjs`, and `wrangler.jsonc`; adjust them when adding new content types or deployment targets. API documentation is based on `openapi.yaml`, this file is synchronized from outside this repository, do not edit it.

## Content

Content (`content/`) of the developer portal uses United States English spelling and grammar. The articles shall be clear and concise and refer to external documentation for established standards and RFCs. We don't use emojis.

## Build, Test, and Development Commands

- `npm run dev` — watch mode with Hot Module Reloading; use when authoring docs or components.
- `npm run build` — production Astro build targeting Cloudflare; ensure it succeeds before merging.
- `npm run check` — runs `astro check` for type and content schema validation after `astro sync`.
- `npm run lint` — ESLint across Astro/TSX files; required before pushing structural changes.
- `npm run format` — Prettier write for source and content; run after bulk edits.
- `npm run linkcheck` — builds with `CHECK_LINKS=true` to surface broken internal/external links.

## Coding Style & Naming Conventions

Prettier (project defaults) handles whitespace, so commit formatted files rather than manual styling. Stick to TypeScript where possible; Astro islands may embed React components. Name components and directories in PascalCase (`src/components/LogoSlider`), utility modules in camelCase (`src/utils/formats.ts`), and content files in kebab-case (`src/content/docs/payments-overview.mdx`). Favor SumUp design tokens and Circuit UI primitives; extend `src/base.css` sparingly.

## Docs Frontmatter Requirements

For files in `src/content/docs/`, include frontmatter at the top of every page.

- Required: `title`
- Strongly recommended: `description` (used in previews and search snippets)
- Add `sidebar.order` when page ordering should be explicit (instead of folder/default ordering)
- Add `sidebar.label` when navigation text should differ from the page title
- If a page uses custom page actions in this repo, keep `links` entries shaped as `{ title, href }`

## Linking Rules

- For internal docs links, use root-absolute paths (for example `/online-payments/checkouts/`), not relative paths (for example `./checkouts`).
- Do not include `.md` or `.mdx` in internal URLs.
- Link text must describe the target; avoid vague text such as “here” or “this page”.

## Code Block Rules

- Always specify a language on fenced code blocks (for example `bash`, `json`, `ts`).
- Do not include `$` command prompts in shell snippets; keep blocks copy-paste ready.

## Testing Guidelines

CI relies on `npm run check`. When editing MDX content, preview via `npm run dev` to verify navigation, sidebar ordering, and snippet rendering. There is no Jest-style test suite; document any manual verification steps in the pull request if behavior changes or APIs are added.

## Markdown Linting Guidelines

- Prefer fixing markdown issues in content first instead of adding linter exceptions.
- Run `npm run lint:markdown` and `npm run build` after markdown-heavy changes to catch MDX parsing regressions early.
- `rumdl` can produce impractical suggestions for complex MDX (for example mixed Tabs/Steps/components); in such cases, adding scoped ignores in `.rumdl.toml` is acceptable.
- Every new ignore must be narrowly scoped (per-file/per-rule) and include a short comment explaining why it is needed.

## Validation Matrix

Run at least the following commands before submitting changes:

- Content-only updates: `npm run check` and `npm run build`
- Source code changes (`.ts`, `.tsx`, `.astro`, config, or runtime logic): `npm run check`, `npm run lint`, and `npm run test`
- Link, routing, or navigation structure updates: `npm run linkcheck`

## Common Failure Checklist

Before opening a PR, double-check these frequent breakpoints:

- MDX uses a component but the import is missing.
- A fenced code block is missing a language or uses an invalid language tag.
- A local image reference points to a file that does not exist.
- Heading levels jump (for example `##` directly to `####`) and hurt page structure.
- Frontmatter fields use the wrong type or shape for this repo’s content schema.

## Commit & Pull Request Guidelines

Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `build:`) with concise summaries (`fix: disable edit link`). Group related content updates into a single commit when possible. Pull requests should include context, linked issues, and, for UI/documentation changes, before/after screenshots or preview URLs.
