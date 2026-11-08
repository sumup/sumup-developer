// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { initPierreCode } from "./pierre-code.client";
import { codeThemes } from "../../lib/codeThemes";

let intersect: IntersectionObserverCallback;
const cleanups: (() => void)[] = [];
beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = callback;
      }
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  // JSDOM does not implement constructed stylesheets; rendering and events
  // still run through the real Pierre component.
  CSSStyleSheet.prototype.replaceSync = () => {};
  document.documentElement.dataset.mode = "light";
});
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  document.body.replaceChildren();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function setup() {
  document.body.innerHTML = `<figure class="nb-code-figure" data-nb-lang="typescript">
    <pre class="astro-code has-focused"><code><span class="line highlighted focused">const <span class="highlighted-word">hello</span> = 1;</span>\n<span class="line diff add">console.log(hello);</span></code></pre>
  </figure>`;
  const pre = document.querySelector<HTMLElement>("pre")!;
  cleanups.push(initPierreCode(pre));
  return { pre, frame: document.querySelector("figure")! };
}
function show() {
  intersect(
    [{ isIntersecting: true }] as IntersectionObserverEntry[],
    {} as IntersectionObserver,
  );
}

it("renders visible snippets with Pierre and preserves notations and clipboard source", async () => {
  const { pre, frame } = setup();
  expect(frame.querySelector("diffs-container")).toBeNull();
  show();
  await vi.waitFor(() =>
    expect(frame.classList.contains("pierre-ready")).toBe(true),
  );
  const root = frame.querySelector("diffs-container")!.shadowRoot!;
  await vi.waitFor(() =>
    expect(root.querySelector(".portal-word")?.textContent).toBe("hello"),
  );
  expect(
    root.querySelector(".portal-highlighted.portal-focused")!.textContent,
  ).toContain("const hello = 1;");
  expect(root.querySelector(".portal-add")!.textContent).toContain(
    "console.log(hello);",
  );
  expect(pre.querySelector("code")!.textContent).toBe(
    "const hello = 1;\nconsole.log(hello);",
  );
  expect(root.querySelector("[data-code]")).not.toBeNull();
  // The client renderer uses the same configured pair as static API samples.
  expect(codeThemes).toEqual({ light: "min-light", dark: "min-dark" });
  await vi.waitFor(() =>
    expect(root.querySelector("style[data-theme-css]")?.textContent).toContain(
      "color-scheme: light",
    ),
  );
  const lightTheme = root.querySelector("style[data-theme-css]")!.textContent;
  document.documentElement.dataset.mode = "dark";
  await vi.waitFor(() =>
    expect(root.querySelector("style[data-theme-css]")?.textContent).toContain(
      "color-scheme: dark",
    ),
  );
  expect(root.querySelector("style[data-theme-css]")!.textContent).not.toBe(
    lightTheme,
  );
  cleanups.pop()!();
  expect(frame.querySelector("diffs-container")).toBeNull();
  expect(frame.classList.contains("pierre-ready")).toBe(false);
});

it("does not create a renderer after teardown during loading", async () => {
  const { frame } = setup();
  show();
  cleanups.pop()!();
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(frame.querySelector("diffs-container")).toBeNull();
  expect(frame.classList.contains("pierre-ready")).toBe(false);
});

it("keeps the server-rendered snippet if viewport observation is unavailable", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const { pre, frame } = setup();
  expect(pre.textContent).toContain("const hello = 1;");
  expect(frame.classList.contains("pierre-ready")).toBe(false);
});
