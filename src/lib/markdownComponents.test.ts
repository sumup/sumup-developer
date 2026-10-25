import { expect, it } from "vitest";
import { renderEntryAsMarkdown } from "@cloudflare/nimbus-docs/runtime";
import { markdownToMdast } from "satteri";
import type { Root, RootContent } from "mdast";
import { createMarkdownComponents } from "./markdownComponents";
import { javaInstallExamples } from "./sdks/javaInstallExamples";
import { agentSetupPrompt } from "./agentSetup";

const componentMap = Object.fromEntries(
  Object.entries(createMarkdownComponents("1.2.3")).map(([name, value]) => [
    name,
    value.render,
  ]),
);
const convert = (body: string) =>
  renderEntryAsMarkdown({ body, filePath: "fixture.mdx" }, { componentMap });

function nodes(markdown: string) {
  const result: RootContent[] = [];
  const visit = (node: Root | RootContent) => {
    if (node.type !== "root") result.push(node);
    if ("children" in node) node.children.forEach(visit);
  };
  visit(markdownToMdast(markdown));
  return result;
}

it("preserves screenshot URLs with spaces and parentheses, alternative text, and captions", () => {
  const markdown = convert(
    `<SoloScreen src="/img/pairing (complete).png" alt="Solo [paired]" title="Pairing complete" />`,
  );
  expect(nodes(markdown)).toContainEqual(
    expect.objectContaining({
      type: "image",
      url: "/img/pairing%20(complete).png",
      alt: "Solo [paired]",
    }),
  );
  expect(markdown).toContain("Pairing complete");
});

it("preserves badges, country names, and confirmation meaning inside a table", () => {
  const markdown = convert(`| Status | Country | Supported |
| --- | --- | --- |
| <Badge text="Alpha &#124; Beta" /> | <Country code="GB" name="United Kingdom" /> | <Confirm /> |`);
  const table = nodes(markdown).find((node) => node.type === "table");
  expect(table?.children).toHaveLength(2);
  expect(table?.children[1].children).toHaveLength(3);
  const values = nodes(markdown)
    .filter((node) => node.type === "text")
    .map((node) => node.value);
  expect(values).toEqual(
    expect.arrayContaining(["Alpha | Beta", "United Kingdom", "Yes"]),
  );
});

it("exposes both the video and its captions, and keeps button links readable", () => {
  const markdown = convert(`<Video src="/pairing.mp4" trackSrc="/pairing.vtt" />

<Button label="Download [plugin]" href="/downloads/plugin (latest).zip" />`);
  const links = nodes(markdown).filter((node) => node.type === "link");
  expect(links.map((node) => node.url)).toEqual([
    "/pairing.mp4",
    "/pairing.vtt",
    "/downloads/plugin%20(latest).zip",
  ]);
  expect(nodes(markdown)).toContainEqual(
    expect.objectContaining({ type: "text", value: "Download [plugin]" }),
  );
});

it("preserves nested callout code and native Steps, Tabs, and SearchableTable content", () => {
  const code = "if (ready) {\n    pair();\n}";
  const markdown = convert(`<Steps>
1. Pair the reader.

   <Callout type="tip" title="Pairing">

   \`\`\`js
   ${code.replaceAll("\n", "\n   ")}
   \`\`\`

   </Callout>
</Steps>

<Tabs>
<TabItem label="Sandbox">Use your test account.</TabItem>
<TabItem label="Production">Use your live account.</TabItem>
</Tabs>

<SearchableTable>

| Field | Required |
| --- | --- |
| Reader ID | Yes |

</SearchableTable>`);
  expect(nodes(markdown)).toContainEqual(
    expect.objectContaining({ type: "code", value: code }),
  );
  expect(nodes(markdown)).toContainEqual(
    expect.objectContaining({ type: "list", ordered: true }),
  );
  expect(
    nodes(markdown).filter((node) => node.type === "heading"),
  ).toHaveLength(2);
  expect(
    nodes(markdown).find((node) => node.type === "table")?.children,
  ).toHaveLength(2);
  expect(markdown).toContain("Pairing");
});

it("keeps generated Java install snippets and the default setup prompt intact", () => {
  const markdown = convert("<JavaSdkInstallTabs />\n\n<CopyPrompt />");
  const code = nodes(markdown).filter((node) => node.type === "code");
  expect(code.map((node) => node.value)).toEqual([
    ...javaInstallExamples("1.2.3").map((example) => example.code),
    agentSetupPrompt,
  ]);
});

it("publishes the interactive checkout's asynchronous flow and both final outcomes", () => {
  const markdown = convert("<CheckoutLifecycle client:visible />");
  expect(markdown).toContain("Acceptance does not confirm payment");
  expect(markdown).toContain("client_transaction_id");
  expect(markdown).toContain("For successful, mark the matching order paid");
  expect(markdown).toContain("For failed, keep it unpaid");
  expect(markdown).not.toContain("<CheckoutLifecycle");
});

it("publishes all pairing sequence messages, their direction, and the asynchronous handoff", () => {
  const markdown = convert("<PairingSequence client:visible />");
  const list = nodes(markdown).find((node) => node.type === "list");
  expect(list?.children).toHaveLength(7);
  expect(markdown).toContain("Your application → Cloud API");
  expect(markdown).toContain("Cloud API → Your application");
  expect(markdown).toContain("Cloud API → Solo reader");
  expect(markdown).toContain("expires after five minutes");
  expect(markdown).toContain("Starting a checkout is asynchronous");
  expect(markdown).toContain("final payment result");
  expect(markdown).not.toContain("<PairingSequence");
});
