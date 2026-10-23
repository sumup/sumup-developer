// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { initSidebarPersistence } from "./sidebar.client";

describe("sidebar persistence", () => {
  let destroy: (() => void) | undefined;
  afterEach(() => {
    destroy?.();
    sessionStorage.clear();
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it("restores scroll only for matching navigation and brings an offscreen active page into view", () => {
    document.body.innerHTML = `<nav><ul><li><a href="/readers/" aria-current="page">Readers</a></li></ul></nav>`;
    const host = document.querySelector("nav")!;
    const root = document.querySelector("ul")!;
    sessionStorage.setItem(
      "portal-sidebar-scroll",
      JSON.stringify({ signature: "/readers/", scroll: 80 }),
    );
    let frame: FrameRequestCallback | undefined;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frame = callback;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
    Object.defineProperty(host, "clientHeight", { value: 200 });
    vi.spyOn(host, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 200,
    } as DOMRect);
    vi.spyOn(root.querySelector("a")!, "getBoundingClientRect").mockReturnValue(
      { top: 400, bottom: 420, height: 20 } as DOMRect,
    );
    destroy = initSidebarPersistence(root);
    expect(host.scrollTop).toBe(80);
    frame!(0);
    expect(host.scrollTop).toBe(390);
    host.scrollTop = 120;
    window.dispatchEvent(new Event("pagehide"));
    expect(
      JSON.parse(sessionStorage.getItem("portal-sidebar-scroll")!).scroll,
    ).toBe(120);
    destroy();
    root.querySelector("a")!.href = "/checkouts/";
    host.scrollTop = 0;
    destroy = initSidebarPersistence(root);
    expect(host.scrollTop).toBe(0);
  });

  it("restores desktop groups without closing the active group or changing mobile groups", () => {
    document.body.innerHTML = `
      <nav data-sidebar-persist>
        <details data-sidebar-group data-sidebar-key="/api/readers/"></details>
        <details data-sidebar-group data-sidebar-key="/api/checkouts/" data-has-active="true" open></details>
      </nav>
      <nav data-mobile-sidebar>
        <details data-sidebar-group data-sidebar-key="/api/readers/"></details>
      </nav>`;
    sessionStorage.setItem(
      "portal-sidebar-groups",
      JSON.stringify({
        "/api/readers/": true,
        "/api/checkouts/": false,
      }),
    );
    destroy = initSidebarPersistence(
      document.querySelector("[data-sidebar-persist]")!,
    );
    const groups = document.querySelectorAll("details");
    expect(Array.from(groups, (group) => group.open)).toEqual([
      true,
      true,
      false,
    ]);
    groups[0].open = false;
    groups[0].dispatchEvent(new Event("toggle"));
    expect(
      JSON.parse(sessionStorage.getItem("portal-sidebar-groups")!)[
        "/api/readers/"
      ],
    ).toBe(false);
    destroy();
    groups[0].open = true;
    groups[0].dispatchEvent(new Event("toggle"));
    expect(
      JSON.parse(sessionStorage.getItem("portal-sidebar-groups")!)[
        "/api/readers/"
      ],
    ).toBe(false);
  });

  it("ignores malformed stored state", () => {
    document.body.innerHTML = `<nav><details data-sidebar-group data-sidebar-key="readers"></details></nav>`;
    sessionStorage.setItem("portal-sidebar-groups", '{"readers":"false"}');
    destroy = initSidebarPersistence(document.querySelector("nav")!);
    expect(document.querySelector("details")!.open).toBe(false);
  });
});

it("filters collapsed navigation groups and restores their open state when cleared", async () => {
  const { initSidebarFilter } = await import("./sidebar.client");
  document.body.innerHTML = `<label><input data-sidebar-filter></label><ul>
    <li><details><summary>Checkouts</summary><ul><li><a>Create checkout POST</a></li><li><a>Retrieve checkout GET</a></li></ul></details></li>
    <li><details open><summary>Readers</summary><ul><li><a>List readers GET</a></li></ul></details></li>
  </ul>`;
  const root = document.querySelector("ul")!;
  const input = document.querySelector("input")!;
  const groups = root.querySelectorAll("details");
  const stop = initSidebarFilter(root);
  input.value = "create";
  input.dispatchEvent(new Event("input"));
  expect(groups[0].open).toBe(true);
  expect((root.children[1] as HTMLElement).hidden).toBe(true);
  expect(
    (groups[0].querySelector("ul")!.children[1] as HTMLElement).hidden,
  ).toBe(true);
  input.value = "";
  input.dispatchEvent(new Event("input"));
  expect(groups[0].open).toBe(false);
  expect(groups[1].open).toBe(true);
  expect((root.children[1] as HTMLElement).hidden).toBe(false);
  stop();
  document.body.replaceChildren();
});
