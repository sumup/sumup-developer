<div align="center">

# SumUp Developer Portal 👩‍💻

[![Documentation][docs-badge]](https://developer.sumup.com)
[![CI Status](https://github.com/sumup/sumup-developer/actions/workflows/ci.yaml/badge.svg?branch=main)](https://github.com/sumup/sumup-developer/actions/workflows/ci.yaml)
[![License](https://img.shields.io/github/license/sumup/sumup-developer)](./LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-v2.1%20adopted-ff69b4.svg)](https://github.com/sumup/sumup-developer/tree/main/CODE_OF_CONDUCT.md)

The SumUp Developer Portal documents the integrations, SDKs, and public APIs that external developers use to build payment-acceptance solutions. The site is built with [Astro](https://astro.build/) and [Nimbus](https://nimbus-docs.com/). Documentation pages are written in Markdown and MDX, while the visible theme uses plain CSS and SumUp's Circuit UI design tokens.

</div>

## Local Development

### Prerequisites

- Node.js 24.x, as specified in `.nvmrc` and `package.json`
- npm 12.x

Using a Node version manager such as [nvm](https://github.com/nvm-sh/nvm) makes it easier to use the version required by the repository.

### Set up the Project

Clone the repository:

```bash
git clone git@github.com:sumup/sumup-developer.git
cd sumup-developer
```

If you use nvm, install and select the configured Node.js version:

```bash
nvm install
nvm use
```

Install the locked dependencies:

```bash
npm ci
```

No environment variables are required to install, build, or browse the documentation locally. Deployment-only integrations, such as analytics, require secrets that are not stored in the repository.

### Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in a browser. Most content and component changes appear without restarting the server.

## Validate Changes

Run the checks that match your change before opening a pull request:

| Command                 | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `npm run check`         | Validate Astro, TypeScript, and content schemas         |
| `npm run check:nimbus`  | Validate Nimbus configuration, adapters, and migrations |
| `npm run format:check`  | Check source and Markdown/MDX formatting                |
| `npm run lint`          | Lint application source                                 |
| `npm run lint:nimbus`   | Check MDX structure and links after building            |
| `npm run test`          | Run the Vitest test suite                               |
| `npm run build`         | Build and validate generated pages and agent outputs    |
| `npm run linkcheck`     | Build the site and validate internal links              |
| `npm run check:site`    | Validate an existing build with a shared HTML cache     |
| `npm run test:worker`   | Smoke-test the built Cloudflare Worker locally          |
| `npm run lint:spelling` | Check authored content with the typos CLI               |
| `npm run validate`      | Run checks, tests, a build, and Worker smoke tests      |

All authored website content under `src/content/` uses MDX, including changelog
and help entries. Repository documents such as this README and imported skills
remain Markdown.

Prettier handles source formatting, including Markdown tables and list spacing.
It preserves prose wrapping and leaves embedded code examples unchanged. Nimbus
checks heading structure, duplicate headings, code-block languages, shell prompt
prefixes, frontmatter, images, and internal links. `npm run linkcheck` also checks
rendered link targets and fragments, rejects empty links, and requires image alt
attributes; explicitly decorative images can use `alt=""`.

Every build runs the redirect, rendered-link, and agent-output checks through
`check:site`, sharing one parsed HTML cache. The individual check commands remain
available for focused diagnosis. Website source files must use `.mdx`; the build
rejects stray `.md` files under `src/content/`.

`test:worker` uses Wrangler's local workerd test harness against
`dist/server/wrangler.json`. It checks API HTML/Markdown, the public OpenAPI
redirect, missing API routes, and documentation MCP without deploying or calling
the payment API. Run `npm run build` first, or use `npm run validate` to build and
test together.

CI also runs the pinned `typos` spelling check. To run it locally, install the
[typos CLI](https://github.com/crate-ci/typos#install) and use
`npm run lint:spelling`. Keep exceptions in `_typos.toml` scoped to genuine
identifiers or localized terms; fix spelling errors in the content.

These checks replace the separate Markdown linter. Its Markdown-only editorial
restrictions, such as forbidding inline HTML in MDX or treating a bold paragraph
as a heading error, are not carried over. Keep new checks focused on formatting,
accessibility, and working documentation.

## API Specs

The OpenAPI definition used by the [API Reference](https://developer.sumup.com/api/) is managed in another repository and synchronized into `openapi.yaml`. Do not edit this file directly. If you find a mistake or have an improvement to suggest, [open an issue](https://github.com/sumup/sumup-developer/issues/new).

Nimbus serves the API reference at `/api/`, including operation and schema
pages, alternate Markdown, search, `/api/llms.txt`, documentation MCP access,
and citation coordinates at `/nimbus-api/coordinates.json`.

`src/lib/api/reference.ts` derives Nimbus's input from `openapi.json` and the
vendored SDK samples without changing either source. Established operation
URLs are recorded in `src/lib/api/operationPaths.json`. The projection adds
access requirements to agent Markdown and converts MDX callouts to CommonMark
blockquotes. Nimbus shares one operation/schema coordinate namespace, so it
aliases the colliding `ProcessCheckout` schema to `ProcessCheckoutSchema`
and updates its references in memory. `/openapi.json` publishes the original
contract, and `/api/openapi.json` permanently redirects to it. The postbuild
discovery script adds that original contract to Nimbus's API catalog while
preserving its HTML and Markdown documentation links.

The reference uses repository-owned Circuit components under
`src/components/ApiDocs/`, adapted from the portal's original renderer. Nimbus
owns the prepared API model, routes, highlighted examples, Markdown, MCP, and
citation coordinates; our components own the HTML, styles, and presentation.
API pages use the same `DocsLayout`, navigation, search, mobile menu, theme,
and page actions as the guides. No separate API theme or Tailwind setup is needed.

The renderer uses Nimbus's headless disclosure and tab controllers for nested
properties, expand/collapse all, field deep links, and keyboard navigation.
Unions show their variants and discriminator mappings. Request samples support
all vendored SDKs and generated cURL, remember the chosen language, and accept
`?lang=<sample-id>` links. Inactive samples start hidden; a small inline script
restores the selected language before paint. With JavaScript disabled, native
property disclosures still work and the default request/response examples remain
visible. The page's Markdown version includes every SDK and response example.

Treat these components as application source, not registry-installed copies.
Nimbus dependency upgrades update the data/runtime layer. Review new upstream UI
features selectively and adapt those useful to integrators; do not reinstall
`api-layout` over the portal renderer. Run `npm run validate` and check the
rendered API when changing the model integration or interactions.

Old resource URLs redirect to Nimbus's `/api/tags/` pages. The small
`LegacyLinks.astro` adapter resolves operation and object fragments from the
old combined pages to their new pages, since fragments never reach the server.
SDK and authorization links redirect to their existing guides; error guidance
lives at `/tools/errors/`. Validate with `npm run validate` and a local Worker.

[docs-badge]: https://img.shields.io/badge/SumUp-documentation-white.svg?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgY29sb3I9IndoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgPHBhdGggZD0iTTIyLjI5IDBIMS43Qy43NyAwIDAgLjc3IDAgMS43MVYyMi4zYzAgLjkzLjc3IDEuNyAxLjcxIDEuN0gyMi4zYy45NCAwIDEuNzEtLjc3IDEuNzEtMS43MVYxLjdDMjQgLjc3IDIzLjIzIDAgMjIuMjkgMFptLTcuMjIgMTguMDdhNS42MiA1LjYyIDAgMCAxLTcuNjguMjQuMzYuMzYgMCAwIDEtLjAxLS40OWw3LjQ0LTcuNDRhLjM1LjM1IDAgMCAxIC40OSAwIDUuNiA1LjYgMCAwIDEtLjI0IDcuNjlabTEuNTUtMTEuOS03LjQ0IDcuNDVhLjM1LjM1IDAgMCAxLS41IDAgNS42MSA1LjYxIDAgMCAxIDcuOS03Ljk2bC4wMy4wM2MuMTMuMTMuMTQuMzUuMDEuNDlaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+

## Documentation for agents

Nimbus publishes `/llms.txt`, section indexes, `/llms-full.txt`, and an
`index.md` alternate for each guide and API reference page. The index also links to `/openapi.json`,
which publishes the synchronized API contract without modifying it.

Keep reference tables in Markdown. `SearchableTable.astro` adds browser filtering
without hiding the source data from agents or requiring JavaScript to read it.
Project components that generate content use `src/lib/markdownComponents.ts`;
shared data drives both their HTML and Markdown representations.
Every component used in docs must have a renderer or an explicit preservation
policy in that module. Agent validation checks component coverage and compares
rendered code blocks, including generated examples, with both Markdown outputs.
Bump a renderer's revision when its output logic changes; generated renderers
should include their source data in the revision to invalidate cached output.

`npm run check:agent-docs` checks the built output against every authored code
example and verifies the full bundle, canonical URLs, and API contract. It runs
as part of `npm run validate`. Nimbus owns Markdown conversion, sitemap dates,
and skill archive generation. The postbuild
discovery step adds our OpenAPI and MCP routes to Nimbus's generated catalogs.
Nimbus owns discovery-file CORS and content types. Keep owner header rules
disjoint from those generated rules: Cloudflare combines overlapping values.
Agent validation rejects duplicated CORS/content types in the built output.

`npm run check:redirects` validates every explicit redirect destination and
fragment, including rules unused by current pages, and rejects duplicate sources,
loops, and static rules after dynamic rules. It runs in `npm run linkcheck`.
Remove redirects for retired endpoints without a documented replacement instead
of pointing them at an unrelated API operation.

The documentation MCP server at `https://developer.sumup.com/mcp` exposes
`list_pages` and `get_page` without authentication. Nimbus serves it and its
`/mcp/server-card` route through the Worker while guide pages remain prerendered.
The SumUp account-tools server at `https://mcp.sumup.com/mcp` remains separate
and uses OAuth. Validate documentation MCP changes against the built Worker:
check `tools/list`, then call both tools and verify the returned Markdown.

The Cloud API checkout walkthrough uses Nimbus's headless React `Diagram` and
`usePhase` helpers with SumUp styles. Its shared step data also produces the
Markdown version; keep the two representations aligned when adding diagrams.
Use `client:visible` and keep the explanation readable before hydration.

Skills are imported verbatim from the commit in `agent-skills.source.json`.
Run `npm run sync:agent-skills` to reproduce them, or add
`-- --source /path/to/sumup-skills` to use an existing Git checkout offline.
The command reads the pinned Git tree and ignores uncommitted source edits.
To publish an upstream change, review and update the pinned revision, sync, and
commit the lock and imported `skills/` files together. Builds need no source
checkout or network access: Nimbus packages the checked-in sources into
deterministic archives and publishes their discovery index and SHA-256 digests.

Security overrides: Mermaid's KaTeX is pinned to 0.19.0 until Mermaid's supported
dependency range includes a patched release. Validate Mermaid diagrams when
updating that override.

## Updating Nimbus

Run `npm run check:nimbus` before accepting dependency upgrades. In particular,
stay within Nimbus's supported Astro adapter range even when a newer adapter
builds successfully. Run `nimbus-docs migrate` and complete its reviews, then
use `nimbus-docs outdated --json` to inspect upstream changes.

Keep the ownership boundary explicit during upgrades:

| Layer       | Responsibility                                                                                                                                               |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Nimbus      | Documentation/API models, metadata, Markdown and agent publishing, and headless client helpers                                                               |
| Portal      | Astro layouts and routes, Circuit presentation, and browser interactions                                                                                     |
| Integration | SumUp API adaptations in `src/lib/api/reference.ts`, component-to-Markdown mappings in `src/lib/markdownComponents.ts`, and compatibility/discovery adapters |

Adopt upstream features for a concrete portal requirement. Registry and starter
visual changes are optional; keep the shared Circuit rendering. Validate API
URLs, SDK samples, citation anchors, Markdown/full-bundle content, and discovery
outputs with `npm run validate`. This also compares tag descriptions in the API
overview with their dedicated pages, including Markdown structure and links.
For affected UI, check desktop/mobile and both themes. The Worker smoke tests exercise documentation MCP on every validation run.
For changes to MCP behavior, also check the affected tools and responses.

This portal adopted Nimbus through a custom migration. Its original scaffold
version is unknown, so `nimbus.json` keeps `version: null`. The recorded
`templates-v0.8.0` tag is an explicit comparison baseline reviewed against Nimbus
0.19, rather than a claim that the portal was scaffolded from that release.
The guide layouts, fonts, styles, homepage, and navigation keep the SumUp
design. The API reference uses the same shell and Circuit tokens. Optional
starter features are adopted individually.

Registry entries in `nimbus.json` record reviewed upstream hashes and the paths
of our customized copies. Most live under `src/components/nimbus/`, rather than
the registry's `src/components/ui/<slug>/` directories. Compare the corresponding
registry item before updating these files; do not install a second copy at its
default path or overwrite our styles. Steps stays at the registry's normal path
and follows its ordered-list semantics. Custom diagrams use the framework's
headless hooks directly and are owned by this repository.

After merging upstream behavior, update the relevant reviewed baseline and run
`npm run validate`. A baseline update means the upstream changes were reviewed;
it does not mean our customized files should match the starter byte for byte.
