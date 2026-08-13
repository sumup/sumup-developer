import { mount } from "@cloudflare/nimbus-docs/client";

const COPY_LABEL = "Copy as Markdown";

function initPageActions(root: HTMLElement) {
  const button = root.querySelector<HTMLButtonElement>(
    "[data-page-actions-copy]",
  );
  const copyIcon = root.querySelector<HTMLElement>(
    "[data-page-actions-copy-icon]",
  );
  const checkIcon = root.querySelector<HTMLElement>(
    "[data-page-actions-check-icon]",
  );
  const label = root.querySelector<HTMLElement>("[data-page-actions-label]");
  const markdownUrl = root.dataset.markdownUrl;

  if (!button || !markdownUrl) {
    return () => {};
  }

  let resetTimer: number | undefined;

  const showState = (state: "copied" | "error") => {
    copyIcon?.toggleAttribute("hidden", state === "copied");
    checkIcon?.toggleAttribute("hidden", state !== "copied");
    if (label) {
      label.textContent = state === "copied" ? "Copied!" : "Couldn't copy";
    }

    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }
    resetTimer = window.setTimeout(() => {
      copyIcon?.removeAttribute("hidden");
      checkIcon?.setAttribute("hidden", "");
      if (label) {
        label.textContent = COPY_LABEL;
      }
    }, 1500);
  };

  const handleCopy = () => {
    button.disabled = true;

    try {
      // Construct ClipboardItem during the click gesture so this works in Safari.
      const item = new ClipboardItem({
        "text/plain": fetch(markdownUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Markdown request failed: ${response.status}`);
            }
            return response.text();
          })
          .then((markdown) => new Blob([markdown], { type: "text/plain" })),
      });

      navigator.clipboard
        .write([item])
        .then(
          () => showState("copied"),
          () => showState("error"),
        )
        .finally(() => {
          button.disabled = false;
        });
    } catch {
      showState("error");
      button.disabled = false;
    }
  };

  button.addEventListener("click", handleCopy);

  return () => {
    button.removeEventListener("click", handleCopy);
    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }
  };
}

mount("[data-page-actions]", initPageActions);
