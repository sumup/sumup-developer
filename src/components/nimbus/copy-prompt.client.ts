import { mount } from "@cloudflare/nimbus-docs/client";

export function initCopyPrompt(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>(
    "[data-copy-prompt-button]",
  );
  const prompt = root.querySelector<HTMLElement>("[data-copy-prompt-text]");
  const status = root.querySelector<HTMLElement>("[data-copy-prompt-status]");
  if (!button || !prompt || !status) return () => {};
  const copy = async () => {
    button.disabled = true;
    try {
      await navigator.clipboard.writeText(prompt.textContent ?? "");
      status.textContent = "Copied!";
    } catch {
      status.textContent = "Couldn't copy. Select and copy the prompt above.";
    } finally {
      button.disabled = false;
    }
  };
  button.addEventListener("click", copy);
  return () => button.removeEventListener("click", copy);
}

mount("[data-copy-prompt]", initCopyPrompt);
