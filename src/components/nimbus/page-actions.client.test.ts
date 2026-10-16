// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initPageActions } from "./page-actions.client";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

function setup() {
  document.body.innerHTML = `<div data-markdown-url="/guide/index.md">
    <button data-page-actions-copy><span data-page-actions-label>Copy as Markdown</span></button>
  </div>`;
  const destroy = initPageActions(document.querySelector("div")!);
  return { destroy, button: document.querySelector("button")! };
}

it("copies Markdown with writeText when ClipboardItem is unavailable", async () => {
  vi.stubGlobal("ClipboardItem", undefined);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("# Guide")));
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  const { button, destroy } = setup();
  button.click();
  await vi.waitFor(() => expect(button.textContent).toBe("Copied!"));
  expect(writeText).toHaveBeenCalledWith("# Guide");
  expect(button.disabled).toBe(false);
  destroy();
});

it("does not copy an HTTP error response and allows retrying", async () => {
  vi.stubGlobal("ClipboardItem", undefined);
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("Not found", { status: 404 })),
  );
  const writeText = vi.fn();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText },
  });
  const { button, destroy } = setup();
  button.click();
  await vi.waitFor(() => expect(button.textContent).toBe("Couldn't copy"));
  expect(writeText).not.toHaveBeenCalled();
  expect(button.disabled).toBe(false);
  destroy();
});

it("starts ClipboardItem writes during the click, before the fetch resolves", async () => {
  let resolveFetch!: (response: Response) => void;
  vi.stubGlobal(
    "fetch",
    vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveFetch = resolve;
        }),
    ),
  );
  class Item {
    constructor(public data: Record<string, Promise<Blob>>) {}
  }
  vi.stubGlobal("ClipboardItem", Item);
  const write = vi.fn(async ([item]: Item[]) => {
    await item.data["text/plain"];
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { write },
  });
  const { button, destroy } = setup();
  button.click();
  expect(write).toHaveBeenCalledOnce();
  expect(button.disabled).toBe(true);
  resolveFetch(new Response("# Guide"));
  await vi.waitFor(() => expect(button.textContent).toBe("Copied!"));
  destroy();
});
