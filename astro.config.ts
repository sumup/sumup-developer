import { readFile } from "node:fs/promises";

import cloudflare from "@astrojs/cloudflare";
import { unified } from "@astrojs/markdown-remark";
import react from "@astrojs/react";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import treelight from "@treelight/plugin-astro";
import mermaid from "astro-mermaid";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import type { Plugin } from "vite";

import externalLinks from "./src/plugins/markdown/external-links";
import tableScroll from "./src/plugins/markdown/table-scroll";
import {
  treelightHighlighter,
  treelightLanguageMap,
  treelightTheme,
} from "./src/lib/treelight";

const { PUBLIC_ONETRUST_DOMAIN_ID, PUBLIC_GA_TAG_ID } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  "",
);

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

const head = defineNimbusConfig({
  site: "https://developer.sumup.com",
  title: "SumUp Developer",
  description:
    "Developer documentation, guides, and APIs for building with SumUp.",
  locale: "en",
  homeLabel: "Home",
  github: "https://github.com/sumup/sumup-developer",
  editPattern: "https://github.com/sumup/sumup-developer/edit/main/{path}",
  socialImage: "/og/index.png",
  socialImageAlt: "SumUp Developer documentation preview",
  sidebar: {
    defaultCollapsed: true,
    items: [
      {
        label: "In-person Payments",
        segment: "terminal-payments",
        landing: "/terminal-payments/",
        items: [{ autogenerate: { directory: "terminal-payments" } }],
      },
      {
        label: "Online Payments",
        segment: "online-payments",
        landing: "/online-payments/",
        items: [{ autogenerate: { directory: "online-payments" } }],
      },
      {
        label: "Developer Resources",
        autogenerate: { directory: "tools" },
      },
      {
        label: "Resources",
        autogenerate: { directory: "resources" },
      },
    ],
  },
  head: [
    {
      tag: "link",
      attrs: {
        rel: "icon",
        type: "image/svg+xml",
        href: "https://static.sumup.com/favicons/favicon.svg",
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
      tag: "link",
      attrs: {
        rel: "preload",
        href: "https://static.sumup.com/fonts/sumup/sumup-narrow-latin-s.woff2",
        as: "font",
        type: "font/woff2",
        crossorigin: "anonymous",
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
        rel: "manifest",
        href: "https://static.sumup.com/favicons/site.webmanifest",
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
    {
      tag: "meta",
      attrs: { name: "theme-color", content: "#fbfbf9" },
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
    {
      tag: "meta",
      attrs: { name: "twitter:site", content: "@SumUp" },
    },
    ...(PUBLIC_ONETRUST_DOMAIN_ID
      ? [
          {
            tag: "script" as const,
            attrs: {
              defer: "",
              charset: "UTF-8",
              src: "https://cdn-ukwest.onetrust.com/scripttemplates/otSDKStub.js",
              "data-domain-script": PUBLIC_ONETRUST_DOMAIN_ID,
            },
          },
        ]
      : []),
    ...(PUBLIC_GA_TAG_ID
      ? [
          {
            tag: "script" as const,
            attrs: {
              src: `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA_TAG_ID}`,
            },
          },
          {
            tag: "script" as const,
            content: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${PUBLIC_GA_TAG_ID}');
            `,
          },
        ]
      : []),
  ],
});

export default defineConfig({
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  experimental: {
    contentIntellisense: true,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  vite: {
    environments: {
      // Treelight's grammar packages are native ESM with embedded WASM. Let
      // Vite load them directly instead of discovering and re-bundling them
      // during the first prerendered page request, which invalidates Astro's
      // active prerender bundle in development.
      prerender: {
        optimizeDeps: { noDiscovery: true },
      },
    },
    plugins: [rawFonts([".woff2", ".woff", ".ttf", ".otf"])],
  },
  integrations: [
    react(),
    nimbus(head, {
      icons: false,
      markdown: {
        // Unified avoids shipping Satteri's WASI binding in the Cloudflare
        // server bundle used by the contact form.
        processor: unified({
          gfm: true,
          smartypants: true,
          rehypePlugins: [externalLinks, tableScroll],
        }),
      },
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/image-ref": "error",
        "nimbus/internal-link": "error",
        "nimbus/no-self-host-url": "error",
      },
    }),
    mermaid({ autoTheme: true }),
    treelight({
      copyButton: true,
      highlighter: treelightHighlighter,
      languageMap: treelightLanguageMap,
      lineNumbers: true,
      theme: treelightTheme.id,
    }),
  ],
  server: {
    port: 3000,
  },
});
