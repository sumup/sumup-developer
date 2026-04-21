import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

const toDescription = (body: string): string => {
  const plain = body.replace(/\s+/g, " ").trim();
  if (plain.length <= 180) {
    return plain;
  }

  return `${plain.slice(0, 177).trimEnd()}...`;
};

export async function GET(context: { site: URL | undefined }) {
  const changelogEntries = (await getCollection("changelog")).sort(
    (a, b) => b.data.publishedDate.valueOf() - a.data.publishedDate.valueOf(),
  );

  return rss({
    title: "SumUp Developer Changelog",
    description: "Latest updates from the SumUp Developer changelog.",
    site: context.site ?? "https://developer.sumup.com",
    items: changelogEntries.map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.publishedDate,
      description: toDescription(entry.body),
      link: `/changelog/${entry.slug}/`,
    })),
  });
}
