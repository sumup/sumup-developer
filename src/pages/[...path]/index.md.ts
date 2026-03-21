import type { APIRoute } from "astro";
import { getEntry } from "astro:content";

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const { path } = params;

  const doc = await getEntry("docs", path || "index");
  if (!doc) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  const markdown = `# ${doc.data.title}\n\n` + doc.body;

  return new Response(markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
    },
  });
};
