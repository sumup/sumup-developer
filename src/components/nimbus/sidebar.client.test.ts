// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { initSidebarPersistence } from "./sidebar.client";

describe("sidebar persistence", () => {
  let destroy: (() => void) | undefined;
  afterEach(() => {
    destroy?.();
    sessionStorage.clear();
    document.body.replaceChildren();
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
