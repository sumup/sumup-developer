import { describe, expect, it } from "vitest";
import { robotsTxt, withPreviewIndexingHeaders } from "./previewIndexing";

const previewHosts = [
  "epe-2139-developer-sumup-com.sumup-limited.workers.dev",
  "3d8d1165-developer-sumup-com.sumup-limited.workers.dev",
  "developer-sumup-com.sumup-limited.workers.dev",
];

describe("preview indexing", () => {
  it.each(previewHosts)("disallows crawling and indexing on %s", (hostname) => {
    expect(robotsTxt(hostname)).toBe("User-agent: *\nDisallow: /\n");
    const response = withPreviewIndexingHeaders(
      hostname,
      new Response("Preview", { headers: { "Content-Type": "text/html" } }),
    );
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(response.headers.get("Content-Type")).toBe("text/html");
  });

  it.each(["developer.sumup.com", "localhost", "workers.dev.example.com"])(
    "preserves production indexing on %s",
    (hostname) => {
      const response = new Response("Production");
      expect(withPreviewIndexingHeaders(hostname, response)).toBe(response);
      expect(response.headers.has("X-Robots-Tag")).toBe(false);
      expect(robotsTxt(hostname)).toBe(
        "User-agent: *\nAllow: /\n\nSitemap: https://developer.sumup.com/sitemap-index.xml\n",
      );
    },
  );

  it("adds the header to immutable redirect responses without changing the redirect", () => {
    const response = withPreviewIndexingHeaders(
      previewHosts[0],
      Response.redirect("https://developer.sumup.com/online-payments/", 302),
    );
    expect(response.status).toBe(302);
    expect(response.headers.get("Location")).toBe(
      "https://developer.sumup.com/online-payments/",
    );
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });
});
