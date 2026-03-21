import type { APIRoute } from "astro";
import { buildLlmsDocument, getLlmsDocs } from "@lib/llmsTxt";

export const prerender = true;

export const GET: APIRoute = async () => {
  const docs = await getLlmsDocs();
  const body = buildLlmsDocument({
    docs,
    description: "This is the full developer documentation for SumUp.",
  });

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
};
