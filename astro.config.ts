import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vercel from "@astrojs/vercel";
import starlightLinksValidator from "starlight-links-validator";
import starlightLlmsTxt from "starlight-llms-txt";

import { defineConfig } from "astro/config";
import type { HeadUserConfig } from "node_modules/@astrojs/starlight/schemas/head";

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
  ];

  if (import.meta.env.PUBLIC_ONETRUST_DOMAIN_ID) {
    head.push({
      tag: "script",
      attrs: {
        defer: true,
        charset: "UTF-8",
        src: "https://cdn-ukwest.onetrust.com/scripttemplates/otSDKStub.js",
        "data-domain-script": import.meta.env.PUBLIC_ONETRUST_DOMAIN_ID,
      },
    });
  }

  if (import.meta.env.PUBLIC_GA_TAG_ID) {
    head.push({
      tag: "script",
      attrs: {
        src: `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA_TAG_ID}`,
      },
    });
    head.push({
      tag: "script",
      content: `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${import.meta.env.PUBLIC_GA_TAG_ID}');
      `,
    });
  }

  return head;
};

export default defineConfig({
  adapter: vercel(),
  site: "https://sumup-developer.sumup-vercel.app",

  experimental: {
    contentIntellisense: true,
  },

  integrations: [
    markdoc({ allowHTML: true }),
    react(),
    starlight({
      plugins: [starlightLinksValidator(), starlightLlmsTxt()],
      title: "SumUp Developer",
      favicon: "favicon.png",
      disable404Route: true,
      sidebar: [
        {
          label: "Get started",
          items: [
            {
              label: "Overview",
              link: "/",
            },
            {
              label: "Quickstart",
              link: "/quickstart",
            },
          ],
        },
        {
          label: "Online payments",
          autogenerate: { directory: "online-payments", collapsed: true },
        },
        {
          label: "In-person payments",
          autogenerate: { directory: "terminal-payments", collapsed: true },
        },
        {
          label: "Developer tools",
          autogenerate: { directory: "tools", collapsed: true },
        },
        {
          label: "Plugins",
          autogenerate: { directory: "plugins" },
        },
        {
          label: "Open Banking",
          link: "/open-banking",
        },
      ],
      head: head(),
      components: {
        Footer: "./src/overrides/Footer.astro",
        Head: "./src/overrides/Head.astro",
        MobileMenuToggle: "./src/overrides/MobileMenuToggle.astro",
        Hero: "./src/overrides/Hero.astro",
        MarkdownContent: "./src/overrides/MarkdownContent.astro",
        Sidebar: "./src/overrides/Sidebar.astro",
        SiteTitle: "./src/overrides/SiteTitle.astro",
        SocialIcons: "./src/overrides/SocialIcons.astro",
        MobileTableOfContents: "./src/overrides/MobileTableOfContents.astro",
        PageFrame: "./src/overrides/PageFrame.astro",
        PageTitle: "./src/overrides/PageTitle.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/sumup/documentation",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/sumup/documentation/edit/main/",
      },
      customCss: [
        "@sumup-oss/circuit-ui/experimental/styles.css",
        "./src/base.css",
      ],
      pagination: false,
      lastUpdated: true,
    }),
  ],
  server: {
    port: 3000,
  },
});
