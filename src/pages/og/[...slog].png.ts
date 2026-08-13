import { getCollection } from "astro:content";
import { createElement } from "react";

import SumUpBlackData from "../../assets/fonts/sumup-black-latin-s.ttf";
import SumUpNarrowMediumData from "../../assets/fonts/sumup-narrow-latin-s-medium.ttf";
import SumUpNarrowRegularData from "../../assets/fonts/sumup-narrow-latin-s-regular.ttf";
import { createOgImageResponse } from "../../utils/ogImageResponse";

interface Props {
  params: { slog?: string };
}

export const prerender = true;

export async function getStaticPaths() {
  const docs = await getCollection("docs");
  const paths = new Set([
    "index",
    "contact",
    "help",
    "changelog",
    ...docs.map((entry) => entry.id),
  ]);

  return [...paths].map((slog) => ({ params: { slog } }));
}

// Overrides for pages that are not backend by content collections.
const staticPageMetadata = new Map<
  string,
  {
    title: string;
    description: string;
  }
>([
  [
    "",
    {
      title: "SumUp Developer",
      description:
        "Developer documentation, guides, and APIs for building with SumUp.",
    },
  ],
  [
    "contact",
    {
      title: "Contact",
      description: "Get in touch with the SumUp Developer support team.",
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

function getOpenTypeSignature(data: Uint8Array) {
  return String.fromCharCode(...data.subarray(0, 4));
}

function toArrayBuffer(data: Uint8Array) {
  return data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength,
  ) as ArrayBuffer;
}

function toSupportedFontData(data: Uint8Array | string, label: string) {
  if (typeof data === "string") {
    console.warn(
      `[og] ${label} resolved to an asset URL instead of raw font bytes. Falling back to the default font.`,
    );
    return null;
  }

  if (getOpenTypeSignature(data) === "wOF2") {
    console.warn(
      `[og] ${label} uses WOFF2, which Satori does not support. Falling back to the default font.`,
    );
    return null;
  }

  return toArrayBuffer(data);
}

function createFontStack(primary: string | null) {
  return primary
    ? `'${primary}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
}

async function resolvePageMetadata(path: string) {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");
  const defaultMetadata = staticPageMetadata.get("")!;
  const changelogMetadata = staticPageMetadata.get("changelog")!;

  const docs = await getCollection("docs");
  const doc = docs.find((entry) => entry.id === (normalizedPath || "index"));
  if (doc) {
    return {
      title: doc.data.title,
      description: doc.data.description ?? null,
    };
  }

  if (
    normalizedPath === "changelog" ||
    normalizedPath.startsWith("changelog/")
  ) {
    return changelogMetadata;
  }

  const staticData = staticPageMetadata.get(normalizedPath);
  if (staticData) {
    return staticData;
  }

  return defaultMetadata;
}

export async function GET({ params }: Props) {
  const { title, description } = await resolvePageMetadata(params.slog ?? "");

  const sumUpBlack = toSupportedFontData(SumUpBlackData, "SumUp Black");
  const sumUpNarrowMedium = toSupportedFontData(
    SumUpNarrowMediumData,
    "SumUp Narrow Medium",
  );
  const sumUpNarrowRegular = toSupportedFontData(
    SumUpNarrowRegularData,
    "SumUp Narrow Regular",
  );
  const blackFontFamily = createFontStack(sumUpBlack ? "SumUp Black" : null);
  const narrowFontFamily = createFontStack(
    sumUpNarrowRegular || sumUpNarrowMedium ? "SumUp Narrow" : null,
  );

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
        ...(description
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
                description,
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
      ...(sumUpBlack
        ? [
            {
              name: "SumUp Black",
              data: sumUpBlack,
              style: "normal" as const,
              weight: 700 as const,
            },
          ]
        : []),
      ...(sumUpNarrowRegular
        ? [
            {
              name: "SumUp Narrow",
              data: sumUpNarrowRegular,
              style: "normal" as const,
              weight: 400 as const,
            },
          ]
        : []),
      ...(sumUpNarrowMedium
        ? [
            {
              name: "SumUp Narrow",
              data: sumUpNarrowMedium,
              style: "normal" as const,
              weight: 500 as const,
            },
          ]
        : []),
    ],
  });
}
