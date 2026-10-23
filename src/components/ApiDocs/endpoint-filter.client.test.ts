// @vitest-environment jsdom
import { expect, it } from "vitest";
import { initEndpointFilter } from "./endpoint-filter.client";

it("filters endpoint names, methods and paths, hiding empty categories and reporting no matches", () => {
  document.body.innerHTML = `<main><label hidden><input data-api-endpoint-filter></label><p data-api-endpoint-status></p>
    <section data-api-endpoint-group><h2>Checkouts</h2><ul><li data-api-endpoint>Create checkout POST /v0.1/checkouts</li><li data-api-endpoint>Retrieve checkout GET /v0.1/checkouts/{id}</li></ul></section>
    <section data-api-endpoint-group><h2>Readers</h2><ul><li data-api-endpoint>List readers GET /v0.1/readers</li></ul></section></main>`;
  const root = document.querySelector("main")!;
  const stop = initEndpointFilter(root);
  const input = document.querySelector("input")!;
  const groups = root.querySelectorAll<HTMLElement>("section");
  input.value = "post";
  input.dispatchEvent(new Event("input"));
  expect(groups[0].hidden).toBe(false);
  expect(groups[1].hidden).toBe(true);
  expect(root.querySelector("p")!.textContent).toBe("1 of 3 endpoints");
  input.value = "unavailable";
  input.dispatchEvent(new Event("input"));
  expect(root.querySelector("p")!.textContent).toBe("0 of 3 endpoints");
  input.value = "";
  input.dispatchEvent(new Event("input"));
  expect([...groups].every((group) => !group.hidden)).toBe(true);
  stop();
  document.body.replaceChildren();
});
