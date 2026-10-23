import { llmsRoute } from "@cloudflare/nimbus-docs/agent-endpoints";
import type { APIRoute } from "astro";

export const prerender = true;
const route = llmsRoute();
export const GET: APIRoute = async (context) => {
  const response = await route.GET(context);
  if (!response.ok) return response;
  return new Response(
    `${await response.text()}\n## Agent setup\n\n- [Set up your AI assistant](https://developer.sumup.com/tools/llms/setup/index.md): Install SumUp skills and connect the hosted MCP server using OAuth.\n- [Agent Skills discovery](https://developer.sumup.com/.well-known/agent-skills/index.json): Published skills and archive digests.\n- [MCP server card](https://developer.sumup.com/.well-known/mcp/server-card.json): Hosted MCP endpoint and transport.\n\n## API contract\n\n- [OpenAPI specification](https://developer.sumup.com/openapi.json): Complete endpoint, request, and response schemas for the SumUp API.\n`,
    { headers: response.headers },
  );
};
