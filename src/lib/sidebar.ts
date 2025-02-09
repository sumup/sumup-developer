import type { Props } from "@astrojs/starlight/props";
import type { AstroGlobal } from "astro";

import { getEntry } from "astro:content";

export type Link = Extract<Props["sidebar"][0], { type: "link" }> & {
  order?: number;
};
export type Group = Extract<Props["sidebar"][0], { type: "group" }> & {
  order?: number;
};
export type SidebarEntry = Link | Group;

function sortGroup(a: SidebarEntry, b: SidebarEntry): number {
  const collator = new Intl.Collator("en");
  if (a.order !== b.order) {
    return (a.order || Number.MAX_VALUE) - (b.order || Number.MAX_VALUE);
  }
  return collator.compare(a.label, b.label);
}

async function handleGroup(group: Group): Promise<SidebarEntry> {
  const indexLink = group.entries.find(
    (x) => x.type === "link" && x.href.endsWith(`/${group.label}/`),
  ) as Link | undefined;

  if (!indexLink) {
    throw new Error(`Unable to find index link in group ${group.label}`);
  }

  const indexPage = await getEntry("docs", indexLink.href.slice(1, -1));
  if (!indexPage) {
    throw new Error(`Unable to find index page with href ${indexLink}`);
  }

  const frontmatter = indexPage.data;

  group.label = frontmatter.title;
  group.order = frontmatter.sidebar.order ?? Number.MAX_VALUE;

  for (const entry of group.entries.keys()) {
    if (group.entries[entry].type === "group") {
      group.entries[entry] = await handleGroup(group.entries[entry] as Group);
    } else {
      group.entries[entry] = await handleLink(group.entries[entry] as Link);
    }
  }

  group.entries = group.entries.sort(sortGroup);

  const indexIdx = group.entries.findIndex(
    (x) => x.type === "link" && indexLink.href === x.href,
  ) as number;

  group.entries.unshift(group.entries.splice(indexIdx, 1)[0]);
  group.entries[0].label = indexPage.data.sidebar.label ?? "Overview";

  return group;
}

async function handleLink(link: Link): Promise<Link> {
  const slug = link.href.slice(1, -1);
  const page = await getEntry("docs", slug);

  if (!page) {
    throw new Error("Oops");
  }

  const frontmatter = page.data;
  link.order = frontmatter.sidebar.order ?? Number.MAX_VALUE;

  if (link.href.split("/").filter(Boolean).length === 1) {
    link.order = 0;
  }

  return link;
}

export async function generateSidebar(group: Group): Promise<Group> {
  group.entries = await Promise.all(
    group.entries.map((entry) => {
      if (entry.type === "group") {
        return handleGroup(entry);
      }
      return handleLink(entry);
    }),
  );

  if (group.entries[0].type === "link") {
    group.entries[0].label = "Overview";
  }

  return group;
}

export const lookupProductTitle = async (product: string): Promise<string> => {
  const entry = await getEntry("docs", product);
  return entry?.data?.title ?? "Unknown";
};

export async function getSidebar(context: AstroGlobal<Props>) {
  const pathname = context.url.pathname;
  const segments = pathname.split("/").slice(1, -1);

  const product = segments.at(0);

  if (!product) {
    throw new Error(`[Sidebar] Splitting ${pathname} resulted in 0 segments`);
  }

  const group = context.props.sidebar
    .filter((entry) => entry.type === "group" && entry.label === product)
    .at(0) as Group;

  return await generateSidebar(group);
}
