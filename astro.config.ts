import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import starlightImageZoom from "starlight-image-zoom";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import mermaid from "astro-mermaid";
import starlightLlmsTxt from "starlight-llms-txt";
import { loadEnv } from "vite";

import { defineConfig } from "astro/config";
import type { HeadUserConfig } from "node_modules/@astrojs/starlight/schemas/head";

const { PUBLIC_ONETRUST_DOMAIN_ID, PUBLIC_GA_TAG_ID } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  "",
);

const head = (): HeadUserConfig => {
  const head: HeadUserConfig = [
    {
      tag: "link",
      attrs: {
        rel: "preload",
        href: "https://static.sumup.com/fonts/Inter/Inter-normal-latin.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: true,
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "https://static.sumup.com/favicons/apple-touch-icon.png",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "https://static.sumup.com/favicons/favicon-32x32.png",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "https://static.sumup.com/favicons/favicon-16x16.png",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "manifest",
        href: "https://static.sumup.com/favicons/site.webmanifest",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "mask-icon",
        href: "https://static.sumup.com/favicons/safari-pinned-tab.svg",
        color: "#ffffff",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "shortcut icon",
        href: "https://static.sumup.com/favicons/favicon.ico",
      },
    },
    {
      tag: "meta",
      attrs: {
        name: "msapplication-TileColor",
        content: "#171d24",
        media: "(prefers-color-scheme: dark)",
      },
    },
    {
      tag: "meta",
      attrs: { name: "msapplication-TileColor", content: "#fff" },
    },
    {
      tag: "meta",
      attrs: {
        name: "msapplication-config",
        content: "https://static.sumup.com/favicons/browserconfig.xml",
      },
    },
    {
      tag: "meta",
      attrs: {
        name: "theme-color",
        content: "#171d24",
        media: "(prefers-color-scheme: dark)",
      },
    },
    { tag: "meta", attrs: { name: "theme-color", content: "#fff" } },
    {
      tag: "script",
      attrs: {
        src: "https://static.sumup.com/legacy-browsers/check-support.js",
        defer: true,
      },
      content: "",
    },
    {
      tag: "link",
      attrs: {
        rel: "alternate",
        type: "application/rss+xml",
        title: "SumUp Developer Changelog RSS",
        href: "/changelog/rss.xml",
      },
    },
  ];

  if (PUBLIC_ONETRUST_DOMAIN_ID) {
    head.push({
      tag: "script",
      attrs: {
        defer: true,
        charset: "UTF-8",
        src: "https://cdn-ukwest.onetrust.com/scripttemplates/otSDKStub.js",
        "data-domain-script": PUBLIC_ONETRUST_DOMAIN_ID,
      },
    });
  }

  if (PUBLIC_GA_TAG_ID) {
    head.push({
      tag: "script",
      attrs: {
        src: `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_TAG_ID}`,
      },
    });
    head.push({
      tag: "script",
      content: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${PUBLIC_GA_TAG_ID}');
      `,
    });
  }

  return head;
};

export default defineConfig({
  adapter: cloudflare(),
  site: "https://developer.sumup.com",

  experimental: {
    contentIntellisense: true,
  },

  integrations: [
    react(),
    mermaid({
      autoTheme: true,
    }),
    starlight({
      plugins: [
        ...(process.env.CHECK_LINKS || false
          ? [
              starlightLinksValidator({
                components: [["Anchor", "url"]],
                exclude: ["/api/**", "/contact"],
                errorOnInvalidHashes: false,
              }),
            ]
          : []),
        starlightLlmsTxt({
          // We use MDX with components extensively which starlightLlmsTxt doesn't
          // handle well otherwise
          rawContent: true,
        }),
        starlightImageZoom(),
      ],
      title: "SumUp Developer",
      favicon: "favicon.png",
      disable404Route: true,
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 2,
      },
      sidebar: [
        {
          label: "Get Started",
          items: [
            {
              label: "Home",
              link: "/",
            },
          ],
        },
        {
          label: "In-person Payments",
          autogenerate: { directory: "terminal-payments", collapsed: true },
        },
        {
          label: "Online Payments",
          autogenerate: { directory: "online-payments", collapsed: true },
        },
        {
          label: "Developer Resources",
          autogenerate: { directory: "tools", collapsed: true },
        },
        {
          label: "Resources",
          autogenerate: { directory: "resources", collapsed: true },
        },
      ],
      head: head(),
      components: {
        Footer: "./src/overrides/Footer.astro",
        TableOfContents: "./src/overrides/TableOfContents.astro",
        Head: "./src/overrides/Head.astro",
        MobileMenuToggle: "./src/overrides/MobileMenuToggle.astro",
        Hero: "./src/overrides/Hero.astro",
        MarkdownContent: "./src/overrides/MarkdownContent.astro",
        Sidebar: "./src/overrides/Sidebar.astro",
        SiteTitle: "./src/overrides/SiteTitle.astro",
        SocialIcons: "./src/overrides/SocialIcons.astro",
        PageFrame: "./src/overrides/PageFrame.astro",
        PageTitle: "./src/overrides/PageTitle.astro",
        MobileTableOfContents: "./src/overrides/MobileTableOfContents.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/sumup/documentation",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/sumup/sumup-developer/edit/main/",
      },
      customCss: [
        "@sumup-oss/circuit-ui/styles.css",
        "./src/styles/theme-dark.css",
        "./src/styles/theme-light.css",
        "./src/styles/starlight-vars.css",
        "./src/styles/utilities.css",
      ],
      pagination: false,
      lastUpdated: true,
    }),
  ],
  server: {
    port: 3000,
  },
});
