import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { renderedSite, siteOrigin } from "./lib/rendered-site.mjs";

export async function checkOgImages(site) {
  const { outputRoot, files } = site;
  const images = files.filter(
    (file) =>
      file.startsWith(`${join(outputRoot, "og")}/`) && file.endsWith(".png"),
  );
  assert(images.length > 0, "No generated OG images found");

  for (const image of images) {
    const png = await readFile(image);
    const name = site.outputPath(image);
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
  for (const file of site.htmlFiles) {
    const imageUrl = (await site.page(file)).ogImageUrl;
    if (!imageUrl) continue;

    const url = new URL(imageUrl, siteOrigin);
    assert.equal(url.origin, siteOrigin, `${file}: unexpected OG image origin`);
    assert(
      generatedImages.has(join(outputRoot, decodeURIComponent(url.pathname))),
      `${site.outputPath(file)}: missing generated image ${url.pathname}`,
    );
    checkedPages++;
  }
  assert(checkedPages > 0, "No pages referencing OG images found");
  console.log(
    `Verified ${images.length} OG PNGs and references from ${checkedPages} pages.`,
  );
}

if (import.meta.main) {
  await checkOgImages(
    await renderedSite(resolve(process.argv[2] ?? "dist/client")),
  );
}
