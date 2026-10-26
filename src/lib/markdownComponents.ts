import type { NimbusIntegrationOptions } from "@cloudflare/nimbus-docs";
import { plugins } from "./plugins.ts";
import { readers } from "./readers.ts";
import { javaInstallExamples } from "./sdks/javaInstallExamples.ts";
import { getJavaSdkVersion } from "./sdks/javaSdkVersion.ts";
import { agentSetupPrompt } from "./agentSetup.ts";
import { checkoutLifecycle } from "./checkoutLifecycle.ts";
import {
  pairingActors,
  pairingActorLabel,
  pairingSequence,
} from "./pairingSequence.ts";

type ComponentMap = NonNullable<
  NonNullable<NimbusIntegrationOptions["markdown"]>["componentMap"]
>;

// Nimbus preserves these components' content without a custom renderer.
// SearchableTable contributes only UI around its authored Markdown table.
export const preservedMarkdownComponents = new Set([
  "Steps",
  "Step",
  "Tabs",
  "TabItem",
  "SearchableTable",
]);

const text = (value: string | boolean) =>
  String(value).replace(/[\\`*_[\]<>|]/g, "\\$&");

// Angle destinations preserve parentheses; encode whitespace without encoding
// existing percent escapes (some asset filenames contain spaces).
const destination = (value: string | boolean) =>
  `<${String(value).replace(/[\s<>\\]/g, encodeURIComponent)}>`;

export function createMarkdownComponents(javaVersion: string): ComponentMap {
  const image: ComponentMap[string] = {
    revision: "2",
    render: ({ attrs }) =>
      `![${text(attrs.alt ?? "")}](${destination(attrs.src)})${
        attrs.title && attrs.title !== attrs.alt
          ? `\n\n${text(attrs.title)}`
          : ""
      }`,
  };
  return {
    PairingSequence: {
      revision: JSON.stringify({
        actors: pairingActors,
        steps: pairingSequence,
      }),
      render: () =>
        pairingSequence
          .map(
            (step, index) =>
              `${index + 1}. **${step.title}** (${pairingActorLabel(step)}): ${step.description}`,
          )
          .join("\n"),
    },
    CheckoutLifecycle: {
      revision: JSON.stringify(checkoutLifecycle),
      render: () =>
        checkoutLifecycle
          .map(
            (step, index) =>
              `${index + 1}. **${step.title}** (${step.actor}): ${step.description}`,
          )
          .join("\n"),
    },
    Badge: { revision: "1", render: ({ attrs }) => text(attrs.text) },
    Callout: {
      revision: "1",
      render: ({ attrs, children }) =>
        `> **${String(attrs.title ?? attrs.type ?? "Note")}**\n>\n${children
          .split("\n")
          .map((line) => `> ${line}`)
          .join("\n")}`,
    },
    CopyPrompt: {
      revision: `2-${agentSetupPrompt}`,
      render: ({ attrs }) =>
        `\`\`\`text\n${attrs.text ?? agentSetupPrompt}\n\`\`\``,
    },
    Image: image,
    ReaderHero: image,
    SoloScreen: image,
    Country: {
      revision: "1",
      render: ({ attrs }) => String(attrs.name ?? attrs.code),
    },
    Confirm: { revision: "1", render: () => "Yes" },
    PaymentMethodTitle: {
      revision: "1",
      render: ({ attrs }) => `### ${attrs.title}`,
    },
    Button: {
      revision: "2",
      render: ({ attrs }) =>
        `[${text(attrs.label)}](${destination(attrs.href)})`,
    },
    Video: {
      revision: "2",
      render: ({ attrs }) =>
        `[Watch video](${destination(attrs.src)})${
          attrs.trackSrc
            ? ` · [Read captions](${destination(attrs.trackSrc)})`
            : ""
        }`,
    },
    CardWidget: {
      revision: "1",
      render: () =>
        "[Try the interactive Payment Widget demo](https://developer.sumup.com/online-payments/checkouts/card-widget/). No real charges occur.",
    },
    JavaSdkInstallTabs: {
      revision: JSON.stringify(javaInstallExamples(javaVersion)),
      render: () =>
        javaInstallExamples(javaVersion)
          .map(
            ({ label, language, code }) =>
              `### ${label}\n\n\`\`\`${language}\n${code}\n\`\`\``,
          )
          .join("\n\n"),
    },
    ReaderGallery: {
      revision: JSON.stringify(readers),
      render: () =>
        readers.map(({ name, href }) => `- [${name}](${href})`).join("\n"),
    },
    PluginsList: {
      revision: JSON.stringify(plugins),
      render: () =>
        plugins.map(({ label, href }) => `- [${label}](${href})`).join("\n"),
    },
  };
}

export async function markdownComponents(): Promise<ComponentMap> {
  return createMarkdownComponents(await getJavaSdkVersion());
}
