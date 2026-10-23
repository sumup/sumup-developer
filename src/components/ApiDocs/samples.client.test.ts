// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { initResponseSamples, initSamples } from "./samples.client";

let destroy: (() => void) | undefined;
afterEach(() => {
  destroy?.();
  localStorage.clear();
  history.replaceState(null, "", "/");
  document.body.replaceChildren();
});

function samples(restore?: (root: HTMLElement) => void) {
  document.body.innerHTML = `<section>
    <div data-disabled="true"><select data-api-sample-select disabled>
      <option value="python">Python SDK</option><option value="python-2">Python HTTP</option><option value="curl">cURL</option>
    </select></div>
    <div data-api-sample="python" data-api-language="python">SDK</div>
    <div data-api-sample="python-2" data-api-language="python" hidden>HTTP</div>
    <div data-api-sample="curl" data-api-language="bash" hidden>cURL</div>
  </section>`;
  const root = document.querySelector("section")!;
  restore?.(root);
  destroy = initSamples(root);
  return root;
}

it("writes an exact sample link and language preference while preserving other URL state", () => {
  history.replaceState(null, "", "/api/example/?other=keep#field");
  const root = samples();
  const select = root.querySelector("select")!;
  select.value = "python-2";
  select.dispatchEvent(new Event("change"));
  expect(new URL(location.href).searchParams.get("lang")).toBe("python-2");
  expect(localStorage.getItem("nb-api-code-rail__lang")).toBe("python");
  expect(
    root.querySelector<HTMLElement>('[data-api-sample="python"]')!.hidden,
  ).toBe(true);
  select.value = "curl";
  select.dispatchEvent(new Event("change"));
  expect(new URL(location.href).searchParams.get("lang")).toBe("curl");
  expect(new URL(location.href).searchParams.get("other")).toBe("keep");
  expect(location.hash).toBe("#field");
  expect(localStorage.getItem("nb-api-code-rail__lang")).toBe("bash");
});

it("synchronizes language changes from another tab and removes listeners on teardown", () => {
  const root = samples();
  const select = root.querySelector("select")!;
  expect(select.value).toBe("python");
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "nb-api-code-rail__lang",
      newValue: "bash",
    }),
  );
  expect(select.value).toBe("curl");
  expect(select.disabled).toBe(false);
  expect(select.closest("[data-disabled]")).toBeNull();
  destroy?.();
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: "nb-api-code-rail__lang",
      newValue: "python",
    }),
  );
  expect(select.value).toBe("curl");
});

it("keeps the pre-paint selection when the deferred controller attaches", () => {
  localStorage.setItem("nb-api-code-rail__lang", "bash");
  const root = samples((root) => {
    root.setAttribute("data-api-samples-restored", "");
    root.querySelector<HTMLSelectElement>("select")!.value = "python-2";
    root.querySelectorAll<HTMLElement>("[data-api-sample]").forEach((panel) => {
      panel.hidden = panel.dataset.apiSample !== "python-2";
    });
  });
  expect(root.querySelector<HTMLSelectElement>("select")!.value).toBe(
    "python-2",
  );
  expect(root.querySelectorAll("[data-api-sample]:not([hidden])")).toHaveLength(
    1,
  );
  expect(
    root.querySelector<HTMLElement>('[data-api-sample="python-2"]')!.hidden,
  ).toBe(false);
});

it("switches response examples by keyboard without changing the request sample", () => {
  const request = samples();
  const select = request.querySelector("select")!;
  select.value = "python-2";
  select.dispatchEvent(new Event("change"));
  const response = document.createElement("section");
  response.innerHTML = `<div role="tablist">
    <button role="tab" id="response-200" aria-controls="body-200" data-api-response-trigger disabled>200</button>
    <button role="tab" id="response-400" aria-controls="body-400" data-api-response-trigger disabled>400</button>
  </div>
  <div role="tabpanel" id="body-200" aria-labelledby="response-200" data-api-response-panel>Success</div>
  <div role="tabpanel" id="body-400" aria-labelledby="response-400" data-api-response-panel>Error</div>`;
  document.body.append(response);
  const stopRequest = destroy;
  const stopResponse = initResponseSamples(response);
  destroy = () => {
    stopRequest?.();
    stopResponse();
  };
  const [success, error] = response.querySelectorAll("button");
  expect(success.disabled).toBe(false);
  expect(error.disabled).toBe(false);
  expect(response.querySelector<HTMLElement>("#body-400")!.hidden).toBe(true);
  success.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
  );
  expect(error.getAttribute("aria-selected")).toBe("true");
  expect(error.tabIndex).toBe(0);
  expect(document.activeElement).toBe(error);
  expect(response.querySelector<HTMLElement>("#body-200")!.hidden).toBe(true);
  expect(response.querySelector<HTMLElement>("#body-400")!.hidden).toBe(false);
  error.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
  );
  expect(success.getAttribute("aria-selected")).toBe("true");
  expect(select.value).toBe("python-2");
  expect(new URL(location.href).searchParams.get("lang")).toBe("python-2");
});
