import { llmsFullRoute } from "@cloudflare/nimbus-docs/agent-endpoints";
import { withCleanMarkdown } from "../lib/agentEndpoints";

export const prerender = true;
const route = llmsFullRoute();
export const GET = withCleanMarkdown(route.GET);
