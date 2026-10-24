# Repository Guidelines

## Project Structure & Organization

The portal uses Astro with Nimbus. Application source sits in `src/`, with `pages/` for route entry points, `content/` for MDX docs, `layouts/` and `components/` for repository-owned UI (React, Astro, and Circuit UI), and `utils/`/`lib/` for shared logic. Assets live in `src/assets` and `public/`. Build outputs go to `dist/`. Configuration resides in `astro.config.ts`, `nimbus.json`, and `wrangler.jsonc`; adjust them when adding new content types or deployment targets. API documentation is based on `openapi.yaml`, this file is synchronized from outside this repository, do not edit it.

## Build, Test, and Development Commands

- `npm run dev` — watch mode with Hot Module Reloading; use when authoring docs or components.
- `npm run build` — production Astro build targeting Cloudflare; ensure it succeeds before merging.
- `npm run check` — runs `astro check` for Astro, TypeScript, and content schema validation.
- `npm run lint` — runs ESLint for application source; required before pushing structural changes.
- `npm run format` — formats source, styles, data, and Markdown/MDX with Prettier.
- `npm run lint:nimbus` — checks MDX structure, frontmatter, images, and links; run after building.
- `npm run linkcheck` — builds, runs Nimbus's internal-link checks, and validates rendered API links.
- `npm run validate` — runs the complete CI validation sequence.

## Coding Style & Naming Conventions

Prettier (project defaults) handles whitespace, so commit formatted files rather than manual styling. Stick to TypeScript where possible; Astro islands may embed React components. Name components and directories in PascalCase (`src/components/LogoSlider`), utility modules in camelCase (`src/utils/formats.ts`), and content files in kebab-case (`src/content/docs/payments-overview.mdx`). Favor SumUp design tokens and Circuit UI primitives; extend `src/styles/portal.css` and `src/styles/prose.css` sparingly. The API reference uses repository-owned Circuit components under `src/components/ApiDocs/`, consuming Nimbus’s prepared API model. Keep API parsing and example generation in Nimbus; use shared portal styles and headless client helpers for rendering.

## Nimbus Ownership

- Use Nimbus for documentation and API models, metadata, Markdown/agent publishing, and shared headless helpers. Use its public exports.
- Own the presentation in this repository: Astro layouts, Circuit components, styles, and browser interactions. Review registry UI changes selectively instead of replacing the portal's theme.
- Keep SumUp-specific API adaptations in `src/lib/api/reference.ts` and component-to-Markdown mappings in `src/lib/markdownComponents.ts`. Consume prepared models in the renderer; leave schema resolution and example generation to Nimbus.
- Review framework upgrades against the published output contract with `npm run validate`. Check affected browser interactions and documentation MCP calls separately when those integrations change.

## Docs Frontmatter Requirements

Use `.mdx` for all authored website content, including changelog and help entries. Keep repository documentation and imported skills in Markdown.

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

CI runs `npm run validate`. When editing MDX content, preview via `npm run dev` to verify navigation, sidebar ordering, and snippet rendering. The repository has a focused Vitest suite for runtime helpers; document any additional manual verification steps in the pull request when UI behavior changes.

## Content Validation

- Prettier owns Markdown/MDX formatting. Preserve prose wrapping and keep embedded code formatting disabled so examples retain their authored contents.
- Nimbus owns source structure checks: heading hierarchy, duplicate headings, fenced code languages, and shell prompt prefixes, alongside frontmatter and link checks.
- Fix content issues rather than adding exclusions. Run `npm run format:check` and `npm run linkcheck` after content changes.
- Rendered-site validation checks link targets/fragments, empty link destinations, and image alt attributes across all pages. Use `alt=""` explicitly for decorative images.

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
