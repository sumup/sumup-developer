// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initCodeGroup } from "./code-group.client";
import { initSamples } from "./samples";

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  document.body.replaceChildren();
  localStorage.clear();
  history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

function group(label = "Python", language = "python") {
  const root = document.createElement("section");
  root.dataset.codeGroup = "";
  root.innerHTML = `<div data-disabled><select data-api-sample-select disabled></select></div>
    <div data-api-sample="cURL"><figure data-nb-lang="bash"><pre>curl example</pre></figure></div>
    <div data-api-sample="${label}"><figure data-nb-lang="${language}"><pre>sdk example</pre></figure></div>`;
  document.body.append(root);
  cleanups.push(initCodeGroup(root));
  return root;
}

it("restores the preferred language and switches the visible example", () => {
  localStorage.setItem("nb-api-code-rail__lang", "python");
  const root = group();
  const select = root.querySelector("select")!;
  expect([...select.options].map((option) => option.label)).toEqual([
    "cURL",
    "Python",
  ]);
  expect(select.disabled).toBe(false);
  expect(select.value).toBe("Python");
  expect(
    root.querySelector<HTMLElement>('[data-api-sample="cURL"]')!.hidden,
  ).toBe(true);
  expect(
    root.querySelector<HTMLElement>('[data-api-sample="Python"]')!.hidden,
  ).toBe(false);

  select.value = "cURL";
  select.dispatchEvent(new Event("change"));
  const visible = root.querySelector<HTMLElement>(
    "[data-api-sample]:not([hidden])",
  )!;
  expect(visible.querySelector("pre")!.textContent).toBe("curl example");
  expect(localStorage.getItem("nb-api-code-rail__lang")).toBe("bash");
});

it("restores linked samples before the saved preference", () => {
  localStorage.setItem("nb-api-code-rail__lang", "bash");
  history.replaceState(null, "", "/guide/?lang=Python");
  expect(group().querySelector("select")!.value).toBe("Python");
});

it("matches short code-fence languages to the API's saved language", () => {
  localStorage.setItem("nb-api-code-rail__lang", "typescript");
  expect(group("JavaScript", "ts").querySelector("select")!.value).toBe(
    "JavaScript",
  );
});

it("restores linked languages when storage is blocked", () => {
  history.replaceState(null, "", "/guide/?lang=python");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  expect(group().querySelector("select")!.value).toBe("Python");
});

it("shares language selection with other groups and the API reference, then removes listeners", () => {
  const first = group();
  const second = group();
  const api = document.createElement("section");
  api.innerHTML = `<select data-api-sample-select><option value="python-sdk">Python SDK</option><option value="curl">cURL</option></select>
    <div data-api-sample="python-sdk" data-api-language="python"></div>
    <div data-api-sample="curl" data-api-language="bash"></div>`;
  document.body.append(api);
  cleanups.push(initSamples(api));
  const apiSelect = api.querySelector("select")!;
  apiSelect.value = "curl";
  apiSelect.dispatchEvent(new Event("change"));
  const select = first.querySelector("select")!;
  select.value = "Python";
  select.dispatchEvent(new Event("change"));
  expect(second.querySelector("select")!.value).toBe("Python");
  expect(apiSelect.value).toBe("python-sdk");

  cleanups.pop()!();
  select.value = "cURL";
  select.dispatchEvent(new Event("change"));
  expect(apiSelect.value).toBe("python-sdk");
});
