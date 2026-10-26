import type { ApiNavItem } from "@cloudflare/nimbus-docs/api";
import type { SidebarItem } from "@cloudflare/nimbus-docs/types";

// Adapt Nimbus's prepared navigation to the portal's shared renderer.
export function apiSidebar(
  items: ApiNavItem[],
  tags: Readonly<Record<string, { events: readonly string[] }>> = {},
): SidebarItem[] {
  const isEvent = (item: ApiNavItem) => item.href?.startsWith("/api/webhooks/");
  const eventPages = new Map<string, ApiNavItem>();
  const collect = (items: ApiNavItem[]) => {
    for (const item of items) {
      if (isEvent(item)) eventPages.set(item.href!, item);
      collect(item.children);
    }
  };
  collect(items);
  const adapt = (items: ApiNavItem[]): SidebarItem[] =>
    items.flatMap((item, order): SidebarItem[] => {
      // Webhook pages belong to their tags; omit Nimbus's global grouping.
      if (
        isEvent(item) ||
        (!item.href && item.children.length > 0 && item.children.every(isEvent))
      )
        return [];
      const events = (tags[item.href ?? ""]?.events ?? []).map((name) => {
        const page = eventPages.get(`/api/webhooks/${name}/`);
        if (!page) throw new Error(`Missing event navigation: ${name}`);
        return { ...page, label: name };
      });
      const eventActive = events.some((event) => event.active);
      if (item.children.length > 0 || events.length > 0)
        return [
          {
            type: "group",
            label: item.label,
            order,
            indexHref: item.href,
            indexIsCurrent: item.active,
            collapsed: !(item.expanded || eventActive),
            children: [
              ...adapt(item.children),
              ...(events.length
                ? [
                    {
                      type: "group" as const,
                      label: "Events",
                      order: item.children.length,
                      collapsed: !eventActive,
                      children: events.map((event, order) => ({
                        type: "link" as const,
                        label: event.label,
                        href: event.href!,
                        order,
                        isCurrent: event.active,
                      })),
                    },
                  ]
                : []),
            ],
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
        },
      ];
    });
  return adapt(items);
}

export const API_HOME_CHUNK_SIZE = 150;
