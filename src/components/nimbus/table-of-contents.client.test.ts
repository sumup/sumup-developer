// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initTableOfContents } from "./table-of-contents.client";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

it("clears the section hash for Overview while preserving the query and navigation state", () => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const scrollIntoView = vi.fn();
  document.body.innerHTML = `<h1 id="_top">Guide</h1><h2 id="installation">Installation</h2>
    <nav><select data-mobile-toc-select><option value="_top">Overview</option><option value="installation">Installation</option></select></nav>`;
  document.getElementById("installation")!.scrollIntoView = scrollIntoView;
  history.replaceState({ navigation: "keep" }, "", "/guide/?lang=python");
  const root = document.querySelector("nav")!;
  const select = root.querySelector("select")!;
  const destroy = initTableOfContents(root);
  try {
    select.value = "installation";
    select.dispatchEvent(new Event("change"));
    expect(location.hash).toBe("#installation");
    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: "auto",
      block: "start",
    });
    select.value = "_top";
    select.dispatchEvent(new Event("change"));
    expect(location.pathname + location.search + location.hash).toBe(
      "/guide/?lang=python",
    );
    expect(history.state).toEqual({ navigation: "keep" });
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  } finally {
    destroy();
  }
});
