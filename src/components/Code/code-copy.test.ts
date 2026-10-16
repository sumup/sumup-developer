// @vitest-environment jsdom
import { codeCopy } from "@cloudflare/nimbus-docs/client";
import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  document.dispatchEvent(new Event("astro:before-swap"));
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it("copies highlighted source without markup and removes buttons on page swaps", async () => {
  document.body.innerHTML = `<figure class="nb-code-figure"><pre class="astro-code"><code><span class="line"><span>curl</span> "$SUMUP_API_KEY"</span>\n<span class="line">  --data '{"amount":12}'</span></code></pre></figure>`;
  const expected = document.querySelector("code")!.textContent;
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  codeCopy();
  document.dispatchEvent(new Event("astro:page-load"));
  const button = document.querySelector<HTMLButtonElement>(".nb-code-copy")!;
  expect(button.getAttribute("aria-label")).toBe("Copy code to clipboard");
  button.click();
  await vi.waitFor(() => expect(button.dataset.state).toBe("copied"));
  expect(writeText).toHaveBeenCalledWith(expected);
  document.dispatchEvent(new Event("astro:before-swap"));
  expect(document.querySelector(".nb-code-copy")).toBeNull();
  document.dispatchEvent(new Event("astro:page-load"));
  expect(document.querySelectorAll(".nb-code-copy")).toHaveLength(1);
});
