import type { AstroGlobal } from "astro";
import type { StarlightRouteData } from "@astrojs/starlight/route-data";

import { getEntry } from "astro:content";

export type Link = Extract<
  StarlightRouteData["sidebar"][0],
  { type: "link" }
> & {
  order?: number;
  icon?: string;
};

export type Group = Extract<
  StarlightRouteData["sidebar"][0],
  { type: "group" }
> & {
  order?: number;
  icon?: string;
  entries: (Link | Group)[];
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
  group.icon = frontmatter.icon;

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

export async function generateSidebar(
  section: string,
  group: Group,
): Promise<Group> {
  if (section !== "api") {
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
  }

  const topLevel = [];
  for (const entry of group.entries) {
    if (entry.type === "link") {
      topLevel.push(entry);
    } else {
      break;
    }
  }
  group.entries.splice(0, topLevel.length);

  let title = "Unknown";
  let icon: string | undefined;
  if (section !== "api") {
    const entry = await getEntry("docs", section);
    title = entry?.data?.title ?? "Unknown";
    icon = entry?.data?.icon;
  } else {
    title = "API Reference";
    icon = "code";
  }

  group.entries = [
    {
      label: title,
      entries: topLevel,
      type: "group",
      collapsed: false,
      badge: undefined,
      icon: icon,
    },
    ...group.entries,
  ];

  return group;
}

export async function getSidebar(
  context: AstroGlobal<StarlightRouteData>,
): Promise<Group> {
  const pathname = context.url.pathname;
  const section = pathname.split("/").at(1);

  if (!section) {
    throw new Error(`[Sidebar] Splitting ${pathname} resulted in 0 segments`);
  }

  const group = context.locals.starlightRoute.sidebar
    .filter((entry) => entry.type === "group" && entry.label === section)
    .at(0) as Group;

  return await generateSidebar(section, group);
}
