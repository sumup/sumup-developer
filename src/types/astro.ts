import type { Badge } from "@astrojs/starlight/components";
import type { ComponentProps, HTMLAttributes } from "astro/types";

export interface Link {
  type: "link";
  label: string;
  href: string;
  isCurrent: boolean;
  badge: ComponentProps<typeof Badge> | undefined;
  attrs: Omit<HTMLAttributes<"a">, "children">;
  order: number;
}

export type SidebarEntry = Link | Group;

export interface Group {
  type: "group";
  label: string;
  entries: (Link | Group)[];
  collapsed: boolean;
  badge: ComponentProps<typeof Badge> | undefined;
  order: number;
}
