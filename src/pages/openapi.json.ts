import type { APIRoute } from "astro";
import document from "../../openapi.json?raw";

export const prerender = true;

export const GET: APIRoute = () =>
  new Response(document, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
