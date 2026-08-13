type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const HOST = "developer.sumup.com";
const EXTERNAL_LINK_ANNOUNCEMENT = "(Opens in a new tab)";

const isExternalHref = (href: string): boolean => {
  try {
    const url = new URL(href, `https://${HOST}`);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.host !== HOST
    );
  } catch {
    return false;
  }
};

const stringList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  return typeof value === "string" ? value.split(/\s+/).filter(Boolean) : [];
};

const visit = (node: HastNode) => {
  if (node.tagName === "a" && node.properties) {
    if ("dataFootnoteBackref" in node.properties && node.children) {
      const text = node.children.find((child) => child.type === "text");
      if (text) text.value = "↩︎";
    } else {
      const href = node.properties.href;
      if (typeof href === "string" && isExternalHref(href)) {
        node.properties.target = "_blank";
        node.properties.rel = [
          ...new Set([...stringList(node.properties.rel), "noopener"]),
        ];

        const wrapsImage = node.children?.some(
          (child) => child.type === "element" && child.tagName === "img",
        );
        if (!wrapsImage) {
          node.properties.className = [
            ...new Set([
              ...stringList(node.properties.className),
              "external-link",
            ]),
          ];
          node.children ??= [];
          node.children.push({
            type: "element",
            tagName: "span",
            properties: { className: ["visually-hidden"] },
            children: [{ type: "text", value: EXTERNAL_LINK_ANNOUNCEMENT }],
          });
        }
      }
    }
  }

  node.children?.forEach(visit);
};

export default function externalLinks() {
  return (tree: HastNode) => visit(tree);
}
