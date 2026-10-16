import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";

let output: string;
beforeEach(() => {
  output = mkdtempSync(join(tmpdir(), "sumup-rendered-links-"));
  mkdirSync(join(output, "guide"));
  writeFileSync(
    join(output, "guide/index.html"),
    '<h1 id="start">Guide</h1><a name="legacy"></a>',
  );
  writeFileSync(
    join(output, "_redirects"),
    "/old/* /:splat 301\n/first /second 301\n/second /guide/ 301\n/loop /loop 301\n",
  );
});
afterEach(() => rmSync(output, { recursive: true, force: true }));
const check = () =>
  execFileSync(
    process.execPath,
    [resolve("scripts/check-rendered-links.mjs"), output],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );

it("checks local fragments, relative URLs, and redirect chains outside the API reference", () => {
  writeFileSync(
    join(output, "index.html"),
    `<h1 id="home">Home</h1>
    <a href="#home">Home</a><a href="guide/#start">Guide</a>
    <a href="/old/guide/#legacy">Legacy guide</a><a href="/first#start">Chain</a>
    <a href="https://example.com/missing#missing">External</a>`,
  );
  expect(check()).toContain(
    "4 internal links and 4 fragments across 2 rendered pages",
  );
});

it.each(["/missing/", "/guide/#missing", "/loop"])(
  "rejects a broken homepage link: %s",
  (href) => {
    writeFileSync(join(output, "index.html"), `<a href="${href}">Broken</a>`);
    expect(check).toThrow();
  },
);
