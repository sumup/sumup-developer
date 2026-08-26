import { describe, expect, it } from "vitest";
import { markdownToHtml } from "satteri";
import callouts from "./callouts";

describe("callouts Markdown plugin", () => {
  it("renders a titled callout with nested Markdown", () => {
    const source = `:::caution[PCI DSS compliance required]
Use the [official requirements](https://example.com).
:::`;

    const { html } = markdownToHtml(source, {
      features: { directive: true },
      mdastPlugins: [callouts],
    });

    expect(html).toContain(
      '<aside aria-label="PCI DSS compliance required" class="sumup-callout sumup-callout--caution">',
    );
    expect(html).toContain('class="sumup-callout__icon"');
    expect(html).toContain(
      '<p class="sumup-callout__title" aria-hidden="true">PCI DSS compliance required</p>',
    );
    expect(html).toContain(
      '<a href="https://example.com">official requirements</a>',
    );
  });

  it("uses the default title for an untitled callout", () => {
    const { html } = markdownToHtml(":::note\nRemember this.\n:::", {
      features: { directive: true },
      mdastPlugins: [callouts],
    });

    expect(html).toContain('aria-label="Note"');
    expect(html).toContain(
      '<p class="sumup-callout__title" aria-hidden="true">Note</p>',
    );
  });
});
