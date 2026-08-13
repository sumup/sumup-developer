import { getIndexedTopLevel } from "@cloudflare/nimbus-docs";
import { config } from "virtual:nimbus/config";

export const prerender = true;

export async function GET() {
  const { leaves, groups } = await getIndexedTopLevel();
  const rows = [
    ...leaves.map((item) => ({
      key: item.url,
      line: `- [${item.title}](${new URL(item.markdownUrl, config.site).href})${item.description ? ` — ${item.description}` : ""}`,
    })),
    ...groups
      .filter((group) => group.kind !== "version")
      .map((group) => ({
        key: `/${group.slug}`,
        line: `- [${group.label}](${new URL(`/${group.slug}/llms.txt`, config.site).href})`,
      })),
  ].sort((a, b) => a.key.localeCompare(b.key));

  return new Response(
    [
      `# ${config.title}`,
      "",
      config.description ?? "Documentation index for AI agents.",
      "",
      `Full corpus: ${new URL("/llms-full.txt", config.site).href}`,
      "",
      "## Pages",
      "",
      ...rows.map((row) => row.line),
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
}
