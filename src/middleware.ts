import { defineMiddleware } from "astro:middleware";
import { withPreviewIndexingHeaders } from "./utils/previewIndexing";

export const onRequest = defineMiddleware(async ({ url }, next) => {
  return withPreviewIndexingHeaders(url.hostname, await next());
});
