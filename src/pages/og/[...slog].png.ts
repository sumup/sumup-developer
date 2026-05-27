import { getCollection } from "astro:content";
import { createElement } from "react";
import slugify from "@sindresorhus/slugify";
import { ImageResponse } from "workers-og";

import SumUpBlackData from "../../assets/fonts/sumup-black-latin-s.ttf";
import SumUpNarrowMediumData from "../../assets/fonts/sumup-narrow-latin-s-medium.ttf";
import SumUpNarrowRegularData from "../../assets/fonts/sumup-narrow-latin-s-regular.ttf";

interface Props {
  params: { slog?: string };
}

export const prerender = false;

const staticPageTitles = new Map<string, string>([
  ["", "SumUp Developer"],
  ["contact", "Contact"],
  ["help", "FAQ"],
  ["changelog", "Changelog"],
  ["changelog/rss.xml", "Changelog RSS Feed"],
  ["llms.txt", "LLMs.txt"],
  ["llms-full.txt", "LLMs Full"],
  ["llms-small.txt", "LLMs Small"],
]);

const staticPageDescriptions = new Map<string, string>([
  ["", "Developer documentation, guides, and APIs for building with SumUp."],
  ["contact", "Get in touch with the SumUp Developer support team."],
  [
    "help",
    "Frequently asked questions about SumUp developer products and integrations.",
  ],
  ["changelog", "Product and API updates across the SumUp developer platform."],
  ["changelog/rss.xml", "RSS feed for SumUp Developer changelog updates."],
  [
    "llms.txt",
    "Structured guidance for language models using the SumUp Developer portal.",
  ],
  [
    "llms-full.txt",
    "Full language model guidance for the SumUp Developer portal.",
  ],
  [
    "llms-small.txt",
    "Compact language model guidance for the SumUp Developer portal.",
  ],
]);

function toDisplayTitle(path: string) {
  const slug = path.split("/").filter(Boolean).at(-1) ?? "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase() + segment.slice(1))
    .join(" ");
}

function getOpenTypeSignature(data: Uint8Array) {
  return String.fromCharCode(...data.subarray(0, 4));
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
      `[og] ${label} uses WOFF2, which Satori/workers-og does not support. Falling back to the default font.`,
    );
    return null;
  }

  return data;
}

function createFontStack(primary: string | null) {
  return primary
    ? `'${primary}', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
}

function getFirstParagraph(markdown: string) {
  return markdown
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .find((paragraph) => paragraph && !paragraph.startsWith("#"));
}

async function resolvePageMetadata(path: string) {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  const docs = await getCollection("docs");
  const doc = docs.find((entry) => entry.id === (normalizedPath || "index"));
  if (doc) {
    return {
      title: doc.data.title,
      description: doc.data.description ?? null,
    };
  }

  if (normalizedPath.startsWith("changelog/tags/")) {
    const currentTag = normalizedPath.slice("changelog/tags/".length);
    const changelogEntries = await getCollection("changelog");
    const matchingTag = [
      ...new Set(changelogEntries.flatMap(({ data: { tags } }) => tags)),
    ].find((tag) => slugify(tag) === currentTag);

    if (matchingTag) {
      return {
        title: `${matchingTag} Changelog`,
        description: "Product and API updates filtered by changelog tag.",
      };
    }
  }

  if (normalizedPath.startsWith("changelog/")) {
    const changelogSlug = normalizedPath.slice("changelog/".length);
    const changelogEntries = await getCollection("changelog");
    const entry = changelogEntries.find((item) => item.slug === changelogSlug);

    if (entry) {
      return {
        title: entry.data.title,
        description: getFirstParagraph(entry.body) ?? null,
      };
    }
  }

  const staticTitle = staticPageTitles.get(normalizedPath);
  if (staticTitle) {
    return {
      title: staticTitle,
      description: staticPageDescriptions.get(normalizedPath) ?? null,
    };
  }

  return {
    title: toDisplayTitle(normalizedPath) || "SumUp Developer",
    description: null,
  };
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
        width: "1200px",
        height: "600px",
        background: "#000000",
        padding: "60px",
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
              fontSize: "32px",
              color: "#f0eee7",
              fontFamily: narrowFontFamily,
              fontWeight: 500,
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
              fontSize: "64px",
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
                    fontSize: "32px",
                    lineHeight: 1.25,
                    color: "#f0eee7",
                    fontFamily: narrowFontFamily,
                    fontWeight: 400,
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

  return new ImageResponse(card, {
    width: 1200,
    height: 600,
    debug: false,
    fonts: [
      ...(sumUpBlack
        ? [
            {
              name: "SumUp Black",
              data: sumUpBlack,
              style: "normal" as const,
              weight: 700,
            },
          ]
        : []),
      ...(sumUpNarrowRegular
        ? [
            {
              name: "SumUp Narrow",
              data: sumUpNarrowRegular,
              style: "normal" as const,
              weight: 400,
            },
          ]
        : []),
      ...(sumUpNarrowMedium
        ? [
            {
              name: "SumUp Narrow",
              data: sumUpNarrowMedium,
              style: "normal" as const,
              weight: 500,
            },
          ]
        : []),
    ],
  });
}
