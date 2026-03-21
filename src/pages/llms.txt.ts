import type { APIRoute } from "astro";
import { getSiteUrl } from "@lib/llmsTxt";

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL(getSiteUrl());

  const lines = [
    "# SumUp Developer",
    "",
    "> Documentation for building SumUp terminal and online payment integrations.",
    "",
    "## Documentation Sets",
    `- [Abridged documentation](${new URL("/llms-small.txt", baseUrl)}): a compact version of the documentation with core integration guidance`,
    `- [Complete documentation](${new URL("/llms-full.txt", baseUrl)}): the full documentation exported as plaintext Markdown`,
    "",
    "## Notes",
    "- The complete documentation is generated from the same source as the website.",
    "- Plaintext pages are intended for LLM and agent consumption.",
  ];

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "content-type": "text/plain; charset=utf-8",
    },
  });
};
