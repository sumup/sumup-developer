import { beforeAll, expect, it, vi } from "vitest";
import {
  buildApiModel,
  getApiPageProps,
  getApiPageSlugs,
  renderApiPageMarkdown,
  type ApiModel,
  type JsonValue,
} from "@cloudflare/nimbus-docs/api";
import source from "../../../openapi.json";
import operationPaths from "./operationPaths.json";
import { createApiReference } from "./reference";

vi.mock("./codeSamples", () => ({
  getSdkCodeSamples: (operationId: string) => [
    {
      id: "rust",
      lang: "rust",
      label: "Rust",
      source: `sdk_request("${operationId}");`,
    },
  ],
}));
const operations = Object.values(
  source.paths as Record<string, Record<string, unknown>>,
)
  .flatMap(Object.values)
  .filter(
    (value): value is Record<string, unknown> =>
      typeof value === "object" && value !== null && "operationId" in value,
  );
let model: ApiModel;
let legacyLinks: Record<string, string>;

beforeAll(async () => {
  const original = JSON.stringify(source);
  const reference = createApiReference();
  legacyLinks = reference.legacyLinks;
  model = await buildApiModel({
    collection: "api",
    spec: reference.spec as unknown as Record<string, JsonValue>,
    requireOperationId: true,
    schemaPages: true,
    routes: {
      convention: "resource-action-v2",
      operations: reference.operations,
    },
    samples: { generate: ["curl"], keepGenerated: ["curl"] },
  });
  expect(JSON.stringify(source)).toBe(original);
});

it("keeps established operation URLs and passes SDK samples through to Nimbus", () => {
  const routes = new Map(
    getApiPageSlugs(model).map(({ coordinate, slug }) => [coordinate, slug]),
  );
  for (const [operationId, path] of Object.entries(operationPaths)) {
    expect(routes.get(operationId)).toBe(path);
  }
  for (const operation of operations) {
    const page = getApiPageProps(model, String(operation.operationId));
    if (page.kind !== "operation")
      throw new Error("Expected an operation page");
    expect(page.samples.find((sample) => sample.lang === "rust")?.source).toBe(
      `sdk_request("${operation.operationId}");`,
    );
    expect(page.samples.some((sample) => sample.lang === "curl")).toBe(true);
  }
});

it("keeps the operation and its colliding schema independently addressable", () => {
  expect(getApiPageProps(model, "ProcessCheckout").kind).toBe("operation");
  const schema = getApiPageProps(model, "ProcessCheckoutSchema");
  expect(schema.kind).toBe("schema");
  if (schema.kind !== "schema") throw new Error("Expected a schema page");
  expect(schema.fields.some((field) => field.name === "payment_type")).toBe(
    true,
  );
});

it("retains callouts, access requirements, beta status and object links in agent Markdown", () => {
  const markdown = renderApiPageMarkdown(
    getApiPageProps(model, "ProcessCheckout"),
  );
  expect(markdown).toContain("PCI DSS compliance required");
  expect(markdown).not.toContain(":::");
  expect(markdown).toContain("checkouts.write");
  for (const operation of operations) {
    const permissions = operation["x-permissions"];
    if (!Array.isArray(permissions) || permissions.length === 0) continue;
    const page = getApiPageProps(model, String(operation.operationId));
    const markdown = renderApiPageMarkdown(page);
    expect(markdown).toContain("Required permissions");
    for (const permission of permissions) {
      const relation =
        typeof permission === "string" ? permission : permission.relation;
      expect(markdown).toContain(`- \`${relation}\``);
      expect(page.descriptionHtml).toContain(`<code>${relation}</code>`);
      if (typeof permission !== "string") {
        expect(markdown).not.toContain("object_type");
        expect(page.descriptionHtml).not.toContain("object_type");
      }
    }
  }
  const members = renderApiPageMarkdown(getApiPageProps(model, "tags.Members"));
  expect(members).toContain("**Beta.**");
  expect(members).toContain("/api/schemas/Member/");
});

it("resolves legacy operation and object bookmarks to published pages", () => {
  expect(legacyLinks["checkouts-create"]).toBe("/api/checkouts/create/");
  expect(legacyLinks["checkouts-object-checkout"]).toBe(
    "/api/schemas/Checkout/",
  );
  const pages = new Set(
    getApiPageSlugs(model).map(({ slug }) => `/api/${slug ? slug + "/" : ""}`),
  );
  for (const href of Object.values(legacyLinks).filter((href) =>
    href.startsWith("/api/"),
  )) {
    expect(pages.has(href), `Missing legacy bookmark target ${href}`).toBe(
      true,
    );
  }
});
