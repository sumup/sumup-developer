import { ListItemGroup } from "@sumup-oss/circuit-ui";
import dotnetIcon from "@assets/languages/dotnet.svg";
import goIcon from "@assets/languages/go.svg";
import javaIcon from "@assets/languages/java.svg";
import nodejsIcon from "@assets/languages/nodejs.svg";
import phpIcon from "@assets/languages/php.svg";
import pythonIcon from "@assets/languages/python.svg";
import rustIcon from "@assets/languages/rust.svg";

type IconProps = {
  src: string;
  alt: string;
};

const SDKIcon = ({ src, alt }: IconProps) => (
  <img src={src} alt={alt} width="24" height="24" />
);

export default () => {
  return (
    <ListItemGroup
      style={{ marginTop: "var(--cui-spacings-mega)" }}
      label="SDKs"
      items={[
        {
          key: "node.js",
          leadingComponent: () => (
            <SDKIcon src={nodejsIcon.src} alt="Node.js logo" />
          ),
          label: "Node.js",
          href: "/tools/sdks/nodejs/",
          variant: "navigation",
        },
        {
          key: "go",
          leadingComponent: () => <SDKIcon src={goIcon.src} alt="Go logo" />,
          label: "Go",
          href: "/tools/sdks/go/",
          variant: "navigation",
        },
        {
          key: "python",
          leadingComponent: () => (
            <SDKIcon src={pythonIcon.src} alt="Python logo" />
          ),
          label: "Python",
          href: "/tools/sdks/python/",
          variant: "navigation",
        },
        {
          key: "java",
          leadingComponent: () => (
            <SDKIcon src={javaIcon.src} alt="Java logo" />
          ),
          label: "Java",
          href: "/tools/sdks/java/",
          variant: "navigation",
        },
        {
          key: "php",
          leadingComponent: () => <SDKIcon src={phpIcon.src} alt="PHP logo" />,
          label: "PHP",
          href: "/tools/sdks/php/",
          variant: "navigation",
        },
        {
          key: "rust",
          leadingComponent: () => (
            <SDKIcon src={rustIcon.src} alt="Rust logo" />
          ),
          label: "Rust",
          href: "/tools/sdks/rust/",
          variant: "navigation",
        },
        {
          key: "dotnet",
          leadingComponent: () => (
            <SDKIcon src={dotnetIcon.src} alt=".NET logo" />
          ),
          label: ".NET",
          href: "/tools/sdks/dotnet/",
          variant: "navigation",
        },
      ]}
      hideLabel
    />
  );
};
