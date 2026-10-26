// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initCopyPrompt } from "./copy-prompt.client";
import { agentSetupPrompt } from "../../lib/agentSetup";

afterEach(() => {
  vi.restoreAllMocks();
  document.body.replaceChildren();
});

it("copies the visible setup prompt and explains how to recover when clipboard access fails", async () => {
  document.body.innerHTML = `<div><p data-copy-prompt-text></p>
    <button data-copy-prompt-button>Copy</button><span data-copy-prompt-status></span></div>`;
  document.querySelector("p")!.textContent = agentSetupPrompt;
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  const destroy = initCopyPrompt(document.querySelector("div")!);
  document.querySelector("button")!.click();
  await vi.waitFor(() =>
    expect(document.querySelector("span")!.textContent).toBe("Copied!"),
  );
  expect(writeText).toHaveBeenCalledWith(agentSetupPrompt);
  writeText.mockRejectedValueOnce(new Error("Permission denied"));
  document.querySelector("button")!.click();
  await vi.waitFor(() =>
    expect(document.querySelector("span")!.textContent).toContain(
      "Select and copy",
    ),
  );
  destroy();
});

it("copies the hidden compact prompt and reveals it only if clipboard access fails", async () => {
  document.body.innerHTML = `<div>
    <button data-copy-prompt-button>Copy</button>
    <span data-copy-prompt-status></span>
    <p data-copy-prompt-text hidden></p>
  </div>`;
  document.querySelector("p")!.textContent = agentSetupPrompt;
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  });
  const destroy = initCopyPrompt(document.querySelector("div")!);
  document.querySelector("button")!.click();
  await vi.waitFor(() =>
    expect(document.querySelector("span")!.textContent).toBe("Copied!"),
  );
  expect(writeText).toHaveBeenCalledWith(agentSetupPrompt);
  expect(document.querySelector("p")!.hidden).toBe(true);
  writeText.mockRejectedValueOnce(new Error("Permission denied"));
  document.querySelector("button")!.click();
  await vi.waitFor(() =>
    expect(document.querySelector("p")!.hidden).toBe(false),
  );
  expect(writeText).toHaveBeenCalledWith(agentSetupPrompt);
  expect(document.querySelector("button")!.disabled).toBe(false);
  expect(document.querySelector("span")!.textContent).toContain(
    "Select and copy",
  );
  destroy();
});
