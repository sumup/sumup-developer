import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

// Extend Nimbus's generated discovery with the portal-owned API and MCP routes.
const entries = [
  {
    identifier: "urn:air:developer.sumup.com:mcp:sumup",
    displayName: "SumUp MCP server",
    description: "Connect to SumUp tools using OAuth sign-in.",
    type: "application/mcp-server-card+json",
    url: "https://developer.sumup.com/.well-known/mcp/server-card.json",
  },
  {
    identifier: "urn:air:developer.sumup.com:api:sumup",
    displayName: "SumUp OpenAPI specification",
    description: "The complete SumUp API contract.",
    type: "application/vnd.oai.openapi+json",
    url: "https://developer.sumup.com/openapi.json",
  },
];
for (const name of ["ard.json", "ai-catalog.json"]) {
  const path = new URL(`../dist/client/.well-known/${name}`, import.meta.url);
  const catalog = JSON.parse(await readFile(path, "utf8"));
  assert.equal(catalog.specVersion, "1.0");
  const owned = new Set(entries.map((entry) => entry.identifier));
  catalog.entries = [
    ...catalog.entries.filter((entry) => !owned.has(entry.identifier)),
    ...entries,
  ];
  await writeFile(path, `${JSON.stringify(catalog, null, 2)}\n`);
}
