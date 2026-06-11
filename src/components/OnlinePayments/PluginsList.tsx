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

const items = [
  {
    key: "woocommerce",
    leadingComponent: () => (
      <PluginIcon src={woocommerceIcon.src} alt="WooCommerce logo" />
    ),
    label: "WooCommerce",
    href: "/online-payments/plugins/woocommerce/",
    variant: "navigation" as const,
  },
  {
    key: "prestashop",
    leadingComponent: () => (
      <PluginIcon src={prestashopIcon.src} alt="PrestaShop logo" />
    ),
    label: "PrestaShop",
    href: "/online-payments/plugins/prestashop/",
    variant: "navigation" as const,
  },
  {
    key: "wix",
    leadingComponent: () => <PluginIcon src={wixIcon.src} alt="Wix logo" />,
    label: "Wix",
    href: "/online-payments/plugins/wix/",
    variant: "navigation" as const,
  },
  {
    key: "medusa",
    leadingComponent: () => (
      <PluginIcon src={medusaIcon.src} alt="Medusa logo" />
    ),
    label: "Medusa",
    href: "/online-payments/plugins/medusa/",
    variant: "navigation" as const,
  },
  {
    key: "vendure",
    leadingComponent: () => (
      <PluginIcon src={vendureIcon.src} alt="Vendure logo" />
    ),
    label: "Vendure",
    href: "/online-payments/plugins/vendure/",
    variant: "navigation" as const,
  },
];

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
