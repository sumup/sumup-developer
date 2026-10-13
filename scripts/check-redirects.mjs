import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { renderedSite, siteOrigin } from "./lib/rendered-site.mjs";

const output = resolve(process.argv[2] ?? "dist/client");
const site = await renderedSite(output);
assert(site.htmlFiles.length, "No rendered pages found");
const lines = (await readFile(join(output, "_redirects"), "utf8"))
  .split(/\r?\n/)
  .filter((line) => line.trim() && !line.trim().startsWith("#"));
const sources = new Set();
let dynamic = false;
let checked = 0;
for (const line of lines) {
  const fields = line.trim().split(/\s+/);
  assert(
    fields.length === 2 || fields.length === 3,
    `Invalid redirect: ${line}`,
  );
  const [from, to, status = "302"] = fields;
  assert(
    [301, 302, 303, 307, 308].includes(Number(status)),
    `Invalid redirect status: ${line}`,
  );
  assert(
    from.startsWith("/") && !/[?#]/.test(from),
    `Invalid redirect source: ${from}`,
  );
  assert(!sources.has(from), `Duplicate redirect source: ${from}`);
  sources.add(from);
  assert(
    from !== to && from.replaceAll("*", ":splat") !== to,
    `Self redirect: ${line}`,
  );
  if (from.includes("*") || /:[A-Za-z]\w*/.test(from)) {
    dynamic = true;
    continue;
  }
  assert(!dynamic, `Static redirects must precede dynamic redirects: ${from}`);
  const target = site.resolve(new URL(from, siteOrigin));
  assert(target, `Redirect destination is missing or loops: ${line}`);
  const fragment = decodeURIComponent(target.url.hash.slice(1).split(":~:")[0]);
  if (fragment && target.file?.endsWith(".html")) {
    assert(
      (await site.page(target.file)).ids.has(fragment),
      `Redirect fragment is missing: ${line}`,
    );
  }
  checked++;
}
console.log(
  `Verified ${checked} static redirect destinations, chains, and fragments; ${lines.length} rules have valid ordering and unique sources.`,
);
