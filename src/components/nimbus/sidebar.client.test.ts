// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { initSidebarPersistence, initSidebarFilter } from "./sidebar.client";

const teardown: (() => void)[] = [];
afterEach(() => {
  teardown.reverse().forEach((destroy) => destroy());
  teardown.length = 0;
  sessionStorage.clear();
  document.body.replaceChildren();
  vi.restoreAllMocks();
});

it("delegates group and scroll persistence to Nimbus for the desktop sidebar", () => {
  document.body.innerHTML = `<nav data-nb-nav-state="docs" data-nb-nav-scroller="desktop">
    <details data-nb-nav-group="readers"></details>
  </nav><nav><details data-nb-nav-group="mobile"></details></nav>`;
  const root = document.querySelector<HTMLElement>("nav")!;
  Object.defineProperty(root, "clientHeight", { value: 200 });
  teardown.push(initSidebarPersistence(root));
  const group = root.querySelector("details")!;
  group.open = true;
  group.dispatchEvent(new Event("toggle"));
  root.scrollTop = 120;
  window.dispatchEvent(new Event("pagehide"));
  const read = () =>
    JSON.parse(sessionStorage.getItem("nimbus:nav-state:docs")!);
  expect(read()).toMatchObject({ open: ["readers"], scroll: { desktop: 120 } });
  const mobile = document.querySelectorAll("details")[1];
  mobile.open = true;
  mobile.dispatchEvent(new Event("toggle"));
  expect(read().open).toEqual(["readers"]);
  teardown.pop()!();
  group.open = false;
  group.dispatchEvent(new Event("toggle"));
  expect(read().open).toEqual(["readers"]);
});

it("filters nested groups without persisting their temporary open state", async () => {
  document.body.innerHTML = `<nav data-nb-nav-state="api">
    <label><input data-sidebar-filter></label><ul data-sidebar-filterable>
      <li><details data-nb-nav-group="checkouts"><summary>Checkouts</summary><ul><li><a>Create checkout POST</a></li><li><a>Retrieve checkout GET</a></li></ul></details></li>
      <li><details data-nb-nav-group="readers" open><summary>Readers</summary><ul><li><a>List readers GET</a></li></ul></details></li>
    </ul></nav>`;
  sessionStorage.setItem(
    "nimbus:nav-state:api",
    JSON.stringify({ open: ["readers"] }),
  );
  const root = document.querySelector<HTMLElement>("nav")!;
  const list = root.querySelector<HTMLElement>("ul")!;
  const input = root.querySelector("input")!;
  const groups = root.querySelectorAll("details");
  teardown.push(initSidebarPersistence(root), initSidebarFilter(list));
  input.value = "create";
  input.dispatchEvent(new Event("input"));
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(groups[0].open).toBe(true);
  expect((list.children[1] as HTMLElement).hidden).toBe(true);
  expect(
    (groups[0].querySelector("ul")!.children[1] as HTMLElement).hidden,
  ).toBe(true);
  expect(
    JSON.parse(sessionStorage.getItem("nimbus:nav-state:api")!).open,
  ).toEqual(["readers"]);
  input.value = "";
  input.dispatchEvent(new Event("input"));
  await new Promise((resolve) => requestAnimationFrame(resolve));
  expect(groups[0].open).toBe(false);
  expect(groups[1].open).toBe(true);
  expect((list.children[1] as HTMLElement).hidden).toBe(false);
  expect(
    JSON.parse(sessionStorage.getItem("nimbus:nav-state:api")!).open,
  ).toEqual(["readers"]);
});
