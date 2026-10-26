# Repository Guidelines

## Project Structure & Organization

The portal uses Astro with Nimbus. Application source sits in `src/`, with `pages/` for route entry points, `content/` for MDX docs, `layouts/` and `components/` for repository-owned UI (React, Astro, and Circuit UI), and `utils/`/`lib/` for shared logic. Assets live in `src/assets` and `public/`. Build outputs go to `dist/`. Configuration resides in `astro.config.ts`, `nimbus.json`, and `wrangler.jsonc`; adjust them when adding new content types or deployment targets. API documentation is based on `openapi.yaml`, this file is synchronized from outside this repository, do not edit it.

Use Node.js 24.x and the npm version pinned in `package.json`. Install locked dependencies with `npm ci`. The primary branch is `main`.

## Working Scope

- Preserve unrelated tracked, staged, and untracked work. Format and stage only files belonging to the task.
- Establish technical claims from implementation, schemas, tests, SDKs, or current public documentation. Keep public content focused on external integrator behavior and keep credentials and private information out of examples.
- Complete requested edits without asking for confirmation again. Commit, push, publish, or send external review comments only when the user requests those actions.

## Build, Test, and Development Commands

- `npm run dev` — watch mode with Hot Module Reloading; use when authoring docs or components.
- `npm run build` — production Astro build targeting Cloudflare, followed by the shared built-site checks; ensure it succeeds before merging.
- `npm run check` — runs `astro check` for Astro, TypeScript, and content schema validation.
- `npm run lint` — runs ESLint for application source; required before pushing structural changes.
- `npm run format` — formats source, styles, data, and Markdown/MDX with Prettier.
- `npm run lint:nimbus` — checks MDX structure, frontmatter, images, and links; run after building.
- `npm run linkcheck` — builds, runs Nimbus's internal-link checks, and validates rendered API links.
- `npm run test:worker` — runs local workerd smoke tests against an existing build.
- `npm run lint:spelling` — checks content with the typos CLI; CI installs the pinned checker.
- `npm run validate` — runs source checks, tests, the production build, and Worker smoke tests.

## Coding Style & Naming Conventions

Prettier (project defaults) handles whitespace, so commit formatted files rather than manual styling. Stick to TypeScript where possible; Astro islands may embed React components. Name components and directories in PascalCase (`src/components/LogoSlider`), utility modules in camelCase (`src/utils/formats.ts`), and content files in kebab-case (`src/content/docs/payments-overview.mdx`). Favor SumUp design tokens and Circuit UI primitives; extend `src/styles/portal.css` and `src/styles/prose.css` sparingly. The API reference uses repository-owned Circuit components under `src/components/ApiDocs/`, consuming Nimbus’s prepared API model. Keep API parsing and example generation in Nimbus; use shared portal styles and headless client helpers for rendering.

## Nimbus Ownership

- Use Nimbus for documentation and API models, metadata, Markdown/agent publishing, and shared headless helpers. Use its public exports.
- Own the presentation in this repository: Astro layouts, Circuit components, styles, and browser interactions. Review registry UI changes selectively instead of replacing the portal's theme.
- Keep SumUp-specific API adaptations in `src/lib/api/reference.ts` and component-to-Markdown mappings in `src/lib/markdownComponents.ts`. Consume prepared models in the renderer; leave schema resolution and example generation to Nimbus.
- Review framework upgrades against the published output contract with `npm run validate`. Check affected browser interactions and documentation MCP calls separately when those integrations change.

## Agent Guidance and Content Authoring

Repository-local agent skills live in `.agents/skills/`. Read the [contributing skill](.agents/skills/contributing/SKILL.md) first when writing, editing, or reviewing website content, including examples, changelog entries, and navigation changes. Read only the references relevant to the task:

| Reference                                             | Use                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [Content style](.agents/references/content-style.md)  | Select a content type, apply SumUp conventions, and review prose and procedures.                 |
| [MDX components](.agents/references/components.md)    | Choose supported components and check their imports, props, and Markdown output.                 |
| [Nimbus recipes](.agents/references/nimbus/README.md) | Read the selected page skeleton and checklist; review source provenance or refresh the snapshot. |

