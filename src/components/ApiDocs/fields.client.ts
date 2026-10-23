import { initDisclosureGroup, mount } from "@cloudflare/nimbus-docs/client";

mount("[data-api-fields], [data-api-responses]", (root) => {
  const toggleAll = root.querySelector<HTMLElement>("[data-api-toggle-all]");
  if (toggleAll) toggleAll.hidden = false;
  const instance = initDisclosureGroup({
    root,
    toggleAll,
    deepLink: true,
  });
  return () => instance.destroy();
});
