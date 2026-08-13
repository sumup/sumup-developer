import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { JSDOM } from "jsdom";

const outputRoot = resolve(process.argv[2] ?? "dist/client");
const siteOrigin = "https://developer.sumup.com";

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? listFiles(path) : [path];
      }),
    )
  ).flat();
}

const files = await listFiles(outputRoot);
const images = files.filter(
  (file) =>
    file.startsWith(`${join(outputRoot, "og")}/`) && file.endsWith(".png"),
);
assert(images.length > 0, "No generated OG images found");

for (const image of images) {
  const png = await readFile(image);
  const name = relative(outputRoot, image);
  assert(
    png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    `${name}: invalid PNG signature`,
  );
  assert.equal(
    png.toString("ascii", 12, 16),
    "IHDR",
    `${name}: missing PNG header`,
  );
  assert.equal(png.readUInt32BE(16), 1200, `${name}: incorrect width`);
  assert.equal(png.readUInt32BE(20), 630, `${name}: incorrect height`);
}

const generatedImages = new Set(images);
let checkedPages = 0;
for (const file of files.filter((file) => file.endsWith(".html"))) {
  const dom = new JSDOM(await readFile(file, "utf8"));
  const imageUrl = dom.window.document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute("content");
  dom.window.close();
  if (!imageUrl) continue;

  const url = new URL(imageUrl, siteOrigin);
  assert.equal(url.origin, siteOrigin, `${file}: unexpected OG image origin`);
  assert(
    generatedImages.has(join(outputRoot, decodeURIComponent(url.pathname))),
    `${relative(outputRoot, file)}: missing generated image ${url.pathname}`,
  );
  checkedPages++;
}
assert(checkedPages > 0, "No pages referencing OG images found");
console.log(
  `Verified ${images.length} OG PNGs and references from ${checkedPages} pages.`,
);
