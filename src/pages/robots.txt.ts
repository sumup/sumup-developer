import type { APIRoute } from "astro";
import { robotsTxt } from "../utils/previewIndexing";

export const prerender = false;

export const GET: APIRoute = ({ url }) => {
  return new Response(robotsTxt(url.hostname), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
};
