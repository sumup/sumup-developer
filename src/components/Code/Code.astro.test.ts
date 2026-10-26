import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { JSDOM } from "jsdom";
import { expect, it } from "vitest";
import Code from "./Code.astro";

it("uses Nimbus frames and highlighting while preserving code text", async () => {
  const source =
    'const apiKey = process.env.SUMUP_API_KEY;\nconsole.log("sandbox");';
  const container = await AstroContainer.create();
  const dom = new JSDOM(
    await container.renderToString(Code, {
      props: {
        code: source,
        lang: "ts",
        meta: 'title="example.ts" {2} "SUMUP_API_KEY"',
      },
    }),
  );
  const document = dom.window.document;
  expect(document.querySelector("code")!.textContent).toBe(source);
  expect(document.querySelector(".nb-code-title-name")!.textContent).toBe(
    "example.ts",
  );
  expect(document.querySelector(".line.highlighted")!.textContent).toBe(
    'console.log("sandbox");',
  );
  expect(document.querySelector(".highlighted-word")!.textContent).toBe(
    "SUMUP_API_KEY",
  );
  expect(document.querySelector("pre.astro-code span[class]")).not.toBeNull();
  dom.window.close();
});