These references work offline. Repository instructions, schemas, and component implementations take precedence over generic recipe examples. The recipes' confirmation prompts do not require asking again for edits the user has already requested.

The root `skills/` directory contains imported SumUp integration skills published for this website's consumers. It is separate from `.agents/skills/`, which guides work on this repository. Update root `skills/` through `agent-skills.source.json` and `npm run sync:agent-skills`; do not hand-edit imported files. Keep Nimbus recipes unchanged and put SumUp adaptations in the repository-owned references.

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
- When moving or renaming published pages, update navigation and incoming links, and preserve old routes in `public/_redirects`. Keep static redirect rules before dynamic rules. Preserve linked heading fragments when changing headings.

These URL rules apply to website content. Repository and agent reference documents use relative file links with their actual extensions.

## MDX and Components

- Start body headings at H2; frontmatter supplies the page's H1. Keep heading levels sequential.
- Use inline code or escapes for literal braces and angle brackets that MDX could interpret as JavaScript or JSX.
- `src/components.ts` registers global MDX components; those need no page-level import. Import other components after frontmatter using this repository's aliases. Check [the component reference](.agents/references/components.md) before copying upstream syntax.
- Keep important instructions and expected results accessible in Markdown output as well as the rendered page. Check `src/lib/markdownComponents.ts` when adding or changing authored components.

## Code Block Rules

- Always specify a language on fenced code blocks (for example `bash`, `json`, `ts`).
- Do not include `$` command prompts in shell snippets; keep blocks copy-paste ready.

## Testing Guidelines

CI runs `npm run validate`. When editing MDX content, preview via `npm run dev` to verify navigation, sidebar ordering, and snippet rendering. The repository has a focused Vitest suite for runtime helpers and built-Worker smoke tests using Wrangler’s test harness; document any additional manual verification steps in the pull request when UI behavior changes.

## Content Validation

- Prettier owns Markdown/MDX formatting. Preserve prose wrapping and keep embedded code formatting disabled so examples retain their authored contents.
- Nimbus owns source structure checks: heading hierarchy, duplicate headings, fenced code languages, and shell prompt prefixes, alongside frontmatter and link checks.
- CI checks authored content with `typos`. Keep localized-term exceptions scoped in `_typos.toml`; fix real spelling errors.
- Fix website content issues rather than adding exclusions. Use the validation matrix below after changes. Vendored upstream references keep their original bytes and are intentionally excluded from formatting.
- Rendered-site validation checks link targets/fragments, empty link destinations, and image alt attributes across all pages. Use `alt=""` explicitly for decorative images.

## Validation Matrix

Run the checks that match the change:

| Change                                                          | Checks                                                                                                         |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Website content, links, routing, or navigation                  | `npm run format:check`, `npm run check`, and `npm run linkcheck`                                               |
| Source code (`.ts`, `.tsx`, `.astro`, config, or runtime logic) | `npm run check`, `npm run lint`, and `npm run test`; add `npm run linkcheck` when rendered output changes      |
| Repository or agent instructions and references only            | Check formatting and local file links; validate changed skills with the skill-creator validator when available |
| Nimbus/framework upgrades or changes to the publishing contract | `npm run validate`; separately check affected browser interactions and documentation MCP calls                 |

`npm run linkcheck` runs the production build, its built-site checks, and Nimbus lint. Do not run a separate build first for the same changes. `npm run test:worker` needs an existing build. This repository's CI runs the full build as part of `npm run validate`; use the same checks in CI rather than Cloudflare Docs' reduced CI instructions.

## Common Failure Checklist

Before opening a PR, double-check these frequent breakpoints:

- MDX uses a component that is neither globally registered nor imported.
- A fenced code block is missing a language or uses an invalid language tag.
- A local image reference points to a file that does not exist.
- Heading levels jump (for example `##` directly to `####`) and hurt page structure.
- Frontmatter fields use the wrong type or shape for this repo’s content schema.

## Commit & Pull Request Guidelines

Follow Conventional Commits (`feat:`, `fix:`, `chore:`, `build:`) with concise summaries (`fix: disable edit link`). Group related content updates into a single commit when possible. Pull requests should include context, linked issues, and, for UI/documentation changes, before/after screenshots or preview URLs.
