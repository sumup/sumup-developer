import { mount } from "@cloudflare/nimbus-docs/client";

export function initEndpointFilter(root: HTMLElement): () => void {
  const input = root.querySelector<HTMLInputElement>(
    "[data-api-endpoint-filter]",
  );
  if (!input) return () => {};
  const rows = [...root.querySelectorAll<HTMLElement>("[data-api-endpoint]")];
  const groups = [
    ...root.querySelectorAll<HTMLElement>("[data-api-endpoint-group]"),
  ];
  const status = root.querySelector<HTMLElement>("[data-api-endpoint-status]");
  const control = input.closest<HTMLElement>("label");
  if (control) control.hidden = false;
  const filter = () => {
    const query = input.value.trim().toLowerCase();
    rows.forEach((row) => {
      row.hidden = !(row.textContent ?? "").toLowerCase().includes(query);
    });
    groups.forEach((group) => {
      group.hidden = ![
        ...group.querySelectorAll<HTMLElement>("[data-api-endpoint]"),
      ].some((row) => !row.hidden);
    });
    if (status)
      status.textContent = query
        ? `${rows.filter((row) => !row.hidden).length} of ${rows.length} endpoints`
        : "";
  };
  input.addEventListener("input", filter);
  return () => input.removeEventListener("input", filter);
}
mount("[data-api-endpoint-index]", initEndpointFilter);
