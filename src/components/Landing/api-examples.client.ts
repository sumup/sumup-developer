import { initTabs, mount } from "@cloudflare/nimbus-docs/client";

export function initApiExamples(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>("[data-home-api-task-list]")!;
  const triggers = [
    ...root.querySelectorAll<HTMLAnchorElement>("[data-home-api-task]"),
  ];
  const panels = [
    ...root.querySelectorAll<HTMLElement>("[data-home-api-panel]"),
  ];
  list.role = "tablist";
  triggers.forEach((trigger) => {
    trigger.role = "tab";
  });
  panels.forEach((panel, index) => {
    panel.role = "tabpanel";
    panel.setAttribute("aria-labelledby", triggers[index].id);
  });
  const orientation = () => {
    list.setAttribute(
      "aria-orientation",
      getComputedStyle(list).flexDirection === "column"
        ? "vertical"
        : "horizontal",
    );
  };
  const observer = new ResizeObserver(orientation);
  observer.observe(list);
  orientation();
  const tabs = initTabs({
    container: root,
    tabSelector: "[data-home-api-task]",
    panelSelector: "[data-home-api-panel]",
    onActivate(index) {
      const trigger = triggers[index];
      if (trigger.offsetLeft < list.scrollLeft)
        list.scrollLeft = trigger.offsetLeft;
      else if (
        trigger.offsetLeft + trigger.offsetWidth >
        list.scrollLeft + list.clientWidth
      ) {
        list.scrollLeft =
          trigger.offsetLeft + trigger.offsetWidth - list.clientWidth;
      }
    },
  });
  const click = (event: MouseEvent) => {
    if (
      (event.target as Element).closest("[data-home-api-task]") &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    )
      event.preventDefault();
  };
  const keydown = (event: KeyboardEvent) => {
    if (
      !(event.target as Element).matches("[data-home-api-task]") ||
      !["ArrowUp", "ArrowDown"].includes(event.key)
    )
      return;
    if (list.getAttribute("aria-orientation") !== "vertical") return;
    event.preventDefault();
    const index =
      (tabs.currentIndex +
        (event.key === "ArrowDown" ? 1 : -1) +
        triggers.length) %
      triggers.length;
    tabs.activate(index);
    triggers[index].focus();
  };
  root.addEventListener("click", click);
  root.addEventListener("keydown", keydown);
  root.setAttribute("data-ready", "");
  return () => {
    tabs.destroy();
    observer.disconnect();
    root.removeEventListener("click", click);
    root.removeEventListener("keydown", keydown);
  };
}

mount("[data-home-api-examples]", initApiExamples);
