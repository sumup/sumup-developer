import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { loadRenderers } from "astro:container";
import { getContainerRenderer } from "@astrojs/react/container-renderer";
import { JSDOM } from "jsdom";
import { expect, it } from "vitest";
import GetStarted from "./GetStarted.astro";
import { agentSetupPrompt } from "../../lib/agentSetup";

it("renders copyable sandbox examples and an AI setup prompt in the corresponding integration panels", async () => {
  const renderers = await loadRenderers([getContainerRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const dom = new JSDOM(await container.renderToString(GetStarted));
  const panels = dom.window.document.querySelectorAll('[role="tabpanel"]');
  expect(panels).toHaveLength(3);
  const online = panels[0].querySelector("code")!.textContent!;
  expect(online).toContain("https://api.sumup.com/v0.1/checkouts");
  expect(online).toContain("Bearer $SUMUP_API_KEY");
  // Parse the displayed JSON, catching corruption from highlighting/escaping.
  const data = JSON.parse(online.match(/--data '([\s\S]*)'/)![1]);
  expect(data).toMatchObject({
    merchant_code: "YOUR_MERCHANT_CODE",
    checkout_reference: "YOUR_UNIQUE_REFERENCE",
    hosted_checkout: { enabled: true },
  });
  expect(panels[1].querySelector("code")!.textContent).toContain(
    "https://api.sumup.com/v0.1/merchants/$SUMUP_MERCHANT_CODE/readers",
  );
  expect(panels[2].querySelector("code")!.textContent).toBe(
    "npm install @sumup/sdk",
  );
  for (const panel of panels)
    expect(
      panel.querySelector(".nb-code-figure > pre.astro-code > code"),
    ).not.toBeNull();
  expect(panels[2].querySelector("[data-copy-prompt-text]")!.textContent).toBe(
    agentSetupPrompt,
  );
  expect(
    panels[2].querySelector("button[data-copy-prompt-button]"),
  ).not.toBeNull();
  dom.window.close();
});
