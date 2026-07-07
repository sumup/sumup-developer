/** Top-level API pages that render sections from the root API reference page. */
export const apiTopLevelPaths = ["sdks", "authentication", "errors"] as const;

/** Literal union of supported top-level API path segments. */
export type ApiTopLevelPath = (typeof apiTopLevelPaths)[number];
/** Section IDs used by in-page scrolling/highlighting on top-level API pages. */
export type ApiTopSection =
  "introduction" | "sdks" | "authentication" | "errors";

/** Route classification used by sidebar scroll syncing. */
export type ParsedApiPath =
  | { kind: "other" }
  | { kind: "top" }
  | { kind: "tag"; tag: string; operation?: string };

const apiTopLevelPathSet = new Set<string>(apiTopLevelPaths);

/** Type guard for known top-level API path segments. */
export const isApiTopLevelPath = (
  segment: string | undefined,
): segment is ApiTopLevelPath => {
  if (!segment) {
    return false;
  }

  return apiTopLevelPathSet.has(segment);
};

/**
 * Converts a route segment into a section ID used in the top-level API page.
 * Returns `undefined` for tag pages.
 */
export const getApiTopSection = (
  segment: string | undefined,
): ApiTopSection | undefined => {
  if (!segment) {
    return "introduction";
  }

  if (
    segment === "sdks" ||
    segment === "authentication" ||
    segment === "errors"
  ) {
    return segment;
  }

  return undefined;
};

/** Parses any pathname and returns whether it points to top-level API docs, tag docs, or non-API routes. */
export const parseApiPath = (pathname: string): ParsedApiPath => {
  const [, root, first, second] = pathname.split("/");

  if (root !== "api") {
    return { kind: "other" };
  }

  if (!first || isApiTopLevelPath(first)) {
    return { kind: "top" };
  }

  return { kind: "tag", tag: first, operation: second };
};

/**
 * Computes the DOM section ID that should be scrolled to/highlighted for a pathname.
 * Returns `undefined` for non-API routes.
 */
export const getApiScrollTarget = (pathname: string): string | undefined => {
  const [, root, first, second] = pathname.split("/");

  if (root !== "api") {
    return undefined;
  }

  if (!first) {
    return undefined;
  }

  if (first === "sdks" || first === "authentication" || first === "errors") {
    return first;
  }

  return second ? `${first}-${second}` : undefined;
};
