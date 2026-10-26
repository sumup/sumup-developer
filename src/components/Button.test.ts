import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { JSDOM } from "jsdom";
import { afterEach, expect, it, vi } from "vitest";
import Button from "./Button";
import AgentLogos from "./nimbus/AgentLogos";

afterEach(() => vi.unstubAllEnvs());

it("renders the agent logos with a text label under Circuit's development validation", () => {
  vi.stubEnv("NODE_ENV", "development");
  const html = renderToStaticMarkup(
    createElement(Button, {
      label: "Copy setup prompt",
      icon: AgentLogos,
      type: "button",
    }),
  );
  const dom = new JSDOM(html);
  try {
    const button = dom.window.document.querySelector("button")!;
    expect(button.textContent).toContain("Copy setup prompt");
    expect(button.querySelectorAll(".agent-logo")).toHaveLength(3);
    expect(
      button.querySelector(".agent-logos")?.getAttribute("aria-hidden"),
    ).toBe("true");
  } finally {
    dom.window.close();
  }
});
