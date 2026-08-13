import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { markdownCleaner } from "./cleanMarkdown";

let cleaner: Promise<ReturnType<typeof markdownCleaner>> | undefined;

export const withCleanMarkdown =
  (handler: APIRoute): APIRoute =>
  async (context) => {
    const response = await handler(context);
    if (!response.ok) return response;
    cleaner ??= getCollection("docs").then((entries) =>
      markdownCleaner(entries.map((entry) => entry.body ?? "")),
    );
    const clean = await cleaner;
    let body = clean(await response.text());
    if (context.url.pathname.endsWith("/index.md")) {
      const canonical = new URL(
        context.url.pathname.replace(/index\.md$/, ""),
        context.site,
      );
      body += `\n\nSource: ${canonical.href}\n`;
    }
    return new Response(body, {
      status: response.status,
      headers: response.headers,
    });
  };
