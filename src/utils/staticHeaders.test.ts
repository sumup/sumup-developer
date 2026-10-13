import { expect, it } from "vitest";
import {
  parseStaticHeaders,
  staticHeaderValues,
} from "../../scripts/lib/static-headers.mjs";

const url = new URL("https://developer.sumup.com/.well-known/ai-catalog.json");

it("detects CORS and MIME values duplicated across owner and generated rules", () => {
  const rules = parseStaticHeaders(`/*
  Access-Control-Allow-Origin: *
/.well-known/ai-catalog.json
  Content-Type: application/ai-catalog+json
# Generated values extend the same rule.
  Content-Type: application/json
  Access-Control-Allow-Origin: *`);
  expect(staticHeaderValues(rules, url, "access-control-allow-origin")).toEqual(
    ["*", "*"],
  );
  expect(staticHeaderValues(rules, url, "content-type")).toHaveLength(2);
});

it("keeps scoped owner headers disjoint from native discovery headers", () => {
  const rules = parseStaticHeaders(`/*.md
  Access-Control-Allow-Origin: *
/.well-known/ai-catalog.json
  Cache-Control: public, max-age=3600
  Content-Type: application/json
  Access-Control-Allow-Origin: *
https://:version.:subdomain.workers.dev/*
  X-Robots-Tag: noindex`);
  expect(staticHeaderValues(rules, url, "Access-Control-Allow-Origin")).toEqual(
    ["*"],
  );
  expect(staticHeaderValues(rules, url, "Content-Type")).toEqual([
    "application/json",
  ]);
  expect(
    staticHeaderValues(
      rules,
      new URL("https://preview.portal.workers.dev/index.md"),
      "X-Robots-Tag",
    ),
  ).toEqual(["noindex"]);
  expect(staticHeaderValues(rules, url, "X-Robots-Tag")).toEqual([]);
});
