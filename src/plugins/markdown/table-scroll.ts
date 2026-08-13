type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const wrapTables = (node: HastNode) => {
  if (!node.children) return;

  node.children.forEach(wrapTables);
  node.children = node.children.map((child) => {
    if (child.type !== "element" || child.tagName !== "table") return child;
    return {
      type: "element",
      tagName: "div",
      properties: { className: ["nb-table-scroll"] },
      children: [child],
    };
  });
};

export default function tableScroll() {
  return (tree: HastNode) => wrapTables(tree);
}
