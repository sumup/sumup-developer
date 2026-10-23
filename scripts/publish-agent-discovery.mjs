import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";

const contract = {
  href: "https://developer.sumup.com/openapi.json",
  type: "application/vnd.oai.openapi+json",
};

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
    type: contract.type,
    url: contract.href,
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

// Nimbus's input is enriched for documentation. Advertise the original public
// contract alongside its generated documentation links instead of that input.
const apiCatalogPath = new URL(
  "../dist/client/.well-known/api-catalog",
  import.meta.url,
);
const apiCatalog = JSON.parse(await readFile(apiCatalogPath, "utf8"));
const reference = apiCatalog.linkset.find(
  (entry) => entry.anchor === "https://developer.sumup.com/api/",
);
assert(reference, "Missing SumUp API reference in the generated API catalog");
reference["service-desc"] = [
  ...(reference["service-desc"] ?? []).filter(
    (link) => link.href !== contract.href,
  ),
  contract,
];
await writeFile(apiCatalogPath, `${JSON.stringify(apiCatalog, null, 2)}\n`);
