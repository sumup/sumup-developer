import type { APIRoute } from "astro";
import { GET as getIndex } from "./llms.txt";

export const prerender = true;

// The homepage is a custom Astro page, rather than a Nimbus content entry.
// Give agents the site's discovery index as its Markdown landing page.
export const GET: APIRoute = async (context) => {
  const response = await getIndex(context);
  if (!response.ok) return response;
  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/markdown; charset=utf-8");
  return new Response(`${await response.text()}\nSource: ${context.site}\n`, {
    headers,
  });
};
