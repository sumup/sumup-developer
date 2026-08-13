import { mount } from "@cloudflare/nimbus-docs/client";

function initSteps(root: HTMLElement): () => void {
  const lists = root.querySelectorAll<HTMLOListElement>("ol");

  if (
    import.meta.env.DEV &&
    lists.length === 0 &&
    root.querySelector("[data-step]") === null &&
    root.children.length > 0
  ) {
    console.warn(
      "[nimbus] <Steps> expects an ordered list (`1.` items) or <Step> children.",
    );
  }

  lists.forEach((list) => list.setAttribute("role", "list"));

  return () => lists.forEach((list) => list.removeAttribute("role"));
}

mount("[data-steps]", initSteps);
