import { defineHastPlugin } from "satteri";

// Like Cloudflare Docs, make wide Markdown tables keyboard-scrollable.
// Classed tables belong to components and keep their own layout.
export default defineHastPlugin({
  name: "sumup-table-scroll",
  element: {
    filter: ["table"],
    visit(node, ctx) {
      const className = node.properties.className;
      if (Array.isArray(className) ? className.length > 0 : className) return;

      ctx.wrapNode(node, {
        type: "element",
        tagName: "div",
        properties: {
          className: ["nb-table-scroll"],
          tabIndex: 0,
          role: "region",
          "aria-label": "Table",
        },
        children: [],
      });
    },
  },
});
