import { nodes, component } from "@astrojs/markdoc/config";

export default {
  render: component("@components/Code/CodeBlock.astro"),
  attributes: {
    ...nodes.fence.attributes,
    content: { type: String, render: "code", required: true },
    language: {
      type: String,
      required: true,
    },
    meta: {
      type: String,
      required: false,
    },
    collapse: {
      type: String,
      required: false,
    },
  },
};
