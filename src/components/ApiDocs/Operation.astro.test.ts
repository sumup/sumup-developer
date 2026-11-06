import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import type {
  ApiOperationPage,
  ApiExampleView,
} from "@cloudflare/nimbus-docs/api";
import { JSDOM } from "jsdom";
import { beforeAll, expect, it } from "vitest";
import Operation from "./Operation.astro";

let container: Awaited<ReturnType<typeof AstroContainer.create>>;
beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  container = await AstroContainer.create({ renderers });
});

const example: ApiExampleView = {
  mediaType: "application/json",
  value: { type: "checkouts.paid" },
  highlightedHtml: '<pre><code>{"type":"checkouts.paid"}</code></pre>',
};
const basePage: ApiOperationPage = {
  apiSchemaVersion: 1,
  collection: "api",
  coordinate: "test-event",
  href: "/api/webhooks/checkouts.paid/",
  title: "Checkout paid",
  breadcrumbs: [],
  kind: "operation",
  method: "POST",
  path: "checkouts.paid",
  isWebhook: true,
  descriptionHtml: "<p>Sent when a checkout is paid.</p>",
  auth: [],
  parameters: [],
  body: [],
  bodyMediaType: "application/json",
  bodyRequired: true,
  samples: [],
  responses: [{ status: "2XX", coordinate: "ack", anchor: "ack", fields: [] }],
};

it.each([
  {
    name: "named payloads",
    props: {
      requestExamples: [
        {
          ...example,
          id: "paid",
          label: "Paid",
          description: "Paid checkout payload.",
        },
        {
          ...example,
          id: "retry",
          label: "Retry",
          description: "Repeated delivery.",
          value: { type: "retry-only" },
          highlightedHtml: '<pre><code>{"type":"retry-only"}</code></pre>',
        },
      ],
      example: {
        ...example,
        value: { type: "fallback-only" },
        highlightedHtml: '<pre><code>{"type":"fallback-only"}</code></pre>',
      },
    },
    count: 1,
  },
  { name: "generated payload", props: { example }, count: 1 },
  {
    name: "additional media type payload",
    props: {
      additionalBodies: [
        {
          mediaType: "application/json",
          anchor: "alternate-body",
          fields: [],
          example,
        },
      ],
    },
    count: 1,
  },
])("puts webhook $name in the right column", async ({ props, count }) => {
  const html = await container.renderToString(Operation, {
    props: { page: { ...basePage, ...props } },
  });
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const left = doc.querySelector(".operation-content")!;
  const right = doc.querySelector(".examples .example-stack")!;
  expect(left.textContent).toContain("Sent when a checkout is paid.");
  expect(left.textContent).toContain("Event payload");
  expect(left.textContent).not.toContain("Body parameters");
  expect(left.querySelector("[data-api-fields]")).not.toBeNull();
  expect(left.querySelector(".api-example")).toBeNull();
  expect(right.querySelectorAll(".api-example")).toHaveLength(count);
  expect(right.textContent).toContain("checkouts.paid");
  expect(
    right.querySelector("h2, h3, [data-nb-tabs], .example-title"),
  ).toBeNull();
  expect(right.textContent).not.toContain("Event examples");
  if (props.requestExamples) {
    expect(right.textContent).not.toContain("retry-only");
    expect(right.textContent).not.toContain("fallback-only");
    expect(right.textContent).not.toContain("Paid checkout payload.");
    expect(right.textContent).not.toContain("Repeated delivery.");
  }
  dom.window.close();
});

it("preserves ordinary endpoint request examples in the left column", async () => {
  const html = await container.renderToString(Operation, {
    props: {
      page: {
        ...basePage,
        isWebhook: false,
        requestExamples: [{ ...example, id: "request", label: "Request" }],
      },
    },
  });
  const dom = new JSDOM(html);
  expect(
    dom.window.document.querySelectorAll(".operation-content .api-example"),
  ).toHaveLength(1);
  expect(
    dom.window.document.querySelector(".examples .api-example"),
  ).toBeNull();
  dom.window.close();
});
