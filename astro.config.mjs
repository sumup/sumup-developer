import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercel from "@astrojs/vercel";
import starWarp from "@inox-tools/star-warp";
import sentry from "@sentry/astro";

import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: vercel({
    functionPerRoute: false,
    imageService: true,
    includeFiles: ["./openapi.json"],
  }),
  output: "static",
  site: "https://developer.sumup.com",
  experimental: {
    contentIntellisense: true,
  },
  integrations: [
    markdoc({ allowHTML: true }),
    react(),
    starlight({
      title: "SumUp Developer",
      favicon: "favicon.png",
      disable404Route: true,
      sidebar: [
        {
          label: "online-payments",
          autogenerate: { directory: "online-payments" },
        },
        {
          label: "terminal-payments",
          autogenerate: { directory: "terminal-payments" },
        },
        {
          label: "webhook-docs",
          autogenerate: { directory: "webhook-docs" },
        },
        {
          label: "problem",
          autogenerate: { directory: "problem" },
        },
      ],
      head: [],
      components: {
        Footer: "./src/overrides/Footer.astro",
        Head: "./src/overrides/Head.astro",
        Hero: "./src/overrides/Hero.astro",
        MarkdownContent: "./src/overrides/MarkdownContent.astro",
        PageTitle: "./src/overrides/PageTitle.astro",
        Sidebar: "./src/overrides/Sidebar.astro",
        SiteTitle: "./src/overrides/SiteTitle.astro",
        SocialIcons: "./src/overrides/SocialIcons.astro",
      },
      social: {
        github: "https://github.com/sumup/documentation",
      },
      editLink: {
        baseUrl: "https://github.com/sumup/documentation/edit/main/",
      },
      customCss: ["./src/base.css", "./src/title.css"],
      pagination: false,
      plugins: [starWarp()],
      lastUpdated: true,
    }),
    sentry({
      dsn: "https://e80c25d560ea3c1fe570e77e34ac3694@o153781.ingest.us.sentry.io/4507975713685504",
      sourceMapsUploadOptions: {
        project: "developer-portal",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    }),
  ],
  server: {
    port: 3000,
  },
  scopedStyleStrategy: "class",
});
