import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { satteri } from "@astrojs/markdown-satteri";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
import mermaid from "astro-mermaid";
import starlightLlmsTxt from "starlight-llms-txt";
import { loadEnv } from "vite";
import { readFile } from "node:fs/promises";
import satteriExternalLinks from "./src/plugins/satteri/external-links";
import satteriCallouts from "./src/plugins/satteri/callouts";

import { defineConfig } from "astro/config";
import type { HeadUserConfig } from "node_modules/@astrojs/starlight/schemas/head";
import type { Plugin } from "vite";

const { PUBLIC_ONETRUST_DOMAIN_ID, PUBLIC_GA_TAG_ID } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  "",
);

const faviconBaseURL = "https://static.sumup.com";

function rawFonts(extensions: string[]): Plugin {
  const pattern = new RegExp(
    `\\.(${extensions.map((extension) => extension.replace(/^\./, "")).join("|")})$`,
  );

  return {
    name: "raw-fonts",
    enforce: "pre",
    async load(id) {
      if (!pattern.test(id)) {
        return null;
      }

      const source = await readFile(id);
      const bytes = Array.from(source);
      return `export default new Uint8Array([${bytes.join(",")}]);`;
    },
  };
}

const head = (): HeadUserConfig => {
  const head: HeadUserConfig = [
    // font preload
    {
      tag: "link",
      attrs: {
        rel: "preload",
        href: "https://static.sumup.com/fonts/sumup/sumup-narrow-latin-s.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: true,
      },
    },
    // icons
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
        sizes: "96x96",
        type: "image/png",
        href: new URL("/favicons/favicon-96x96.png", faviconBaseURL).toString(),
      },
    },
    {
      tag: "link",
      attrs: {
        rel: "shortcut icon",
        href: new URL("favicons/favicon.ico", faviconBaseURL).toString(),
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
        rel: "manifest",
        href: new URL("/favicons/site.webmanifest", faviconBaseURL).toString(),
      },
    },
    // Theme
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
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  site: "https://developer.sumup.com",
  markdown: {
    processor: satteri({
      features: {
        directive: true,
        gfm: true,
        smartPunctuation: true,
      },
      mdastPlugins: [satteriCallouts],
      hastPlugins: [satteriExternalLinks],
    }),
  },

  experimental: {
    contentIntellisense: true,
  },

  vite: {
    plugins: [rawFonts([".woff2", ".woff", ".ttf", ".otf"])],
    assetsInclude: ["**/*.wasm"], // Treat WASM files as assets (but not font files used by OG)
    resolve: {
      noExternal: ["@sumup-oss/circuit-ui", "@sumup-oss/illustrations"],
    },
    ssr: {
      external: ["buffer", "path", "fs"].map((i) => `node:${i}`),
      noExternal: ["workers-og"],
    },
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
                  // don't map to static Starlight doc entries. Their rendered links
                  // are validated after the build by scripts/check-rendered-links.mjs.
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
          items: [
            {
              autogenerate: { directory: "terminal-payments", collapsed: true },
            },
          ],
        },
        {
          label: "Online Payments",
          items: [
            {
              autogenerate: { directory: "online-payments", collapsed: true },
            },
          ],
        },
        {
          label: "Developer Resources",
          items: [
            {
              autogenerate: { directory: "tools", collapsed: true },
            },
          ],
        },
        {
          label: "Resources",
          items: [
            {
              autogenerate: { directory: "resources", collapsed: true },
            },
          ],
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
        "./src/styles/callout.css",
      ],
      pagination: false,
      lastUpdated: true,
    }),
    mdx({
      optimize: true,
    }),
  ],
  server: {
    port: 3000,
  },
});
