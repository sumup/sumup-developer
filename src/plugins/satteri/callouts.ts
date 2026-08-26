import { defineMdastPlugin } from "satteri";
import type { Properties } from "hast";
import type { Paragraph } from "mdast";
import {
  isCalloutType,
  type CalloutType,
} from "@components/content/calloutTypes";

const calloutLabels: Record<CalloutType, string> = {
  note: "Note",
  tip: "Tip",
  caution: "Caution",
  success: "Success",
  promo: "Promotion",
};

const calloutIconPaths: Record<CalloutType, string> = {
  note: "M20 12a8 8 0 1 0-16 0 8 8 0 0 0 16 0m-9 3.6V12a1 1 0 1 1 2 0v3.6a1 1 0 1 1-2 0m1.009-8.2a1 1 0 1 1 0 2H12a1 1 0 0 1 0-2zM22 12c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2s10 4.477 10 10",
  tip: "M5.602 19.198a.8.8 0 1 0-1.6 0 .8.8 0 0 0 1.6 0m5.55-10.277a2.8 2.8 0 0 1-2.231 2.231L4.437 12l4.484.848a2.8 2.8 0 0 1 2.231 2.231L12 19.562l.848-4.483a2.8 2.8 0 0 1 2.231-2.231L19.562 12l-4.483-.848a2.8 2.8 0 0 1-2.231-2.231L12 4.437zm8.926 2.981h.004zm-1.88-5.3v-.8h-.8a1 1 0 0 1 0-2h.8v-.8a1 1 0 0 1 2 0v.8h.8a1 1 0 0 1 0 2h-.8v.8a1 1 0 0 1-2 0M7.602 19.198a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0M22 12a1.9 1.9 0 0 1-1.55 1.866l.001.001-5 .945a.8.8 0 0 0-.607.522l-.031.116-.946 5.001a1.9 1.9 0 0 1-3.734 0l-.945-5a.8.8 0 0 0-.522-.607l-.116-.031-5.001-.946a1.9 1.9 0 0 1 0-3.734l5-.945.117-.032a.8.8 0 0 0 .521-.606l.946-5.001a1.9 1.9 0 0 1 2.949-1.211l.132.1.123.112a1.9 1.9 0 0 1 .53.999l.945 5 .032.117a.8.8 0 0 0 .606.521l5.001.946A1.9 1.9 0 0 1 22 12",
  caution:
    "M12 3c.493 0 .977.129 1.404.375a2.8 2.8 0 0 1 1.027 1.024l7.194 12.436A2.77 2.77 0 0 1 22 18.223a2.77 2.77 0 0 1-.377 1.392 2.8 2.8 0 0 1-1.025 1.015 2.8 2.8 0 0 1-1.394.37H4.814a2.82 2.82 0 0 1-1.394-.36 2.8 2.8 0 0 1-1.036-1.013A2.8 2.8 0 0 1 2 18.23c-.001-.49.129-.971.376-1.395L9.569 4.399a2.8 2.8 0 0 1 1.027-1.024A2.8 2.8 0 0 1 12 3m.009 12.447a1 1 0 1 0 .009 2 1 1 0 0 0-.009-2m0-7.105a1 1 0 0 0-1 1V14.5h2V9.342a1 1 0 0 0-1-1",
  success:
    "M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m4.385 6.866a1.25 1.25 0 0 0-1.768 0L11 12.482l-1.366-1.366a1.25 1.25 0 0 0-1.768 1.768l2.25 2.25a1.25 1.25 0 0 0 1.768 0l4.501-4.5a1.25 1.25 0 0 0 0-1.768",
  promo:
    "M5.602 19.198a.8.8 0 1 0-1.6 0 .8.8 0 0 0 1.6 0m5.55-10.277a2.8 2.8 0 0 1-2.231 2.231L4.437 12l4.484.848a2.8 2.8 0 0 1 2.231 2.231L12 19.562l.848-4.483a2.8 2.8 0 0 1 2.231-2.231L19.562 12l-4.483-.848a2.8 2.8 0 0 1-2.231-2.231L12 4.437zm8.926 2.981h.004zm-1.88-5.3v-.8h-.8a1 1 0 0 1 0-2h.8v-.8a1 1 0 0 1 2 0v.8h.8a1 1 0 0 1 0 2h-.8v.8a1 1 0 0 1-2 0M7.602 19.198a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0M22 12a1.9 1.9 0 0 1-1.55 1.866l.001.001-5 .945a.8.8 0 0 0-.607.522l-.031.116-.946 5.001a1.9 1.9 0 0 1-3.734 0l-.945-5a.8.8 0 0 0-.522-.607l-.116-.031-5.001-.946a1.9 1.9 0 0 1 0-3.734l5-.945.117-.032a.8.8 0 0 0 .521-.606l.946-5.001a1.9 1.9 0 0 1 2.949-1.211l.132.1.123.112a1.9 1.9 0 0 1 .53.999l.945 5 .032.117a.8.8 0 0 0 .606.521l5.001.946A1.9 1.9 0 0 1 22 12",
};

const element = (
  tagName: string,
  properties: Properties,
  children: unknown[] = [],
): Paragraph => ({
  type: "paragraph",
  data: { hName: tagName, hProperties: properties },
  children: children as Paragraph["children"],
});

const icon = (type: CalloutType, sourceFormat: "markdown" | "mdx") => {
  const svg = `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none"><path fill="currentColor" d="${calloutIconPaths[type]}"></path></svg>`;

  // MDX cannot safely consume a raw HTML node, so use Astro's set:html escape
  // hatch there while keeping the simpler HTML node for plain Markdown.
  return sourceFormat === "mdx"
    ? {
        type: "mdxJsxTextElement",
        name: "Fragment",
        attributes: [{ type: "mdxJsxAttribute", name: "set:html", value: svg }],
      }
    : { type: "html", value: svg };
};

export default defineMdastPlugin({
  name: "sumup-callouts",
  containerDirective(node, context) {
    if (!isCalloutType(node.name)) {
      return;
    }

    const children = [...node.children];
    const firstChild = children[0];
    let title = calloutLabels[node.name];
    let titleChildren: unknown[] = [{ type: "text", value: title }];

    if (
      firstChild?.type === "paragraph" &&
      firstChild.data?.directiveLabel === true &&
      firstChild.children.length > 0
    ) {
      title = context.textContent(firstChild);
      titleChildren = [...firstChild.children];
      children.shift();
    }

    // A Markdown processor cannot instantiate the React Callout component.
    // Emit the same semantic markup and stable classes that Callout.tsx uses.
    return element(
      "aside",
      {
        "aria-label": title,
        class: `sumup-callout sumup-callout--${node.name}`,
      },
      [
        element("div", { class: "sumup-callout__icon" }, [
          icon(node.name, context.sourceFormat),
        ]),
        element("div", { class: "sumup-callout__content" }, [
          element(
            "p",
            { class: "sumup-callout__title", "aria-hidden": "true" },
            titleChildren,
          ),
          ...children,
        ]),
      ],
    );
  },
});
