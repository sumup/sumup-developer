import { plugins } from "@lib/plugins";
import { ListItemGroup } from "@sumup-oss/circuit-ui";
import medusaIcon from "@assets/plugins/medusa.svg";
import prestashopIcon from "@assets/plugins/prestashop.svg";
import vendureIcon from "@assets/plugins/vendure.svg";
import wixIcon from "@assets/plugins/wix.svg";
import woocommerceIcon from "@assets/plugins/woocommerce.svg";

type IconProps = {
  alt: string;
  src: string;
};

const PluginIcon = ({ alt, src }: IconProps) => (
  <img src={src} alt={alt} width="24" height="24" />
);

const icons = {
  woocommerce: woocommerceIcon,
  prestashop: prestashopIcon,
  wix: wixIcon,
  medusa: medusaIcon,
  vendure: vendureIcon,
};
const items = plugins.map((plugin) => ({
  ...plugin,
  leadingComponent: () => (
    <PluginIcon
      src={icons[plugin.key as keyof typeof icons].src}
      alt={`${plugin.label} logo`}
    />
  ),
  variant: "navigation" as const,
}));

export default function PluginsList() {
  return (
    <ListItemGroup
      className="not-content"
      style={{ marginTop: "var(--cui-spacings-mega)" }}
      label="Plugins"
      items={items}
      hideLabel
    />
  );
}
