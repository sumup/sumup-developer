import {
  getIndexedEntries,
  renderEntryAsMarkdown,
  type IndexedEntry,
} from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";

export const prerender = true;

interface Props {
  item: IndexedEntry;
}

export async function getStaticPaths() {
  const entries = await getIndexedEntries();
  return entries
    .filter((item) => item.collection === "docs")
    .map((item) => ({
      params: { path: item.entry.id === "index" ? undefined : item.entry.id },
      props: { item } satisfies Props,
    }));
}

export function GET({ props: { item } }: { props: Props }) {
  const data = item.entry.data as Record<string, unknown>;
  const socialImage =
    typeof data.socialImage === "string"
      ? data.socialImage
      : config.socialImage;
  const body = [
    "---",
    `title: ${JSON.stringify(item.title)}`,
    ...(item.description
      ? [`description: ${JSON.stringify(item.description)}`]
      : []),
    ...(socialImage
      ? [`image: ${JSON.stringify(new URL(socialImage, config.site).href)}`]
      : []),
    "---",
    "",
    "> Documentation Index",
    `> Fetch the complete documentation index at: ${new URL("/llms.txt", config.site).href}`,
    "> Use this file to discover all available pages before exploring further.",
    "",
    `# ${item.title}`,
    "",
    renderEntryAsMarkdown(item.entry),
    "",
    `Source: ${new URL(item.sourceUrl ?? item.markdownUrl, config.site).href}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
