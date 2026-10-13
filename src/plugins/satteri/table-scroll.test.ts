import { describe, expect, it } from "vitest";
import { defineHastPlugin, markdownToHtml } from "satteri";
import tableScroll from "./table-scroll";

describe("Markdown table scrolling", () => {
  it("provides a keyboard-accessible region without changing table content", () => {
    const { html } = markdownToHtml(
      "| Currency | Code |\n| --- | --- |\n| Euro | EUR |",
      {
        features: { gfm: true },
        hastPlugins: [tableScroll],
      },
    );

    expect(html).toContain(
      '<div class="nb-table-scroll" tabindex="0" role="region" aria-label="Table">',
    );
    expect(html).toContain("<th>Currency</th>");
    expect(html).toContain("<td>EUR</td>");
  });

  it("leaves tables owned by components alone", () => {
    const componentTable = defineHastPlugin({
      name: "component-table",
      element: {
        filter: ["table"],
        visit(node, ctx) {
          ctx.setProperty(node, "className", ["custom"]);
        },
      },
    });
    const { html } = markdownToHtml("| Name |\n| --- |\n| Example |", {
      features: { gfm: true },
      hastPlugins: [componentTable, tableScroll],
    });

    expect(html).toContain('class="custom"');
    expect(html).not.toContain("nb-table-scroll");
  });
});
