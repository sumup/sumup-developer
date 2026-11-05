// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initSampleCopy } from "./sample-copy.client";

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => cleanup());
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

function fixture(kind: "docs" | "request" | "response") {
  const root = document.createElement("section");
  if (kind === "docs") root.dataset.codeGroup = "";
  else root.className = `${kind}-samples`;
  root.innerHTML = `<header class="sample-header"><div class="sample-controls">
    <button data-sample-copy disabled aria-label="Copy code to clipboard"></button>
  </div></header><div class="sample-body">
    <div hidden><pre class="astro-code"><code>inactive</code></pre></div>
    <div><pre class="astro-code"><code><span>curl</span> example\n  --data '{"amount":12}'</code></pre></div>
  </div>`;
  document.body.append(root);
  const button = root.querySelector<HTMLButtonElement>("[data-sample-copy]")!;
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  cleanups.push(initSampleCopy(button));
  return { root, button, writeText };
}

it.each(["docs", "request", "response"] as const)(
  "copies the active %s example from a button inside the header controls",
  async (kind) => {
    const { root, button, writeText } = fixture(kind);
    expect(button.disabled).toBe(false);
    button.click();
    await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
    expect(writeText).toHaveBeenLastCalledWith(
      "curl example\n  --data '{\"amount\":12}'",
    );

    const panels = root.querySelectorAll<HTMLElement>(".sample-body > div");
    panels[0].hidden = false;
    panels[1].hidden = true;
    button.click();
    await vi.waitFor(() =>
      expect(writeText).toHaveBeenLastCalledWith("inactive"),
    );
  },
);

it("does not report success when clipboard access fails", async () => {
  const { button, writeText } = fixture("docs");
  writeText.mockRejectedValue(new Error("Clipboard blocked"));
  button.click();
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  expect(button.dataset.state).toBeUndefined();
  expect(button.getAttribute("aria-label")).toBe("Copy code to clipboard");
});

it("ignores clipboard completion after teardown", async () => {
  const { button, writeText } = fixture("docs");
  let finish!: () => void;
  writeText.mockReturnValue(
    new Promise<void>((resolve) => {
      finish = resolve;
    }),
  );
  button.click();
  cleanups.pop()!();
  finish();
  await vi.waitFor(() => expect(writeText).toHaveBeenCalledOnce());
  expect(button.dataset.state).toBeUndefined();
  expect(button.disabled).toBe(true);
});

it("removes the listener and feedback on page swaps", async () => {
  const { button, writeText } = fixture("request");
  button.click();
  await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
  cleanups.pop()!();
  button.disabled = false;
  button.click();
  expect(writeText).toHaveBeenCalledOnce();
  expect(button.dataset.state).toBeUndefined();
});
