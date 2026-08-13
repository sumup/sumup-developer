import { getIndexedTopLevel, type IndexedEntry } from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";

export const prerender = true;

interface Props {
  label: string;
  members: IndexedEntry[];
}

export async function getStaticPaths() {
  const { groups } = await getIndexedTopLevel();
  return groups
    .filter((group) => !group.hidden)
    .map((group) => ({
      params: { section: group.slug },
      props: { label: group.label, members: group.members } satisfies Props,
    }));
}

export function GET({ props }: { props: Props }) {
  const pages = props.members.map(
    (item) =>
      `- [${item.title}](${new URL(item.markdownUrl, config.site).href})${item.description ? ` — ${item.description}` : ""}`,
  );
  return new Response(
    [`# ${props.label}`, "", "## Pages", "", ...pages, ""].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
