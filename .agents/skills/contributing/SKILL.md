---
name: contributing
description: Write, edit, and review SumUp Developer website content, including documentation pages, code examples, changelog entries, and content navigation. Use for contributions to this repository's content; application and framework implementation follow AGENTS.md.
---

# Contributing to SumUp Developer

Use the repository's [AGENTS.md](../../../AGENTS.md) for scope and validation, and the [content style reference](../../references/content-style.md) for authoring. Read the references for the task below. Paths in this skill are relative to its directory; source paths mentioned in prose are relative to the repository root.

## Choose the guidance for the task

| Task                     | Read or inspect                                                                                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Write or edit a page     | Choose the matching Nimbus recipe from the [content style reference](../../references/content-style.md).                                                                         |
| Add a runnable example   | [Example recipe](../../references/nimbus/example.md), the relevant SDK or implementation, and existing examples in the same section.                                             |
| Add a changelog entry    | [Changelog recipe](../../references/nimbus/changelog.md), `src/content/changelog/`, and the changelog schema in `src/content.config.ts`.                                         |
| Choose components        | [Component reference](../../references/components.md), `src/components.ts`, and the relevant implementation.                                                                     |
| Move or organize content | Nearby folders, sidebar frontmatter, route configuration, and `public/_redirects`. Preserve existing incoming links when moving or renaming a published page.                    |
| Review content           | The matching recipe's checklist and the sources supporting the page's technical claims. Report actionable issues with file locations; distinguish confirmed bugs from questions. |

## Author or revise content

- Establish the reader's goal and the source of truth from the request, relevant documentation, implementation, API schema, or SDK. Resolve context from available sources; ask only when a missing fact blocks accurate content.
- Check for existing coverage before adding a page. Choose the location and page type by the reader's need. For small edits, keep the existing scope and apply only the relevant recipe guidance.
- Draft against the content style reference and selected recipe. Adapt generic metadata and fictional examples to this repository's schema and confirmed SumUp behavior. Keep upstream recipes unchanged. Their final confirmation prompts do not block edits the user has already requested.
- For code examples, check the current SDK signatures, prerequisites, commands, and expected results. Run the example when practical and authorized; report anything that could not be verified. A successful site build verifies rendering, not payment behavior.
- Review the result using the recipe's checklist. When asked only for a review, report findings; when asked to address them, make and verify the fixes.

## Validate and deliver

Use the validation matrix in [AGENTS.md](../../../AGENTS.md) and existing npm scripts. `npm run linkcheck` includes the production build and built-site checks, so run it once instead of building separately first. Instructions-only changes need formatting, local link checks, and skill validation. Preview affected interactive components and snippet rendering when relevant.

Keep the work within the requested scope and preserve unrelated changes. Report what changed, which checks ran, and any remaining verification limits. Follow the user's existing authorization for commits, pushes, and publication; this skill grants no additional authorization.
