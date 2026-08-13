import type { SidebarItem } from "@cloudflare/nimbus-docs/types";

const normalizePath = (path: string) => path.replace(/\/$/, "") || "/";

export const addDocsHome = (
  items: SidebarItem[],
  currentPath: string,
): SidebarItem[] => [
  {
    type: "link",
    label: "Home",
    href: "/docs/",
    isCurrent: normalizePath(currentPath) === "/docs",
    order: -1,
  },
  ...items,
];

export const expandSidebarGroups = (items: SidebarItem[]): SidebarItem[] =>
  items.map((item) =>
    item.type === "group"
      ? {
          ...item,
          collapsed: false,
          children: expandSidebarGroups(item.children),
        }
      : item,
  );
