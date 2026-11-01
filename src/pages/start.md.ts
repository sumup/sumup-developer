import { getMarkdownPayload } from "@cloudflare/nimbus-docs/agent-endpoints";
import type { APIRoute } from "astro";

export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = await getMarkdownPayload({
    collection: "docs",
    surface: "markdown",
    slug: "tools/llms/start",
  });
  if (!payload) throw new Error("Missing agent setup document");
  // Start with setup instructions instead of the general discovery preamble.
  return new Response(payload.content, {
    headers: { "Content-Type": payload.mediaType },
  });
};
