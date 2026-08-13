import type { NimbusIntegrationOptions } from "@cloudflare/nimbus-docs";
import { plugins } from "./plugins";
import { readers } from "./readers";
import { javaInstallExamples } from "./sdks/javaInstallExamples";
import { getJavaSdkVersion } from "./sdks/javaSdkVersion";

type ComponentMap = NonNullable<
  NonNullable<NimbusIntegrationOptions["markdown"]>["componentMap"]
>;

export async function markdownComponents(): Promise<ComponentMap> {
  const javaVersion = await getJavaSdkVersion();
  const image: ComponentMap[string] = {
    revision: "1",
    render: ({ attrs }) => `![${attrs.alt ?? ""}](${attrs.src})`,
  };
  return {
    Image: image,
    ReaderHero: image,
    Country: {
      revision: "1",
      render: ({ attrs }) => String(attrs.name ?? attrs.code),
    },
    Confirm: { revision: "1", render: () => "Yes" },
    PaymentMethodTitle: {
      revision: "1",
      render: ({ attrs }) => `### ${attrs.title}`,
    },
    LinkButton: {
      revision: "1",
      render: ({ attrs, children }) => `[${children.trim()}](${attrs.href})`,
    },
    Video: {
      revision: "1",
      render: ({ attrs }) => `[Watch video](${attrs.src})`,
    },
    CardWidget: {
      revision: "1",
      render: () =>
        "[Try the interactive Payment Widget demo](https://developer.sumup.com/online-payments/checkouts/card-widget/). No real charges occur.",
    },
    JavaSdkInstallTabs: {
      revision: `1-${javaVersion}`,
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
