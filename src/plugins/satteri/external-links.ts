import { defineHastPlugin } from "satteri";
import type { Element, ElementContent } from "hast";

const EXTERNAL_LINK_ANNOUNCEMENT = "(Opens in a new tab)";
const FOOTNOTE_BACK_CONTENT = "\u21A9\uFE0E";
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

const isFootnoteBackref = (node: Element): boolean => {
  return "data-footnote-backref" in node.properties;
};

const createVisuallyHiddenAnnouncement = (): ElementContent => ({
  type: "element",
  tagName: "span",
  properties: {
    className: ["visually-hidden"],
  },
  children: [{ type: "text", value: EXTERNAL_LINK_ANNOUNCEMENT }],
});

const createFootnoteBackContent = (): ElementContent => ({
  type: "text",
  value: FOOTNOTE_BACK_CONTENT,
});

export default defineHastPlugin({
  name: "sumup-external-links",
  element: {
    filter: ["a"],
    visit(node, ctx) {
      if (isFootnoteBackref(node)) {
        const textIndex = node.children.findIndex(
          (child) => child.type === "text",
        );

        if (textIndex >= 0) {
          ctx.removeChildAt(node, textIndex);
          ctx.insertChildAt(node, textIndex, createFootnoteBackContent());
        }

        return;
      }

      const href = node.properties?.href;

      if (typeof href !== "string" || !isExternalHref(href)) {
        return;
      }

      ctx.setProperty(node, "target", "_blank");
      ctx.setProperty(node, "rel", mergeRel(node.properties?.rel));

      if (!hasImgChild(node)) {
        ctx.setProperty(
          node,
          "className",
          addClassName(node.properties.className, "external-link"),
        );
        ctx.appendChild(node, createVisuallyHiddenAnnouncement());
      }
    },
  },
});
