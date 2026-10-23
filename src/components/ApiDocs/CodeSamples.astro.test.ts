import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import { JSDOM } from "jsdom";
import { beforeAll, expect, it } from "vitest";
import CodeSamples from "./CodeSamples.astro";

let html: string;
beforeAll(async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  html = await container.renderToString(CodeSamples, {
    props: {
      method: "POST",
      title: "Create a checkout",
      coordinate: "CreateCheckout",
      samples: [
        { id: "python", lang: "python", label: "Python SDK" },
        { id: "python-2", lang: "python", label: "Python HTTP" },
        { id: "curl", lang: "bash", label: "cURL" },
      ].map((sample) => ({
        ...sample,
        source: sample.label,
        highlightedHtml: `<pre class="astro-code"><code>${sample.label}</code></pre>`,
      })),
      responses: ["200", "400"].map((status) => ({
        status,
        coordinate: `CreateCheckout.response.${status}`,
        anchor: `response-${status}`,
        fields: [],
        example: {
          mediaType: "application/json",
          value: { status },
          highlightedHtml: `<pre class="astro-code"><code>${status}</code></pre>`,
        },
      })),
    },
  });
});

it("shows only the default request and response with stable controls before JavaScript", () => {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  expect(doc.querySelectorAll("[data-api-sample]:not([hidden])")).toHaveLength(
    1,
  );
  expect(
    doc
      .querySelector("[data-api-sample]:not([hidden])")
      ?.getAttribute("data-api-sample"),
  ).toBe("curl");
  expect(
    doc.querySelectorAll("[data-api-response-panel]:not([hidden])"),
  ).toHaveLength(1);
  expect(doc.querySelector<HTMLSelectElement>("select")!.disabled).toBe(true);
  expect(
    doc.querySelectorAll("[data-api-response-trigger]:disabled"),
  ).toHaveLength(2);
  expect(doc.querySelector(".sample-label, header [hidden]")).toBeNull();
  dom.window.close();
});

it.each([
  { query: "?lang=python-2", saved: "bash", expected: "python-2" },
  { query: "?lang=PYTHON", saved: "bash", expected: "python" },
  { query: "?lang=missing", saved: "python", expected: "python" },
  { query: "", saved: "python", expected: "python" },
  { query: "", saved: "missing", expected: "curl" },
  { query: "", saved: "", expected: "curl", blocked: true },
])(
  "restores $expected before deferred scripts for $query and saved $saved",
  ({ query, saved, expected, blocked }) => {
    const dom = new JSDOM(html, {
      url: `https://developer.sumup.com/api/checkouts/create/${query}`,
      runScripts: "dangerously",
      beforeParse(window) {
        if (blocked) {
          Object.defineProperty(window, "localStorage", {
            get() {
              throw new Error("Storage blocked");
            },
          });
        } else window.localStorage.setItem("nb-api-code-rail__lang", saved);
      },
    });
    const doc = dom.window.document;
    expect(doc.querySelector("[data-api-samples-restored]")).not.toBeNull();
    expect(
      doc.querySelectorAll("[data-api-sample]:not([hidden])"),
    ).toHaveLength(1);
    expect(
      doc
        .querySelector("[data-api-sample]:not([hidden])")
        ?.getAttribute("data-api-sample"),
    ).toBe(expected);
    expect(doc.querySelector<HTMLSelectElement>("select")!.value).toBe(
      expected,
    );
    dom.window.close();
  },
);
