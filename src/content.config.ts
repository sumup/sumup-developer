import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { openapiDescriptionsLoader } from "./loaders/openapiDescriptions";

const help = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/help" }),
  schema: z.object({
    title: z.string(),
  }),
});

const changelog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/changelog" }),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    publishedDate: z.date(),
  }),
});

const apiDescriptions = defineCollection({
  loader: openapiDescriptionsLoader(),
  schema: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("tag"),
      name: z.string(),
    }),
    z.object({
      kind: z.literal("operation"),
      name: z.string(),
      method: z.string(),
      path: z.string(),
    }),
  ]),
});

export const collections = {
  docs: defineCollection({
    schema: docsSchema({
      extend: z.object({
        icon: z.string().optional(),
        links: z
          .array(
            z.object({
              title: z.string(),
              href: z.string(),
            }),
          )
          .optional(),
      }),
    }),
    loader: docsLoader(),
  }),
  help,
  changelog,
  apiDescriptions,
};
