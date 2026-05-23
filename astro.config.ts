import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import starlightImageZoom from "starlight-image-zoom";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import mermaid from "astro-mermaid";
import starlightLlmsTxt from "starlight-llms-txt";
import { loadEnv } from "vite";
import rehypeExternalLinks from "./src/plugins/rehype/external-links";

import { defineConfig } from "astro/config";
import type { HeadUserConfig } from "node_modules/@astrojs/starlight/schemas/head";

const { PUBLIC_ONETRUST_DOMAIN_ID, PUBLIC_GA_TAG_ID } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  "",
);

const faviconBaseURL = "https://static.sumup.com";

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
        href: new URL(
          "/favicons/apple-touch-icon.png",
          faviconBaseURL,
        ).toString(),
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/svg+xml",
        href: new URL("/favicons/favicon.svg", faviconBaseURL).toString(),
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: new URL("/favicons/favicon-32x32.png", faviconBaseURL).toString(),
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: new URL("/favicons/favicon-16x16.png", faviconBaseURL).toString(),
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "manifest",
        href: new URL("/favicons/site.webmanifest", faviconBaseURL).toString(),
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "mask-icon",
        href: new URL(
          "/favicons/safari-pinned-tab.svg",
          faviconBaseURL,
        ).toString(),
        color: "#ffffff",
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "shortcut icon",
        href: new URL("/favicons/favicon.ico", faviconBaseURL).toString(),
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
        content: new URL(
          "/favicons/browserconfig.xml",
          faviconBaseURL,
        ).toString(),
      },
    },
    {
      tag: "meta",
      attrs: {
        name: "theme-color",
        content: "#000000",
        media: "(prefers-color-scheme: dark)",
      },
    },
    { tag: "meta", attrs: { name: "theme-color", content: "#fbfbf9" } },
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
    {
      tag: "meta",
      attrs: {
        name: "google-site-verification",
        content: "0mA7KPaajXK9CtZgu7A9lLDHeTEZ_SiHdmXz2vDej7Y",
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
  adapter: cloudflare({ imageService: "compile" }),
  site: "https://developer.sumup.com",
  markdown: {
    rehypePlugins: [rehypeExternalLinks],
    remarkRehype: {
      // Use text-presentation symbol (U+21A9 + U+FE0E), not emoji.
      footnoteBackContent: "\u21A9\uFE0E",
    },
  },

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
                exclude: [
                  // API reference pages are generated through a dynamic route and
                  // don't map to static Starlight doc entries.
                  "/api/**",
                  // Custom Astro page outside docs content collection.
                  "/contact",
                  // Custom help hub with dynamic sections rendered from Astro pages.
                  "/help",
                  "/help/**",
                  // Changelog routes are generated by src/pages/changelog/[...tag].astro.
                  "/changelog",
                  "/changelog/**",
                ],
                errorOnInvalidHashes: true,
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
      favicon: new URL("/favicons/favicon.svg", faviconBaseURL).toString(),
      disable404Route: true,
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
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
        EditLink: "./src/overrides/EditLink.astro",
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
          href: "https://github.com/sumup/sumup-developer",
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
