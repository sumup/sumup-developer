import { formatSlug } from "@lib/helpers";
import type { OperationObject, TagObject } from "src/types/openapi";
import { doc } from "./documents";
import { pathsByTag } from "./preprocess";

const manualDownranked = new Set(
  ["Merchant", "Subaccounts"].map((name) => formatSlug(name)),
);

const getTag = (slug: string): TagObject | undefined =>
  doc.tags?.find((tag) => formatSlug(tag.name) === slug);

const getTagIndex = (slug: string): number =>
  doc.tags?.findIndex((tag) => formatSlug(tag.name) === slug) ?? -1;

const isDeprecatedTag = (tag?: TagObject): boolean =>
  Boolean(tag?.["x-deprecation-notice"]);

const isDownrankedTag = (tag?: TagObject): boolean => {
  if (!tag) {
    return false;
  }

  return manualDownranked.has(formatSlug(tag.name)) || isDeprecatedTag(tag);
};

const compareTags = (slugA: string, slugB: string): number => {
  const tagA = getTag(slugA);
  const tagB = getTag(slugB);

  const aDownranked = isDownrankedTag(tagA);
  const bDownranked = isDownrankedTag(tagB);

  if (aDownranked && !bDownranked) return 1;
  if (!aDownranked && bDownranked) return -1;

  const aIndex = getTagIndex(slugA);
  const bIndex = getTagIndex(slugB);

  if (aIndex === -1 && bIndex === -1) {
    return slugA.localeCompare(slugB);
  }
  if (aIndex === -1) return 1;
  if (bIndex === -1) return -1;

  return aIndex - bIndex;
};

export const orderedTagEntries = (): [string, OperationObject[]][] => {
  // Sort by OpenAPI tag order first, but push deprecated/downranked tags to the end.
  return Object.entries(pathsByTag).sort(([slugA], [slugB]) =>
    compareTags(slugA, slugB),
  );
};
