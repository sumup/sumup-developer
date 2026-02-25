import { formatSlug } from "@lib/helpers";
import type { OperationObject, TagObject } from "src/types/openapi";
import { doc } from "./documents";
import { orderedTagEntries } from "./tag-order";

/**
 * Snapshot of sorted tag entries reused across API docs rendering.
 * This avoids repeating sort work in multiple pages/components.
 */
export const orderedTagEntriesCached: [string, OperationObject[]][] =
  orderedTagEntries();

const tagBySlug = new Map<string, TagObject>(
  (doc.tags || []).map((tag) => [formatSlug(tag.name), tag]),
);

const tagEntriesBySlug = new Map<string, OperationObject[]>(
  orderedTagEntriesCached,
);

/** Fast lookup for OpenAPI tag metadata by slug. */
export const getTagBySlug = (slug: string): TagObject | undefined =>
  tagBySlug.get(slug);

/** Fast lookup for operations grouped under a given tag slug. */
export const getTagEntryBySlug = (
  slug: string,
): OperationObject[] | undefined => tagEntriesBySlug.get(slug);
