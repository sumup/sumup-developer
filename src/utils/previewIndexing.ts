export const previewRobotsPolicy = "noindex, nofollow";

export function isPreviewHost(hostname: string): boolean {
  return hostname.endsWith(".workers.dev");
}

export function robotsTxt(hostname: string): string {
  return isPreviewHost(hostname)
    ? "User-agent: *\nDisallow: /\n"
    : "User-agent: *\nAllow: /\n\nSitemap: https://developer.sumup.com/sitemap-index.xml\n";
}

export function withPreviewIndexingHeaders(
  hostname: string,
  response: Response,
): Response {
  if (!isPreviewHost(hostname)) return response;
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", previewRobotsPolicy);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
