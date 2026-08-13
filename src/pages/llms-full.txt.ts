import { renderCorpusMarkdown } from "@cloudflare/nimbus-docs";

export const prerender = true;

export async function GET() {
  return new Response(await renderCorpusMarkdown(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
