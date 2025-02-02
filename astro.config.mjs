import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercel from "@astrojs/vercel";
import starlightLinksValidator from "starlight-links-validator";

import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: vercel(),
  site: "https://developer.sumup.com",

  experimental: {
    contentIntellisense: true,
  },

  integrations: [
    markdoc({ allowHTML: true }),
    react(),
    starlight({
      plugins: [starlightLinksValidator()],
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
        // NOTE: not rolled out yet
        // {
        //   label: "webhook-docs",
        //   autogenerate: { directory: "webhook-docs" },
        // },
        // TODO: convert to similar page to FAQ
        // {
        //   label: "problem",
        //   autogenerate: { directory: "problem" },
        // },
      ],
      head: [],
      components: {
        Footer: "./src/overrides/Footer.astro",
        Head: "./src/overrides/Head.astro",
        Hero: "./src/overrides/Hero.astro",
        MarkdownContent: "./src/overrides/MarkdownContent.astro",
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
      customCss: [
        "@sumup-oss/circuit-ui/experimental/styles.css",
        "./src/base.css",
        "./src/title.css",
      ],
      pagination: false,
      lastUpdated: true,
    }),
  ],
  server: {
    port: 3000,
  },
});
