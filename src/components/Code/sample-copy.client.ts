import { mount } from "@cloudflare/nimbus-docs/client";

export function initSampleCopy(button: HTMLElement): () => void {
  const root = button.closest(
    ".request-samples, .response-samples, [data-code-group]",
  );
  if (!(button instanceof HTMLButtonElement) || !root) return () => {};
  let resetTimer: number | undefined;
  let disposed = false;
  const reset = () => {
    delete button.dataset.state;
    button.setAttribute("aria-label", "Copy code to clipboard");
  };
  const copy = async () => {
    const pre = [...root.querySelectorAll<HTMLElement>("pre.astro-code")].find(
      (element) => !element.closest("[hidden]"),
    );
    const source = pre?.querySelector("code")?.textContent ?? pre?.textContent;
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      if (disposed) return;
      button.dataset.state = "copied";
      button.setAttribute("aria-label", "Copied!");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(reset, 1500);
    } catch {
      if (!disposed) reset();
    }
  };
  button.disabled = false;
  button.addEventListener("click", copy);
  return () => {
    disposed = true;
    window.clearTimeout(resetTimer);
    button.removeEventListener("click", copy);
    button.disabled = true;
    reset();
  };
}

mount("[data-sample-copy]", initSampleCopy);
