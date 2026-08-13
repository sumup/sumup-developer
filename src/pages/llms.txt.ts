import { llmsRoute } from "@cloudflare/nimbus-docs/agent-endpoints";
import type { APIRoute } from "astro";

export const prerender = true;
const route = llmsRoute();
export const GET: APIRoute = async (context) => {
  const response = await route.GET(context);
  if (!response.ok) return response;
  return new Response(
    `${await response.text()}\n## API contract\n\n- [OpenAPI specification](https://developer.sumup.com/openapi.json): Complete endpoint, request, and response schemas for the SumUp API.\n`,
    { headers: response.headers },
  );
};
