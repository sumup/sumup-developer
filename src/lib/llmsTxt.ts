import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

const SITE_URL = "https://developer.sumup.com";

type DocEntry = CollectionEntry<"docs">;

const essentialPrefixes = [
  "online-payments/",
  "terminal-payments/",
  "tools/authorization/",
  "tools/llms/",
];

const essentialIds = new Set(["index", "getting-started"]);

const byPriority = (a: DocEntry, b: DocEntry) => {
  if (a.id === "index") {
    return -1;
  }

  if (b.id === "index") {
    return 1;
  }

  return a.id.localeCompare(b.id);
};

export const getSiteUrl = () => SITE_URL;

export const getLlmsDocs = async () =>
  (await getCollection("docs", ({ data }) => !data.draft)).sort(byPriority);

export const getSmallLlmsDocs = (docs: DocEntry[]) =>
  docs.filter(
    ({ id }) =>
      essentialIds.has(id) ||
      essentialPrefixes.some((prefix) => id.startsWith(prefix)),
  );

export const renderLlmsDoc = ({ body, data }: DocEntry) => {
  const segments = [`# ${data.hero?.title || data.title}`];
  const content = body?.trim();

  const description = data.hero?.tagline || data.description;
  if (description) {
    segments.push(`> ${description}`);
  }

  if (content) {
    segments.push(content);
  }

  return segments.join("\n\n");
};

export const buildLlmsDocument = ({
  docs,
  description,
}: {
  docs: DocEntry[];
  description: string;
}) => {
  const pages = docs.map(renderLlmsDoc);

  return [`<SYSTEM>${description}</SYSTEM>`, ...pages].join("\n\n");
};
