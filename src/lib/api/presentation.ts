import type { ApiNavItem } from "@cloudflare/nimbus-docs/api";
import type { SidebarItem } from "@cloudflare/nimbus-docs/types";

// Adapt Nimbus's prepared navigation to the portal's shared renderer.
export function apiSidebar(items: ApiNavItem[]): SidebarItem[] {
  return items.flatMap((item, order): SidebarItem[] => {
    if (item.children.length > 0)
      return [
        {
          type: "group",
          label: item.label,
          order,
          indexHref: item.href,
          indexIsCurrent: item.active,
          collapsed: !item.expanded,
          children: apiSidebar(item.children),
        },
      ];
    if (!item.href) return [];
    return [
      {
        type: "link",
        label: item.label,
        href: item.href,
        order,
        isCurrent: item.active,
        attrs: item.method
          ? { "data-http-method": item.method.toUpperCase() }
          : undefined,
      },
    ];
  });
}

export const API_HOME_CHUNK_SIZE = 150;
