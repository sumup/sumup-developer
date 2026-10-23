import { apiCollection, docsCollection } from "@cloudflare/nimbus-docs/content";
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const help = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/help" }),
  schema: z.object({
    title: z.string(),
  }),
});

const changelog = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/changelog",
  }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    publishedDate: z.date(),
  }),
});

export const collections = {
  api: defineCollection(apiCollection()),
  docs: defineCollection(
    docsCollection({
      schemaFields: {
        icon: z.string().optional(),
        id: z.string().optional(),
        nimbusDisableRules: z.array(z.string()).optional(),
        links: z
          .array(
            z.object({
              title: z.string(),
              href: z.string(),
            }),
          )
          .optional(),
      },
    }),
  ),
  // These collections are rendered by custom portal routes.
  _help: help,
  _changelog: changelog,
};
