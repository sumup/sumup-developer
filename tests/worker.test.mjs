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
  it("serves the agent start document as cross-origin Markdown", async () => {
    const response = await server.fetch("/start.md");
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /^text\/markdown/);
    assert.equal(response.headers.get("access-control-allow-origin"), "*");
    assert.match(response.headers.get("x-robots-tag"), /noindex/);
    const markdown = await response.text();
    assert(
      (
        await readFile("dist/client/tools/llms/start/index.md", "utf8")
      ).includes(markdown.trim()),
    );
    assert.match(markdown, /^Use these instructions/);
    assert.match(markdown, /https:\/\/mcp\.sumup\.com\/mcp/);
    assert.match(markdown, /https:\/\/developer\.sumup\.com\/llms\.txt/);
  });

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
      JSON.parse(await readFile("openapi31.json", "utf8")),
    );
  });

  it("returns 404 for a missing API operation", async () => {
    const response = await server.fetch("/api/not-a-real-operation/");
    assert.equal(response.status, 404);
  });

  it("redirects retired core schema pages to their tag sections", async () => {
    const response = await server.fetch("/api/schemas/Checkout/", {
      redirect: "manual",
    });
    assert.equal(response.status, 301);
    const target = new URL(
      response.headers.get("location"),
      "https://developer.sumup.com",
    );
    assert.equal(target.pathname, "/api/tags/checkouts/");
    assert.equal(target.hash, "#checkouts-object-checkout");
    const tag = await server.fetch(target.pathname);
    assert.equal(tag.status, 200);
    assert.match(await tag.text(), /id="checkouts-object-checkout"/);
  });

  it("redirects the retired contact page to SumUp", async () => {
    for (const path of ["/contact", "/contact/"]) {
      const response = await server.fetch(path, { redirect: "manual" });
      assert.equal(response.status, 301);
      assert.equal(
        response.headers.get("location"),
        "https://www.sumup.com/contact/",
      );
    }
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
    assert(!listing.content[0].text.includes("/api/schemas/"));
    const result = await rpc(4, "tools/call", {
      name: "get_page",
      arguments: { url: "/api/checkouts/process/" },
    });
    assert(!result.isError);
    const page = JSON.parse(result.content[0].text);
    assert.match(page.content, /Process a checkout/);
    assert.match(page.content, /```php\n/);
    for (const [id, url] of [
      [5, "/api/tags/checkouts/"],
      [6, "/api/webhooks/checkouts.paid/"],
    ]) {
      const result = await rpc(id, "tools/call", {
        name: "get_page",
        arguments: { url },
      });
      assert(!result.isError);
      const page = JSON.parse(result.content[0].text);
      assert.match(page.content, /checkouts\.paid/);
      assert.match(page.content, /Sent once when a checkout/);
      if (url === "/api/tags/checkouts/") {
        assert.match(page.content, /Checkout object/);
        assert.match(page.content, /checkout_reference/);
        assert.match(page.content, /```json\n/);
        assert(!page.content.includes("/api/schemas/"));
      } else {
        assert.match(page.content, /created_at/);
        assert(!page.content.includes("transaction_id"));
      }
    }
  });
});
