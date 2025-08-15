import cloudflare from "@astrojs/cloudflare";
import markdoc from "@astrojs/markdoc";
import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import starlightLinksValidator from "starlight-links-validator";
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
      customCss: ["@sumup-oss/circuit-ui/styles.css", "./src/base.css"],
      pagination: false,
      lastUpdated: true,
    }),
  ],
  server: {
    port: 3000,
  },
  redirects: {
    "/docs/category/introduction-1": "/terminal-payments/introduction",
    "/docs/:path*": "/:path*",
    "/docs/category/tools-1": "/terminal-payments/tools",
    "/docs/getting-started": "/online-payments/",
    "/docs/online-payments/introduction/getting-started": "/online-payments/",
    "/docs/category/guides": "/online-payments/guides",
    "/docs/online-payments/guides/single-payment":
      "/online-payments/guides/single-payment",
    "/docs/category/alternative-payment-methods": "/online-payments/apm",
    "/online-payments/apm/introduction": "/online-payments/apm",
    "/docs/online-payments/alternative-payment-methods": "/online-payments/apm",
    "/docs/online-payments/alternative-payment-methods/apm-integration":
      "/online-payments/apm/integration-guide",
    "/docs/online-payments/alternative-payment-methods/apple-pay-integration":
      "/online-payments/apm/apple-pay",
    "/docs/online-payments/alternative-payment-methods/google-pay-integration":
      "/online-payments/apm/google-pay",
    "/docs/category/features": "/online-payments/features",
    "/docs/online-payments/features/open-banking":
      "/docs/online-payments/open-banking",
    "/docs/online-payments/features/3ds": "/online-payments/3ds",
    "/docs/category/tools": "/online-payments/tools",
    "/docs/online-payments/tools/card-widget":
      "/online-payments/tools/card-widget",
    "/docs/php-sdk": "/online-payments/tools/php-sdk",
    "/docs/online-payments/tools/php-sdk": "/online-payments/tools/php-sdk",
    "/docs/online-payments/tools/swift-checkout":
      "/online-payments/tools/swift-checkout",
    "/docs/category/plugins": "/online-payments/plugins",
    "/docs/online-payments/plugins/woocommerce":
      "/online-payments/plugins/woocommerce",
    "/docs/sumup-prestashop-plugin": "/online-payments/plugins/prestashop",
    "/docs/online-payments/plugins/prestashop":
      "/online-payments/plugins/prestashop",
    "/docs/online-payments/plugins/wix": "/online-payments/plugins/wix",
    "/docs/terminal-overview": "/terminal-payments/introduction/overview",
    "/docs/terminal-getting-started":
      "/terminal-payments/introduction/getting-started",
    "/docs/integration-retail": "/terminal-payments/industry/retail",
    "/docs/integration-hospitality": "/terminal-payments/industry/hospitality",
    "/docs/integration-transport": "/terminal-payments/industry/transport",
    "/docs/integration-bookings": "/terminal-payments/industry/bookings",
    "/docs/integration-enterprise": "/terminal-payments/industry/enterprise",
    "/docs/terminal-sdk": "/terminal-payments/tools/sdk",
    "/docs/terminal-api": "/terminal-payments/tools/api",
    "/docs/single-payment": "/online-payments/guides/single-payment",
    "/docs/refund": "/online-payments/guides/refund",
    "/docs/recurring-payments": "/online-payments/guides/recurring-payments",
    "/docs/apm": "/online-payments/apm",
    "/docs/online-payments/apm-integration": "/online-payments/apm",
    "/docs/online-payments/apple-pay-integration":
      "/online-payments/apm/apple-pay",
    "/docs/online-payments/google-pay-integration":
      "/online-payments/apm/google-pay",
    "/docs/api/sum-up-rest-api": "/api",
    "/docs/api/authorization": "/api/authorization",
    "/docs/api/checkouts": "/api/checkouts",
    "/docs/api/customers": "/api/customers",
    "/docs/api/transactions": "/api/transactions",
    "/docs/api/payouts": "/api/payouts",
    "/docs/api/receipts": "/api/receipts",
    "/docs/api/merchant": "/api/merchant",
    "/docs/api/subaccounts": "/api/subaccounts",
    "/docs/api/api-keys": "/api/api-keys",
    "/docs/api/authorize": "/api/authorization/create-token",
    "/docs/api/create-token": "/api/authorization/create-token",
    "/docs/api/list-checkouts": "/api/checkouts/list",
    "/docs/api/create-checkout": "/api/checkouts/create",
    "docs/api/deactivate-checkout": "/api/checkouts/deactivate",
    "docs/api/get-checkout": "/api/checkouts/get",
    "docs/api/process-checkout": "/api/checkouts/process",
    "/docs/api/create-customer": "/api/customers/create",
    "/docs/api/get-customer": "/api/customers/get",
    "/docs/api/update-customer": "/api/customers/update",
    "/docs/api/list-payment-instruments":
      "/api/customers/list-payment-instruments",
    "/docs/api/deactivate-payment-instrument":
      "/api/customers/deactivate-payment-instrument",
    "/docs/api/get-account": "/api/subaccounts",
    "/docs/api/list-sub-accounts": "/api/subaccounts/list",
    "/docs/api/create-sub-account": "/api/subaccounts/create-sub-account",
    "/docs/api/deactivate-sub-account": "/api/subaccounts/deactivate",
    "/docs/api/update-sub-account": "/api/subaccounts/update",
    "/docs/api/list-payouts": "/api/payouts/list",
    "/docs/api/list-financial-transactions": "/api/transactions/list",
    "/docs/api/get-merchant-profile": "/api/merchant/get",
    "/docs/api/list-bank-accounts": "/api/merchant/list-bank-accounts",
    "/docs/api/get-doing-business-as": "/api/merchant/get-doing-business-as",
    "/docs/api/get-settings": "/api/merchant/get-settings",
    "/docs/api/get-personal-profile": "/api/merchant/get-personal-profile",
    "/docs/api/refund-transaction": "/api/transactions/refund",
    "/docs/api/get-transaction": "/api/transactions/get",
    "/docs/api/list-transactions": "/api/transactions/list-detailed",
    "/docs/api/list-api-keys": "/api/api-keys/list-api-keys",
    "/docs/api/create-api-key": "/api/api-keys/create-api-key",
    "/docs/api/revoke-api-key": "/api/api-keys/revoke-api-key",
    "/docs/api/get-api-key": "/api/api-keys/get-api-key",
    "/docs/api/update-api-key": "/api/api-keys/update-api-key",
    "/docs/api/get-payment-methods":
      "/api/checkouts/list-available-payment-methods",
    "/docs/api/get-receipt": "/api/receipts/get",
    "/docs/api/request-authorization-from-users":
      "/api/authorization/authorize",
    "/docs/api/generate-a-token": "/api/authorization/create-token",
    "/docs/api/create-a-checkout": "/api/checkouts/create",
    "/docs/api/deactivate-a-checkout": "/api/deactivate-checkout",
    "/docs/api/retrieve-a-checkout": "/api/get-checkout",
    "/docs/api/process-a-checkout": "/api/checkouts/process",
    "/docs/api/create-a-customer": "/api/customers/create",
    "/docs/api/retrieve-a-customer": "/api/customers/get",
    "/docs/api/update-a-customer": "/api/customers/update",
    "/docs/api/create-a-payment-instrument":
      "/api/customers/create-payment-instrument",
    "/docs/api/deactivate-a-payment-instrument":
      "/api/customers/deactivate-payment-instrument",
    "/docs/api/retrieve-an-account": "/api/subaccounts",
    "/docs/api/list-subaccounts": "/api/subaccounts/list",
    "/docs/api/create-a-subaccount": "/api/subaccounts/create-sub-account",
    "/docs/api/deactivate-a-subaccount": "/api/subaccounts/deactivate",
    "/docs/api/update-a-subaccount": "/api/subaccounts/update",
    "/docs/api/retrieve-a-merchant-profile":
      "/api/merchant/get-merchant-profile",
    "/docs/api/retrieve-dba": "/api/merchant/get-doing-business-as",
    "/docs/api/list-settings": "/api/merchant/get-settings",
    "/docs/api/retrieve-a-personal-profile":
      "/api/merchant/get-personal-profile",
    "/docs/api/refund-a-transaction": "/api/transactions/refund",
    "/docs/api/retrieve-a-transaction": "/api/transactions/get",
    "/docs/api/get-available-payment-methods":
      "/api/checkouts/list-available-payment-methods",
    "/docs/api/retrieve-receipt-details": "/api/receipts/get",
    "/api/get-doing-business-as": "/api/merchant/retrieve-dba",
    "/docs/sumup-woocommerce-plugin": "/online-payments/plugins/woocommerce",
    "/rest-api": "/api",
    "/docs/register-app": "/online-payments/register-app",
    "/docs/authorization": "/tools/api/authorization/",
    "/online-payments/introduction/get-started/": "/online-payments/",
    "/online-payments/introduction/3ds": "/online-payments/3ds/",
    "/online-payments/introduction/authorization": "/tools/api/authorization/",
    "/online-payments/introduction/register-app":
      "/online-payments/register-app/",
    "/online-payments/introduction/response-handling":
      "/online-payments/response-handling/",
    "/online-payments/introduction/webhooks": "/online-payments/webhooks/",
    "/online-payments/tools/hosted-checkout":
      "/online-payments/hosted-checkout/",
    "/online-payments/tools/react-native-sdk": "/tools/sdks/react-native-sdk/",
    "/terminal-payments/introduction/": "/terminal-payments/",
    "/terminal-payments/introduction/getting-started":
      "/terminal-payments/getting-started/",
    "/terminal-payments/industry": "/terminal-payments/getting-started/",
    "/terminal-payments/tools/cloud-api": "/tools/sdks/cloud-api/",
    "/affiliate-keys": "/tools/api/affiliate-keys/",
    "/api-keys": "/tools/api/authorization/",
    "/apps": "/tools/api/authorization/",
    "/extdev": "/quickstart",
    "/webhook-docs/:path*": "/webhooks/:path*",
    "/webhook-docs/introduction/:path*": "/webhooks/:path*",
    "/webhooks/create": "/webhooks/",
  },
});
