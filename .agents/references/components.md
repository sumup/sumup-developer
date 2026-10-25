# MDX components for SumUp Developer

Use this reference when a content task needs components. The implementations and [global registration](../../src/components.ts) are the source of truth; inspect their current props before adding new usage. Nimbus recipe component names are suggestions to adapt to this portal.

## Globally available components

These components are registered in `src/components.ts` and need no import in an MDX page:

| Content                       | Component and supported inputs                                                                                                        | Implementation                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| A multi-step procedure        | `Steps` containing `Step` elements with an optional `title`, or a Markdown ordered list. `Steps` accepts an optional numeric `start`. | [Steps](../../src/components/ui/steps/Steps.astro), [Step](../../src/components/ui/steps/Step.astro) |
| Language or platform variants | `Tabs` with an optional `syncKey`, containing `TabItem` elements with a required `label`. Keep the recommended variant first.         | [Tabs](../../src/components/nimbus/Tabs.astro), [TabItem](../../src/components/nimbus/TabItem.astro) |
| A note or warning             | `Aside` with optional `title` and `type`: `note`, `tip`, `caution`, or `danger`.                                                      | [Aside](../../src/components/nimbus/Aside.astro)                                                     |
| A short status label          | `Badge` with required `text` and optional `variant`: `default`, `tip`, `caution`, or `danger`.                                        | [Badge](../../src/components/nimbus/Badge.astro)                                                     |
| A call to action              | `Button` with required `label`, and Circuit UI button props such as `href`. Use ordinary Markdown links for links within prose.       | [Button](../../src/components/Button.tsx)                                                            |

For example, a procedure can use:

```mdx
<Steps>
  <Step title="Create the checkout">
    Describe the verified request and its expected result.
  </Step>
  <Step title="Verify the payment">
    Describe how the integration checks the final payment status.
  </Step>
</Steps>
```

Use plain fenced blocks for code and output, and Markdown tables for comparable fields or values. Use tabs when the reader's language or platform determines the variant. Keep essential prerequisites, warnings, and expected results visible.

## Page-specific components

Import components that are not globally registered after the page's frontmatter. Use aliases from [tsconfig.json](../../tsconfig.json), such as `@components/` and `@lib/`; inspect sibling pages for existing usage.

For example, the repository-owned `Callout` is imported directly:

```mdx
import Callout from "@components/content/Callout";

<Callout type="note" title="Before you begin">
  State the prerequisite the reader needs for this task.
</Callout>
```

[Callout](../../src/components/content/Callout.tsx) supports `note`, `tip`, `caution`, `success`, and `promo`. Its props differ from `Aside`. Check other page-specific components in `src/components/content/` and `src/components/Diagrams/` before introducing a new wrapper.

Keep content work within the existing component set where possible. Adding a missing upstream registry component is a presentation change, not a requirement of following a recipe.

## Markdown and browser behavior

The portal also publishes documentation as Markdown. Check [the component mappings](../../src/lib/markdownComponents.ts) when adding or changing a component: essential prose, links, examples, and results must survive conversion. Steps and tabs preserve their authored children; interactive diagrams use shared data to provide a textual sequence.

After website content changes, use the validation matrix in [AGENTS.md](../../AGENTS.md). Preview changed tab, step, or interactive behavior in the browser when relevant. Browser rendering and a successful build do not prove that an API example works against the payment service.
