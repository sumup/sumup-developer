# Writing content for SumUp Developer

Before writing, editing, or reviewing website content, choose the reader's question in the table and read the matching Nimbus recipe. For a small edit, apply the relevant guidance without restructuring unrelated content. For a new page, choose its purpose before drafting.

| Reader's question                             | Recipe                                       |
| --------------------------------------------- | -------------------------------------------- |
| What is this, and where do I start?           | [Overview](nimbus/overview.md)               |
| How quickly can I see it work?                | [Quickstart](nimbus/quickstart.md)           |
| Teach me to build something real.             | [Tutorial](nimbus/tutorial.md)               |
| How do I complete this task?                  | [How-to](nimbus/how-to.md)                   |
| What is this, and why does it work this way?  | [Concept](nimbus/concept.md)                 |
| What are the exact fields, values, or limits? | [Reference](nimbus/reference.md)             |
| Show me working code.                         | [Example](nimbus/example.md)                 |
| Why am I seeing this error?                   | [Troubleshooting](nimbus/troubleshooting.md) |
| What changed, and does it affect me?          | [Changelog](nimbus/changelog.md)             |

The recipes provide page structures and self-review checklists. Their editorial thresholds are guidance, not additional build gates. Read only the recipes relevant to the task. The [Nimbus snapshot notes](nimbus/README.md) record the source, license, and update process; no network access is needed to use these references.

## Apply the recipes to this repository

Repository instructions and the implemented schema and components take precedence over generic recipe examples.

- Write plain English for external integrators. Lead with the reader's outcome or the confirmed behavior. Use active voice, sentence-case headings, descriptive links, and consistent SumUp terminology. Explain technical terms when needed.
- Verify product claims against implementation, API schemas, SDKs, tests, or current public documentation. The recipes use the fictional product Hookline; replace its commands, values, and behavior with verified SumUp examples. Ask for missing facts only when available sources cannot resolve them.
- Use `.mdx` for website content. Documentation belongs in `src/content/docs/`, changelog entries in `src/content/changelog/`, and help entries in `src/content/help/`. Match nearby file naming and sidebar conventions.
- Check `src/content.config.ts` and the installed Nimbus docs schema before adding frontmatter. Do not copy recipe metadata such as `type` or `lastVerified` automatically, or change the schema just to match a recipe. Changelog entries use `title`, `tags`, and `publishedDate`; adapt the changelog recipe to the existing per-entry collection and routes.
- Check `src/components.ts` and relevant sibling pages for supported MDX components and imports. Use the [component reference](components.md) to choose existing components or plain Markdown. A recipe's component suggestions do not require installing registry UI or changing the portal's Circuit presentation.
- Follow `AGENTS.md` for root-absolute website links, code blocks, and images. Keep Markdown reference files under `.agents/`, outside website content collections.
- API reference facts come from the synchronized `openapi.yaml` and Nimbus's prepared model. Do not edit that schema or generated output to satisfy a recipe.

## Write clear prose and procedures

- State the outcome or answer first. Address the reader as "you", use familiar words, and explain unfamiliar abbreviations on first use. Keep introductions and paragraphs focused; avoid marketing claims and filler.
- Write a description that names the feature and what the reader can do or understand. It must make sense on its own in search results. Use sentence-case headings that describe their sections.
- For procedures, put prerequisites before actions, start steps with verbs, and name UI elements rather than their position on the page. State the location before the action, such as "In **Settings**, select **Save**."
- Give one meaningful action per step and show the expected result when success is not obvious. Put warnings before destructive actions. Keep required steps and results visible; link to background explanations instead of interrupting the procedure.
- Use inline code for field names, commands, paths, and literal values. Use **bold** for UI labels. Keep terminology and example identifiers consistent across prose, code, and expected output.
- Use placeholders or environment variables for credentials and reserved domains such as `example.com` for fictional URLs. Verify actual SumUp API hosts and SDK calls against their sources.

## Editing and reviewing existing pages

Read the full page and relevant neighbors before changing it. Preserve its scope and voice unless restructuring is part of the request. When the user requests edits or fixes, make them directly; the upstream recipes' "Already have one?" confirmation prompts do not require asking again.

For reviews, prioritize incorrect product behavior, broken examples, invalid MDX, missing prerequisites, navigation regressions, and inaccessible content. Cite file locations and distinguish confirmed issues from assumptions. Suggest subjective wording changes without treating advisory recipe thresholds as correctness failures. Post external review comments only when requested.

## Review and validate

Use the selected recipe's checklist to review the changed content. Confirm that examples, expected results, links, and availability claims match the product. Only record a verification date when the corresponding verification actually ran.

Follow the validation matrix in [AGENTS.md](../../AGENTS.md) and the npm scripts in `package.json`, rather than copying upstream package-manager commands. `npm run linkcheck` includes the production build; do not run a separate build first for the same changes. Preview changed navigation, components, and snippet rendering with `npm run dev` when relevant. Report the checks performed and any limits on verifying runnable examples.
