import { resolve } from "node:path";
import { renderedSite, siteOrigin } from "./lib/rendered-site.mjs";

const site = await renderedSite(resolve(process.argv[2] ?? "dist/client"));
if (!site.htmlFiles.length) throw new Error("No rendered HTML pages found.");
const failures = new Set();
let checkedLinks = 0;
let checkedFragments = 0;
let checkedImages = 0;
for (const file of site.htmlFiles) {
  const source = site.outputPath(file);
  const document = await site.page(file);
  for (const image of document.images) {
    checkedImages++;
    if (image.alt === null)
      failures.add(
        `${source}: image ${image.src} is missing an alt attribute (use alt="" for decorative images)`,
      );
    else if (image.alt.length > 0 && !image.alt.trim())
      failures.add(
        `${source}: image ${image.src} has whitespace-only alt text`,
      );
  }
  for (const href of document.links) {
    if (!href.trim() || href.trim() === "#") {
      failures.add(`${source}: empty link destination ${JSON.stringify(href)}`);
      continue;
    }
    const url = new URL(href, site.urlForFile(file));
    if (url.origin !== siteOrigin) continue;
    checkedLinks++;
    const target = site.resolve(url);
    if (!target) {
      failures.add(
        `${source}: ${href} (target does not exist or redirect loops)`,
      );
      continue;
    }
    // Text-fragment directives don't require a DOM id.
    const fragment = decodeURIComponent(
      target.url.hash.slice(1).split(":~:")[0],
    );
    if (!fragment || !target.file?.endsWith(".html")) continue;
    checkedFragments++;
    const targetPage = await site.page(target.file);
    if (!targetPage.ids.has(fragment))
      failures.add(`${source}: ${href} (fragment #${fragment} does not exist)`);
  }
}
if (failures.size) {
  console.error("Invalid links or images found in rendered pages:");
  console.error(
    [...failures]
      .sort()
      .map((failure) => `- ${failure}`)
      .join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    `Checked ${checkedLinks} internal links and ${checkedFragments} fragments across ${site.htmlFiles.length} rendered pages; checked ${checkedImages} image alt attributes.`,
  );
}
