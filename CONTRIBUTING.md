# Contributing

SumUp Developer portal is built with [Nimbus](https://nimbus-docs.com/), a documentation framework for [Astro](https://astro.build/). The repository owns its visible components and plain CSS, using SumUp's [Circuit UI](https://github.com/sumup-oss/circuit-ui) design system wherever possible. Tailwind is not used.

## Codeblocks

Code blocks are highlighted by Nimbus's Shiki pipeline. Site-wide docs behavior is configured in `astro.config.ts`; visible layouts and styles live in `src/layouts/`, `src/components/nimbus/`, and `src/styles/`.
