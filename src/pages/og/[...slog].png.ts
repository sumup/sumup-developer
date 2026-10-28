import { getIndexedEntries } from "@cloudflare/nimbus-docs/runtime";
import { createElement } from "react";

import { readFile } from "node:fs/promises";
import { createOgImageResponse } from "../../utils/ogImageResponse";

interface Props {
  props: { title: string; description: string | null };
}

export const prerender = true;

// Cards for standalone pages; API and changelog pages reuse these fallbacks.
const staticPageMetadata = new Map<
  string,
  {
    title: string;
    description: string;
  }
>([
  [
    "index",
    {
      title: "SumUp Developer",
      description:
        "Developer documentation, guides, and APIs for building with SumUp.",
    },
  ],
  [
    "help",
    {
      title: "FAQ",
      description:
        "Frequently asked questions about SumUp developer products and integrations.",
    },
  ],
  [
    "changelog",
    {
      title: "Changelog",
      description:
        "Product and API updates across the SumUp developer platform.",
    },
  ],
]);

export async function getStaticPaths() {
  const metadata = new Map<string, Props["props"]>(staticPageMetadata);

  // Use the same public inventory and URLs as Nimbus's HTML and Markdown routes.
  for (const page of await getIndexedEntries()) {
    metadata.set(page.ogImageUrl.slice("/og/".length, -".png".length), {
      title: page.title,
      description: page.description ?? null,
    });
  }

  return [...metadata].map(([slog, props]) => ({ params: { slog }, props }));
}

// Prerendered in Node: read once and reuse the font buffers across cards.
const [sumUpBlack, sumUpNarrowMedium, sumUpNarrowRegular] = await Promise.all(
  [
    "sumup-black-latin-s.ttf",
    "sumup-narrow-latin-s-medium.ttf",
    "sumup-narrow-latin-s-regular.ttf",
  ].map((name) => readFile(`src/assets/fonts/${name}`)),
);
const blackFontFamily =
  "'SumUp Black', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const narrowFontFamily =
  "'SumUp Narrow', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

export async function GET({ props: { title, description } }: Props) {
  // API descriptions can contain full guides; cards use only the first paragraph.
  const summary = description?.trim().split(/\r?\n\s*\r?\n/, 1)[0];
  const card = createElement(
    "div",
    {
      style: {
        display: "flex",
        position: "relative",
        width: "1200px",
        height: "630px",
        backgroundColor: "#000000",
        boxSizing: "border-box",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: narrowFontFamily,
      },
    },
    createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: "60px",
        },
      },
      createElement(
        "div",
        {
          style: {
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          },
        },
        createElement(
          "div",
          {
            style: {
              display: "flex",
              fontSize: "42px",
              color: "#f0eee7",
              fontFamily: narrowFontFamily,
              fontWeight: 650,
              letterSpacing: "0.01em",
            },
          },
          "SumUp Developer",
        ),
        createElement(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: "48",
            height: "48",
            fill: "none",
            viewBox: "0 0 32 32",
            style: {
              display: "flex",
              color: "#f0eee7",
              flexShrink: 0,
            },
          },
          createElement("path", {
            fill: "currentColor",
            d: "M25.984 0A6.016 6.016 0 0 1 32 6.016v19.968A6.016 6.016 0 0 1 25.984 32H6.016A6.016 6.016 0 0 1 0 25.984V6.016A6.016 6.016 0 0 1 6.016 0zM9.744 23.806a7.2 7.2 0 0 0 10.198 0 7.23 7.23 0 0 0 0-10.216zM22.256 8.194a7.2 7.2 0 0 0-10.198 0 7.23 7.23 0 0 0 0 10.216z",
          }),
        ),
      ),
      createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            flex: 1,
            width: "100%",
          },
        },
        createElement(
          "div",
          {
            style: {
              display: "flex",
              fontFamily: blackFontFamily,
              fontSize: "72px",
              fontWeight: 700,
              lineHeight: 1,
              color: "#f0eee7",
              margin: 0,
              maxWidth: "100%",
              wordWrap: "break-word",
            },
          },
          title,
        ),
        ...(summary
          ? [
              createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    marginTop: "20px",
                    fontSize: "42px",
                    lineHeight: 1.25,
                    color: "#f0eee7",
                    fontFamily: narrowFontFamily,
                    fontWeight: 550,
                    maxWidth: "960px",
                    wordWrap: "break-word",
                  },
                },
                summary,
              ),
            ]
          : []),
      ),
    ),
  );

  return createOgImageResponse(card, {
    width: 1200,
    height: 630,
    debug: false,
    fonts: [
      { name: "SumUp Black", data: sumUpBlack, style: "normal", weight: 700 },
      {
        name: "SumUp Narrow",
        data: sumUpNarrowRegular,
        style: "normal",
        weight: 400,
      },
      {
        name: "SumUp Narrow",
        data: sumUpNarrowMedium,
        style: "normal",
        weight: 500,
      },
    ],
  });
}
