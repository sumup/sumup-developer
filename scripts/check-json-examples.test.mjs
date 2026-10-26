import assert from "node:assert/strict";
import { test } from "node:test";
import { validateJsonExamples } from "./check-json-examples.mjs";

test("checks JSON inside MDX components and curl data, while allowing form data", () => {
  const source = `---
title: Examples
---
<Tabs>
<TabItem label="JSON">

\`\`\`json
{"message":"A literal ... is valid","items":[1,2]}
\`\`\`

</TabItem>
</Tabs>

\`\`\`bash
curl https://example.com --data '{"amount":10}'
curl https://example.com -d 'grant_type=authorization_code'
\`\`\``;
  assert.deepEqual(validateJsonExamples(source, "guide.mdx"), {
    checked: 2,
    errors: [],
  });
});

test("reports malformed JSON fences at their source location", () => {
  const result = validateJsonExamples(
    '---\ntitle: Example\n---\n\n```json\n{"token":"saved" "customer_id":"123"}\n```',
    "guide.mdx",
  );
  assert.equal(result.checked, 1);
  assert.match(result.errors[0], /^guide\.mdx:6: invalid JSON example:/);
});

test("rejects trailing commas in literal curl payloads", () => {
  const result = validateJsonExamples(
    '```bash\ncurl https://example.com \\\n  -d \'{"total_amount":{"value":1500,}}\'\n```',
    "cloud-api.mdx",
  );
  assert.equal(result.checked, 1);
  assert.match(
    result.errors[0],
    /^cloud-api\.mdx:\d+: invalid curl JSON body:/,
  );
});
