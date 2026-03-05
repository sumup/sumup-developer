import type { Element, ElementContent, Root } from "hast";
import { visit } from "unist-util-visit";

const EXTERNAL_LINK_ANNOUNCEMENT = "(Opens in a new tab)";
const HOST = "developer.sumup.com";

const hasImgChild = (node: Element): boolean => {
  return node.children.some(
    (child) => child.type === "element" && child.tagName === "img",
  );
};

const isExternalHref = (href: string): boolean => {
  try {
    const url = new URL(href, `https://${HOST}`);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    return url.host !== HOST;
  } catch {
    return false;
  }
};

const mergeRel = (rel: Element["properties"]["rel"]): string[] => {
  const relValues = new Set<string>();

  if (Array.isArray(rel)) {
    for (const value of rel) {
      if (typeof value === "string") {
        relValues.add(value);
      }
    }
  } else if (typeof rel === "string") {
    for (const value of rel.split(" ")) {
      if (value) {
        relValues.add(value);
      }
    }
  }

  relValues.add("noopener");

  return [...relValues];
};

const addClassName = (
  className: Element["properties"]["className"],
  newClassName: string,
): string[] => {
  const classNames = new Set<string>();

  if (Array.isArray(className)) {
    for (const value of className) {
      if (typeof value === "string" && value) {
        classNames.add(value);
      }
    }
  } else if (typeof className === "string" && className) {
    for (const value of className.split(" ")) {
      if (value) {
        classNames.add(value);
      }
    }
  }

  classNames.add(newClassName);

  return [...classNames];
};

export default function rehypeExternalLinks() {
  return (tree: Root) => {
    visit(tree, "element", (node) => {
      if (node.tagName !== "a") {
        return;
      }

      const href = node.properties?.href;

      if (typeof href !== "string" || !isExternalHref(href)) {
        return;
      }

      node.properties = {
        ...node.properties,
        target: "_blank",
        rel: mergeRel(node.properties?.rel),
      };

      if (!hasImgChild(node)) {
        node.properties.className = addClassName(
          node.properties.className,
          "external-link",
        );

        const announcementNode: ElementContent = {
          type: "element",
          tagName: "span",
          properties: {
            className: ["visually-hidden"],
          },
          children: [{ type: "text", value: EXTERNAL_LINK_ANNOUNCEMENT }],
        };

        node.children.push(announcementNode);
      }
    });
  };
}
