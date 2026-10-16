// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SearchResult } from "@cloudflare/nimbus-docs/types";
import { initSearchDialog } from "./search.client";

describe("search dialog", () => {
  let dialog: HTMLDialogElement & { openSearch?: () => void };
  let input: HTMLInputElement;
  let destroy: () => void;
  let search: ReturnType<
    typeof vi.fn<(query: string) => Promise<SearchResult[]>>
  >;

  const result = (title: string): SearchResult[] => [
    { title, url: `/${title}/` },
  ];
  const type = (value: string) => {
    input.value = value;
    input.dispatchEvent(new Event("input"));
  };
  const results = () =>
    Array.from(
      dialog.querySelectorAll("[role=option]"),
      (node) => node.textContent,
    );

  beforeEach(() => {
    vi.useFakeTimers();
    document.body.innerHTML = `<dialog data-search-dialog>
      <input data-search-input>
      <div data-search-results><p data-search-empty></p></div>
      <button data-search-close></button>
    </dialog>`;
    dialog = document.querySelector("dialog")!;
    input = dialog.querySelector("input")!;
    dialog.showModal = () => {
      dialog.open = true;
    };
    search = vi.fn();
    destroy = initSearchDialog(dialog, search);
  });

  afterEach(() => {
    destroy();
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it("shows only the latest query when requests resolve out of order", async () => {
    const old = Promise.withResolvers<SearchResult[]>();
    const latest = Promise.withResolvers<SearchResult[]>();
    search.mockReturnValueOnce(old.promise).mockReturnValueOnce(latest.promise);
    type("old");
    await vi.advanceTimersByTimeAsync(150);
    type("latest");
    await vi.advanceTimersByTimeAsync(150);
    latest.resolve(result("latest"));
    await vi.advanceTimersByTimeAsync(0);
    old.resolve(result("old"));
    await vi.advanceTimersByTimeAsync(0);
    expect(results()).toEqual(["latest"]);
  });

  it("invalidates a request immediately when the input is cleared", async () => {
    const pending = Promise.withResolvers<SearchResult[]>();
    search.mockReturnValue(pending.promise);
    type("pending");
    await vi.advanceTimersByTimeAsync(150);
    type("");
    pending.resolve(result("pending"));
    await vi.advanceTimersByTimeAsync(0);
    expect(results()).toEqual([]);
    await vi.advanceTimersByTimeAsync(150);
    expect(dialog.querySelector("[data-search-empty]")?.textContent).toBe(
      "Type to search…",
    );
  });

  it("does not let a stale error replace the current results", async () => {
    const old = Promise.withResolvers<SearchResult[]>();
    search
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(result("latest"));
    type("old");
    await vi.advanceTimersByTimeAsync(150);
    type("latest");
    await vi.advanceTimersByTimeAsync(150);
    old.reject(new Error("Failed to load search"));
    await vi.advanceTimersByTimeAsync(0);
    expect(results()).toEqual(["latest"]);
    expect(
      dialog.querySelector<HTMLElement>("[data-search-empty]")?.hidden,
    ).toBe(true);
  });

  it("discards pending results when the dialog is reopened", async () => {
    const pending = Promise.withResolvers<SearchResult[]>();
    search.mockReturnValue(pending.promise);
    type("pending");
    await vi.advanceTimersByTimeAsync(150);
    dialog.dispatchEvent(new Event("close"));
    dialog.openSearch?.();
    pending.resolve(result("pending"));
    await vi.advanceTimersByTimeAsync(0);
    expect(input.value).toBe("");
    expect(results()).toEqual([]);
  });

  it("cancels queued searches on close and ignores errors after teardown", async () => {
    type("queued");
    dialog.dispatchEvent(new Event("close"));
    await vi.advanceTimersByTimeAsync(150);
    expect(search).not.toHaveBeenCalled();
    const pending = Promise.withResolvers<SearchResult[]>();
    search.mockReturnValue(pending.promise);
    type("pending");
    await vi.advanceTimersByTimeAsync(150);
    const before = dialog.innerHTML;
    destroy();
    pending.reject(new Error("Failed after teardown"));
    await vi.advanceTimersByTimeAsync(0);
    expect(dialog.innerHTML).toBe(before);
  });
});
