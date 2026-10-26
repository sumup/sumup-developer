import { resolve } from "node:path";
import { renderedSite } from "./lib/rendered-site.mjs";
import { checkRedirects } from "./check-redirects.mjs";
import { checkRenderedLinks } from "./check-rendered-links.mjs";
import { checkAgentDocs } from "./check-agent-docs.mjs";

const site = await renderedSite(resolve(process.argv[2] ?? "dist/client"));
for (const check of [checkRedirects, checkRenderedLinks, checkAgentDocs]) {
  await check(site);
}
