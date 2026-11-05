import { initTabs, mount } from "@cloudflare/nimbus-docs/client";
import { initSamples } from "@components/Code/samples";

mount("[data-api-samples]", initSamples);

export function initResponseSamples(root: HTMLElement): () => void {
  root
    .querySelectorAll<HTMLButtonElement>("[data-api-response-trigger]")
    .forEach((button) => {
      button.disabled = false;
    });
  const tabs = initTabs({
    container: root,
    tabSelector: "[data-api-response-trigger]",
    panelSelector: "[data-api-response-panel]",
  });
  root.setAttribute("data-api-response-ready", "");
  return () => tabs.destroy();
}

mount("[data-api-response-samples]", initResponseSamples);
