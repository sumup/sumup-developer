import type { SidebarItem } from "@cloudflare/nimbus-docs/types";

const normalizePath = (path: string) => path.replace(/\/$/, "") || "/";

export const addDocsHome = (
  items: SidebarItem[],
  currentPath: string,
): SidebarItem[] => [
  {
    type: "link",
    label: "Home",
    href: "/",
    isCurrent: normalizePath(currentPath) === "/",
    order: -1,
  },
  ...items,
];
