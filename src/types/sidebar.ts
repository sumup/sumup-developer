import type { StarlightRouteData } from "@astrojs/starlight/route-data";

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
