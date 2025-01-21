import { describe, expect, test } from "vitest";

import { isRelative } from "./util";

describe("isRelative", () => {
  describe("should reject common open redirect exploits", () => {
    test.each([
      ["//example.com@google.com/%2f.."],
      ["///google.com/%2f.."],
      ["///example.com@google.com/%2f.."],
      ["////google.com/%2f.."],
      ["https://google.com/%2f.."],
      ["https://example.com@google.com/%2f.."],
      ["//google.com/%2f%2e%2e"],
      ["//example.com@google.com/%2f%2e%2e"],
      ["///google.com/%2f%2e%2e"],
      ["///example.com@google.com/%2f%2e%2e"],
      ["////google.com/%2f%2e%2e"],
      ["//%09/example.com"],
      ["//%5cexample.com"],
      ["///%09/example.com"],
      ["///%5cexample.com"],
      ["////%09/example.com"],
      ["////%5cexample.com"],
      ["/////example.com"],
      ["/////example.com/"],
      ["////;@example.com"],
      ["////example.com/"],
    ])("should reject %s", (url) => expect(isRelative(url)).toBe(false));
  });
});
