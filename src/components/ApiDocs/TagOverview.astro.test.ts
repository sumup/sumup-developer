import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import {
  buildApiModel,
  getApiPageProps,
  type ApiModel,
  type JsonValue,
} from "@cloudflare/nimbus-docs/api";
import { JSDOM } from "jsdom";
import { beforeAll, expect, it } from "vitest";
import { apiReference } from "../../lib/api/reference";
import { getTagOverview } from "../../lib/api/tagOverview";
import TagOverview from "./TagOverview.astro";

let model: ApiModel;
let container: Awaited<ReturnType<typeof AstroContainer.create>>;
beforeAll(async () => {
  model = await buildApiModel({
    collection: "api",
    spec: apiReference.spec as unknown as Record<string, JsonValue>,
    schemaPages: false,
    routes: {
      convention: "resource-action-v2",
      operations: apiReference.operations,
    },
  });
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

async function renderTag(name: string) {
  const page = getApiPageProps(model, `tags.${name}`);
  if (page.kind !== "section") throw new Error("Expected a tag page");
  const overview = getTagOverview(model, apiReference.tagOverviews[page.href]);
  const html = await container.renderToString(TagOverview, {
    props: { page, overview },
  });
  return { dom: new JSDOM(html), page, overview };
}

it("separates tag prose from compact endpoints and described events", async () => {
  const { dom, page, overview } = await renderTag("Checkouts");
  const doc = dom.window.document;
  const description = doc.querySelector("[data-api-tag-description]")!;
  expect(description.textContent).toContain(
    "Checkouts represent online payment sessions",
  );
  expect(description.textContent).not.toContain("Events:");
  expect(description.textContent).not.toContain("Objects:");
  const panels = doc.querySelectorAll("[data-nb-tabs-content]");
  expect(
    [...panels].map((panel) => panel.getAttribute("data-nb-tab-label")),
  ).toEqual(["Endpoints", "Events"]);
  const endpoints = panels[0];
  expect(endpoints.querySelectorAll("[data-api-endpoint]")).toHaveLength(
    page.operations.length,
  );
  expect(endpoints.querySelector(".description")).toBeNull();
  for (const operation of page.operations) {
    expect(endpoints.textContent).toContain(operation.label);
    expect(endpoints.textContent).toContain(operation.path);
  }
  for (const event of overview.events) {
    expect(
      panels[1].querySelector(`a[href="${event.href}"]`)?.textContent,
    ).toBe(event.path);
    expect(panels[1].textContent).toContain(event.description);
  }
  expect(panels[1].querySelector("[data-http-method]")).toBeNull();
  const grids = doc.querySelectorAll(".lr-grid");
  expect(grids[0].children).toHaveLength(2);
  expect(grids[0].children[0]).toBe(description);
  dom.window.close();
});

it("renders every core object beneath the overview with prepared fields", async () => {
  const { dom, overview } = await renderTag("Sales");
  const doc = dom.window.document;
  expect(overview.coreObjects).toHaveLength(2);
  const objects = doc.querySelectorAll("[data-api-core-object]");
  expect(objects).toHaveLength(2);
  for (const [index, schema] of overview.coreObjects.entries()) {
    const object = objects[index];
    expect(object.querySelector("h2 a")?.getAttribute("href")).toBe(
      schema.href,
    );
    expect(object.querySelector(".lr-grid")?.children).toHaveLength(2);
    for (const field of schema.fields) {
      expect(object.querySelector(`[id="${field.anchor}"]`)).not.toBeNull();
    }
    const columns = object.querySelector(".lr-grid")!.children;
    expect(columns[0].querySelector("[data-api-fields]")).not.toBeNull();
    expect(columns[1].querySelector("[data-api-fields]")).toBeNull();
    const json = columns[1].querySelector("pre code")?.textContent;
    expect(JSON.parse(json!)).toEqual(schema.example.value);
    expect(object.id).toBe(schema.href.split("#")[1]);
    expect(object.querySelector('a[href^="/api/schemas/"]')).toBeNull();
  }
  const ids = [...doc.querySelectorAll("[id]")].map((node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  dom.window.close();
});

it("keeps both tabs and an explicit empty state when a tag has no events", async () => {
  const { dom } = await renderTag("Customers");
  const events = dom.window.document.querySelector(
    '[data-nb-tab-label="Events"]',
  );
  expect(events?.textContent).toContain("No events for this tag.");
  dom.window.close();
});

it("omits core object sections when none are declared", async () => {
  const { dom } = await renderTag("Transactions");
  expect(
    dom.window.document.querySelector("[data-api-core-object]"),
  ).toBeNull();
  dom.window.close();
});
