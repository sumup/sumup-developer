import { defineCollection, z } from "astro:content";
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";

const help = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
  }),
});

const changelog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()),
    publishedDate: z.date(),
  }),
});

const problem = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
  }),
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
  problem,
};
