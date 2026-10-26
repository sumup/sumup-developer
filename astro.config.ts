import { markdownComponents } from "./src/lib/markdownComponents";
import { apiReference } from "./src/lib/api/reference";

import cloudflare from "@astrojs/cloudflare";
import externalLinks from "./src/plugins/satteri/external-links";
import tableScroll from "./src/plugins/satteri/table-scroll";
import react from "@astrojs/react";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";

const { PUBLIC_ONETRUST_DOMAIN_ID, PUBLIC_GA_TAG_ID } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  "",
);

const head = defineNimbusConfig({
  site: "https://developer.sumup.com",
  title: "SumUp Developer",
  description:
    "Developer documentation, guides, and APIs for building with SumUp.",
  locale: "en-US",
  homeLabel: "Home",
  github: "https://github.com/sumup/sumup-developer",
  editPattern: "https://github.com/sumup/sumup-developer/edit/main/{path}",
  socialImage: "/og/index.png",
  socialImageAlt: "SumUp Developer documentation preview",
  agents: { mcp: true },
  api: [
    {
      collection: "api",
      label: "SumUp API",
      spec: apiReference.spec,
      requireOperationId: true,
      schemaPages: true,
      routes: {
        convention: "resource-action-v2",
        operations: apiReference.operations,
      },
      samples: { generate: ["curl"], keepGenerated: ["curl"] },
      extensions: ["x-beta"],
      // Keep /openapi.json as the authoritative, unmodified public contract.
      publishSpec: false,
    },
  ],
  sidebar: {
    defaultCollapsed: true,
    items: [
      { label: "Get started", link: "/get-started/" },
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
  session: false,
  adapter: cloudflare({
    imageService: "compile",
    prerenderEnvironment: "node",
  }),
  markdown: {
    syntaxHighlight: { type: "shiki" },
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false,
    },
  },
  experimental: {
    contentIntellisense: true,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  vite: {
    resolve: {
      dedupe: ["react", "react-dom"],
      noExternal: ["@sumup-oss/circuit-ui", "@sumup-oss/illustrations"],
    },
  },
  integrations: [
    react(),
    nimbus(head, {
      mdx: { optimize: true },
      markdown: {
        componentMap: await markdownComponents(),
        hastPlugins: [externalLinks, tableScroll],
      },
      sitemap: {
        // Custom tag archives set noindex outside Nimbus's content collections.
        serialize: (item) =>
          new URL(item.url).pathname.startsWith("/changelog/tags/")
            ? undefined
            : item,
      },
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/image-ref": "error",
        "nimbus/internal-link": "error",
        "nimbus/no-self-host-url": "error",
        "nimbus/single-h1": "error",
        "nimbus/heading-hierarchy": "error",
        "nimbus/duplicate-heading-text": "error",
        "nimbus/code-block-lang": "error",
        "nimbus/code-block-prompt-prefix": "error",
      },
    }),
  ],
  server: {
    port: 3000,
  },
});
