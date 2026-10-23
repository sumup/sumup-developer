import { mount } from "@cloudflare/nimbus-docs/client";

const COPY_LABEL = "Copy as Markdown";

export function initPageActions(root: HTMLElement) {
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
  let mcpResetTimer: number | undefined;
  const mcpButton = root.querySelector<HTMLButtonElement>(
    "[data-docs-mcp-url]",
  );
  const mcpLabel = mcpButton?.querySelector("[data-docs-mcp-label]");
  const copyMcpUrl = async () => {
    if (!mcpButton?.dataset.docsMcpUrl || !mcpLabel) return;
    window.clearTimeout(mcpResetTimer);
    try {
      await navigator.clipboard.writeText(mcpButton.dataset.docsMcpUrl);
      mcpLabel.textContent = "Copied!";
    } catch {
      mcpLabel.textContent = "Couldn't copy";
    }
    mcpResetTimer = window.setTimeout(() => {
      mcpLabel.textContent = "Copy docs MCP URL";
    }, 1500);
  };

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
      const markdown = fetch(markdownUrl).then((response) => {
        if (!response.ok) {
          throw new Error(`Markdown request failed: ${response.status}`);
        }
        return response.text();
      });
      // Construct ClipboardItem during the click gesture so this works in Safari.
      // Older browsers can still copy through writeText.
      const write =
        typeof ClipboardItem !== "undefined" && navigator.clipboard?.write
          ? navigator.clipboard.write([
              new ClipboardItem({
                "text/plain": markdown.then(
                  (text) => new Blob([text], { type: "text/plain" }),
                ),
              }),
            ])
          : markdown.then((text) => navigator.clipboard.writeText(text));
      write
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
  mcpButton?.addEventListener("click", copyMcpUrl);

  return () => {
    button.removeEventListener("click", handleCopy);
    mcpButton?.removeEventListener("click", copyMcpUrl);
    window.clearTimeout(mcpResetTimer);
    if (resetTimer) {
      window.clearTimeout(resetTimer);
    }
  };
}

mount("[data-page-actions]", initPageActions);
