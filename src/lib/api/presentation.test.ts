import { expect, it } from "vitest";
import { apiSidebar } from "./presentation";

it("adapts API groups, active pages and schema links to shared navigation without method badges", () => {
  const items = apiSidebar([
    {
      coordinate: "api",
      kind: "api",
      label: "API",
      href: "/api/",
      children: [],
    },
    {
      coordinate: "tags.Checkouts",
      kind: "section",
      label: "Checkouts",
      href: "/api/tags/checkouts/",
      expanded: true,
      children: [
        {
          coordinate: "create",
          kind: "operation",
          label: "Create checkout",
          method: "post",
          href: "/api/checkouts/create/",
          active: true,
          children: [],
        },
      ],
    },
    {
      coordinate: "schemas",
      kind: "section",
      label: "Schemas",
      children: [
        {
          coordinate: "Checkout",
          kind: "schema",
          label: "Checkout",
          href: "/api/schemas/checkout/",
          children: [],
        },
      ],
    },
  ]);
  expect(items[1]).toMatchObject({
    type: "group",
    indexHref: "/api/tags/checkouts/",
    collapsed: false,
    children: [
      {
        type: "link",
        href: "/api/checkouts/create/",
        isCurrent: true,
      },
    ],
  });
  expect(items[1]).not.toHaveProperty("children.0.attrs");
  expect(items[2]).toMatchObject({
    type: "group",
    children: [{ href: "/api/schemas/checkout/" }],
  });
  expect(items[0]).toMatchObject({ type: "link", href: "/api/" });
});
