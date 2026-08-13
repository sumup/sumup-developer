import { initTabs, mount } from "@cloudflare/nimbus-docs/client";

let counter = 0;

const keepTriggerVisible = (tablist: HTMLElement, trigger: HTMLElement) => {
  const tablistRect = tablist.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();

  if (triggerRect.left < tablistRect.left) {
    tablist.scrollLeft -= tablistRect.left - triggerRect.left;
  } else if (triggerRect.right > tablistRect.right) {
    tablist.scrollLeft += triggerRect.right - tablistRect.right;
  }
};

mount("[data-nb-tabs]", (container) => {
  const id = `portal-tabs-${counter++}`;
  const tablist = container.querySelector<HTMLElement>("[role='tablist']");
  const panels = Array.from(
    container.querySelectorAll<HTMLElement>("[data-nb-tabs-content]"),
  ).filter((panel) => panel.closest("[data-nb-tabs]") === container);

  if (!tablist) return () => {};

  panels.forEach((panel, index) => {
    const button = document.createElement("button");
    const panelId = `${id}-panel-${index}`;
    const tabId = `${id}-tab-${index}`;
    button.type = "button";
    button.role = "tab";
    button.id = tabId;
    button.textContent = panel.dataset.nbTabLabel ?? "Tab";
    button.setAttribute("aria-controls", panelId);
    button.setAttribute("data-nb-tabs-trigger", "");
    panel.id = panelId;
    panel.setAttribute("aria-labelledby", tabId);
    tablist.append(button);
  });

  const syncKey = container.dataset.nbSyncKey;
  const instance = initTabs({
    container,
    tabSelector: "[data-nb-tabs-trigger]",
    panelSelector: "[data-nb-tabs-content]",
    boundarySelector: "[data-nb-tabs]",
    sync: syncKey ? { key: `portal-synced-tabs__${syncKey}` } : undefined,
    onActivate(index) {
      const trigger = tablist.querySelectorAll<HTMLElement>(
        "[data-nb-tabs-trigger]",
      )[index];
      if (trigger) keepTriggerVisible(tablist, trigger);
    },
  });

  return () => {
    instance.destroy();
    tablist.replaceChildren();
  };
});
