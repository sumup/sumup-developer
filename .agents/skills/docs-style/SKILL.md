---
name: docs-style
description: Apply the SumUp Developer Portal style guide when writing, editing, or reviewing guide pages, including prose, terminology, structure, accessibility, and code-sample presentation. Excludes the API reference and changelog.
---

# Developer Portal docs style

Read the [style guide](references/style-guide.md) before writing, editing, or reviewing guide pages. It contains the rule IDs, terminology, examples, and open forum decisions from the v0.1 draft.

Use this skill alongside the [contributing skill](../contributing/SKILL.md), which covers repository conventions, source verification, components, and validation.

## Apply the guide

- Apply the rules relevant to the page and requested change. The S1 skeleton applies to task guides; use the appropriate content type for overview and concept pages.
- Preserve the guide's draft status. Treat open forum decisions as unresolved; flag relevant ambiguities rather than presenting a proposed term as ratified policy.
- Follow repository instructions and confirmed implementation, schemas, SDK signatures, and current product labels when they conflict with the draft. Preserve API identifiers, published URLs, and exact UI labels. Report material discrepancies with the guide.
- Keep the author's meaning and avoid adding unsupported technical claims. Verify accuracy flags F1–F4 against available sources; raise questions for anything still unclear.
- During a style review, preserve code inside fenced blocks. Flag comments, placeholder values, fence languages, and missing language variants against C1–C6. Technical corrections require source verification and the scope of the requested task.
- When asked to edit, apply the authorized changes and validate them through AGENTS.md. A style finding or unresolved forum decision does not require asking again for permission to complete the requested work.

## Report a style review

For an explicit style review, check every applicable rule in the reference without inventing additional rules. Quote the exact offending text and suggest a rewrite for each issue. Include file locations. Keep the report brief, without praise or a page summary.

Return:

1. **Verdict:** Ready / Minor fixes / Needs rework
2. **Issues table:** Rule ID | Location | Quoted text | Suggested fix
3. **Structure check:** Applicable S1 sections that are present or missing
4. **Questions for the author:** Remaining technical ambiguities or relevant open forum decisions

For implementation or broader technical reviews, use the requested response format and distinguish style findings from confirmed technical defects.
