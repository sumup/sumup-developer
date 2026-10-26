import {
  getApiPageProps,
  getApiPageSlugs,
  type ApiModel,
  type ApiOperationPage,
} from "@cloudflare/nimbus-docs/api";
import type { TagOverviewSource } from "./reference";
import type { CoreObject } from "./coreObjects";

export type TagOverview = {
  description: string;
  events: ApiOperationPage[];
  coreObjects: CoreObject[];
};

// Resolve tag event associations against Nimbus's public webhook pages. Core
// objects are already prepared privately and don't have standalone routes.
export function getTagOverview(
  model: ApiModel,
  source: TagOverviewSource,
): TagOverview {
  const routes = new Map(
    getApiPageSlugs(model).map(({ slug, coordinate }) => [slug, coordinate]),
  );
  return {
    description: source.description,
    events: source.events.map((name) => {
      const coordinate = routes.get(`webhooks/${name}`);
      if (!coordinate) throw new Error(`Missing webhook page: ${name}`);
      const page = getApiPageProps(model, coordinate);
      if (page.kind !== "operation" || !page.isWebhook)
        throw new Error(`Expected a webhook page: ${name}`);
      return page;
    }),
    coreObjects: source.coreObjects,
  };
}
