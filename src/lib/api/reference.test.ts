import { beforeAll, expect, it, vi } from "vitest";
import {
  buildApiModel,
  getApiPageProps,
  getApiNav,
  getApiPageSlugs,
  renderApiPageMarkdown,
  type ApiModel,
  type JsonValue,
} from "@cloudflare/nimbus-docs/api";
import source from "../../../openapi31.json";
import operationPaths from "./operationPaths.json";
import { createApiReference } from "./reference";
import { apiSidebar } from "./presentation";
import type { TagOverviewSource } from "./reference";

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
let tagOverviews: Record<string, TagOverviewSource>;

beforeAll(async () => {
  const original = JSON.stringify(source);
  const reference = await createApiReference();
  legacyLinks = reference.legacyLinks;
  tagOverviews = reference.tagOverviews;
  model = await buildApiModel({
    collection: "api",
    spec: reference.spec as unknown as Record<string, JsonValue>,
    requireOperationId: true,
    schemaPages: false,
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

it("keeps colliding schema names usable without publishing schema pages", () => {
  const page = getApiPageProps(model, "ProcessCheckout");
  expect(page.kind).toBe("operation");
  if (page.kind !== "operation") throw new Error("Expected an operation page");
  expect(page.body.some((field) => field.name === "payment_type")).toBe(true);
  expect(
    getApiPageSlugs(model).some(({ slug }) => slug.startsWith("schemas/")),
  ).toBe(false);
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
  expect(members).toContain("/api/tags/members/#members-object-member");
});

it("resolves legacy operation and object bookmarks to published pages", () => {
  expect(legacyLinks["checkouts-create"]).toBe("/api/checkouts/create/");
  expect(legacyLinks["checkouts-object-checkout"]).toBe(
    "/api/tags/checkouts/#checkouts-object-checkout",
  );
  const pages = new Set(
    getApiPageSlugs(model).map(({ slug }) => `/api/${slug ? slug + "/" : ""}`),
  );
  for (const href of Object.values(legacyLinks).filter((href) =>
    href.startsWith("/api/"),
  )) {
    expect(
      pages.has(href.split("#")[0]),
      `Missing legacy bookmark target ${href}`,
    ).toBe(true);
  }
});

const webhooks = Object.entries(source.webhooks).map(([name, path]) => ({
  name,
  operation: path.post,
}));

it("uses OpenAPI 3.1 without changing the source contract", async () => {
  expect(source.openapi).toBe("3.1.0");
  expect((await createApiReference()).spec.webhooks).toEqual(source.webhooks);
});

it.each(webhooks)(
  "publishes $name on its tags and webhook detail page",
  ({ name, operation }) => {
    const href = `/api/webhooks/${name}/`;
    for (const tag of source.tags) {
      const page = getApiPageProps(model, `tags.${tag.name}`);
      const markdown = renderApiPageMarkdown(page);
      if (operation.tags.includes(tag.name)) {
        expect(page.descriptionHtml).toContain("<strong>Events:</strong>");
        expect(page.descriptionHtml).toContain(`<code>${name}</code>`);
        expect(page.descriptionHtml).toContain(`href="${href}"`);
        expect(markdown).toContain(`[\`${name}\`](${href})`);
        expect(markdown).toContain(operation.description);
      } else {
        expect(page.descriptionHtml).not.toContain(`href="${href}"`);
      }
    }
    const route = getApiPageSlugs(model).find(
      ({ slug }) => slug === `webhooks/${name}`,
    );
    expect(route).toBeDefined();
    const page = getApiPageProps(model, route!.coordinate);
    expect(page.kind).toBe("operation");
    if (page.kind !== "operation") throw new Error("Expected a webhook page");
    expect(page.isWebhook).toBe(true);
    expect(page.href).toBe(href);
    expect(page.body.map(({ name }) => name)).toContain("type");
    expect(page.body.map(({ name }) => name)).toEqual([
      "id",
      "type",
      "created_at",
      "object",
    ]);
    expect(page.body.find(({ name }) => name === "id")).toMatchObject({
      type: "string",
      required: true,
    });
    expect(
      page.body
        .find(({ name }) => name === "object")
        ?.children.map(({ name }) => name),
    ).toEqual(["id", "type", "url"]);
    expect(page.requestExamples?.length).toBeGreaterThan(0);
    expect(renderApiPageMarkdown(page)).toContain(name);
    const sidebar = apiSidebar(
      getApiNav(model, page.coordinate).items,
      tagOverviews,
    );
    expect(sidebar.some((item) => item.label === "Webhooks")).toBe(false);
    for (const tag of operation.tags) {
      const group = sidebar.find((item) => item.label === tag);
      expect(group?.type).toBe("group");
      if (group?.type !== "group") throw new Error("Expected a tag group");
      expect(group.collapsed).toBe(false);
      const events = group.children.find((item) => item.label === "Events");
      expect(events?.type).toBe("group");
      if (events?.type !== "group") throw new Error("Expected an Events group");
      expect(events.collapsed).toBe(false);
      expect(events.children).toContainEqual(
        expect.objectContaining({
          type: "link",
          label: name,
          href: page.href,
          isCurrent: true,
        }),
      );
    }
  },
);

it("omits event sections on tags without webhooks", () => {
  for (const tag of source.tags.filter(
    ({ name }) =>
      !webhooks.some(({ operation }) => operation.tags.includes(name)),
  )) {
    const page = getApiPageProps(model, `tags.${tag.name}`);
    expect(page.descriptionHtml).not.toContain("<strong>Events:</strong>");
    expect(renderApiPageMarkdown(page)).not.toContain("**Events:**");
    const sidebar = apiSidebar(
      getApiNav(model, page.coordinate).items,
      tagOverviews,
    );
    const group = sidebar.find((item) => item.label === tag.name);
    if (group?.type === "group") {
      expect(group.children.some((item) => item.label === "Events")).toBe(
        false,
      );
    }
  }
});
