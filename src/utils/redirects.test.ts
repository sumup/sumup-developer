import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";

let output: string;
beforeEach(() => {
  output = mkdtempSync(join(tmpdir(), "sumup-redirects-"));
  mkdirSync(join(output, "guide"));
  writeFileSync(join(output, "guide/index.html"), '<h1 id="start">Guide</h1>');
});
afterEach(() => rmSync(output, { recursive: true, force: true }));
const check = (redirects: string) => {
  writeFileSync(join(output, "_redirects"), redirects);
  return execFileSync(
    process.execPath,
    [resolve("scripts/check-redirects.mjs"), output],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
};

it("validates unused redirects, chains, and destination fragments", () => {
  expect(
    check("/first /second 301\n/second /guide/#start 301\n/old/* /:splat 301"),
  ).toContain("2 static redirect destinations");
});

it.each([
  "/unused /missing 301",
  "/first /second 301\n/second /first 301",
  "/first /guide/#missing 301",
  "/first /guide/ 301\n/first /guide/ 302",
  "/old/* /:splat 301\n/first /guide/ 301",
])(
  "rejects broken or ambiguous redirect rules even without links to them",
  (redirects) => {
    expect(() => check(redirects)).toThrow();
  },
);
