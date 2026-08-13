import { markdownRoute } from "@cloudflare/nimbus-docs/agent-endpoints";
import { withCleanMarkdown } from "../../lib/agentEndpoints";

export const prerender = true;
const route = markdownRoute();
export const getStaticPaths = route.getStaticPaths;
export const GET = withCleanMarkdown(route.GET);
