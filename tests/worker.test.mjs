import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { readFile } from "node:fs/promises";
import { createTestHarness } from "wrangler";

// Exercise the built adapter and asset routing in workerd without deploying.
const server = createTestHarness({
  workers: [{ configPath: "dist/server/wrangler.json" }],
});
before(() => server.listen(), { timeout: 30_000 });
after(() => server.close(), { timeout: 10_000 });

describe("built documentation Worker", { timeout: 60_000 }, () => {
  it("serves API pages and Markdown containing every SDK sample", async () => {
    const page = await server.fetch("/api/checkouts/process/");
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Process a checkout/);
    const markdown = await server.fetch("/api/checkouts/process/index.md");
    assert.equal(markdown.status, 200);
    const text = await markdown.text();
    for (const [sdk, language] of [
      ["CLI", "bash"],
      ["JavaScript", "typescript"],
      [".NET", "csharp"],
      ["Java", "java"],
      ["Python", "python"],
      ["PHP", "php"],
      ["Go", "go"],
      ["Rust", "rust"],
      ["cURL", "bash"],
    ]) {
      assert(
        text.includes(`### ${sdk}\n\n\`\`\`${language}\n`),
        `Missing ${sdk} sample`,
      );
    }
  });

  it("redirects the API specification to the original public contract", async () => {
    const response = await server.fetch("/api/openapi.json", {
      redirect: "manual",
    });
    assert.equal(response.status, 301);
    assert.equal(
      new URL(response.headers.get("location"), "https://developer.sumup.com")
        .pathname,
      "/openapi.json",
    );
    const contract = await server.fetch("/openapi.json");
    assert.equal(contract.status, 200);
    assert.deepEqual(
      await contract.json(),
      JSON.parse(await readFile("openapi.json", "utf8")),
    );
  });

  it("returns 404 for a missing API operation", async () => {
    const response = await server.fetch("/api/not-a-real-operation/");
    assert.equal(response.status, 404);
  });

  it("routes invalid contact submissions back to the contact page", async () => {
    const response = await server.fetch("/contact/submit", {
      method: "POST",
      body: new URLSearchParams(),
      redirect: "manual",
    });
    assert.equal(response.status, 303);
    const target = new URL(
      response.headers.get("location"),
      "https://developer.sumup.com",
    );
    assert.equal(target.pathname, "/contact");
    assert.equal(target.searchParams.get("status"), "error");
    const page = await server.fetch(target.pathname + target.search);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /action="\/contact\/submit"/);
  });

  it("serves documentation MCP metadata and operation Markdown", async () => {
    const card = await server.fetch("/mcp/server-card");
    assert.equal(card.status, 200);
    assert.match(card.headers.get("content-type"), /json/);
    const rpc = async (id, method, params) => {
      const response = await server.fetch("/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
      });
      assert.equal(response.status, 200);
      const message = await response.json();
      assert.equal(message.error, undefined);
      return message.result;
    };
    await rpc(1, "initialize", {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "docs-smoke-test", version: "1.0.0" },
    });
    const tools = await rpc(2, "tools/list", {});
    for (const name of ["get_page", "list_pages"])
      assert(tools.tools.some((tool) => tool.name === name));
    const listing = await rpc(3, "tools/call", {
      name: "list_pages",
      arguments: { section: "api" },
    });
    assert(!listing.isError);
    assert(JSON.parse(listing.content[0].text).pages.length > 0);
    const result = await rpc(4, "tools/call", {
      name: "get_page",
      arguments: { url: "/api/checkouts/process/" },
    });
    assert(!result.isError);
    const page = JSON.parse(result.content[0].text);
    assert.match(page.content, /Process a checkout/);
    assert.match(page.content, /```php\n/);
  });
});
