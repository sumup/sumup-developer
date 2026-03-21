import type { APIRoute } from "astro";
import {
  buildLlmsDocument,
  getLlmsDocs,
  getSmallLlmsDocs,
} from "@lib/llmsTxt";

export const prerender = true;

export const GET: APIRoute = async () => {
  const docs = getSmallLlmsDocs(await getLlmsDocs());
  const body = buildLlmsDocument({
    docs,
    description:
      "This is the abridged developer documentation for SumUp with core integration guidance.",
  });

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
};
