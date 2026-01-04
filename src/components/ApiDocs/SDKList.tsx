import { ListItemGroup } from "@sumup-oss/circuit-ui";

import DotnetIcon from "./icons/DotnetIcon";
import GoIcon from "./icons/GoIcon";
import NodejsIcon from "./icons/NodejsIcon";
import PHPIcon from "./icons/PHPIcon";
import PythonIcon from "./icons/PythonIcon";
import RustIcon from "./icons/RustIcon";

export default () => {
  return (
    <ListItemGroup
      style={{ marginTop: "var(--cui-spacings-mega)" }}
      label="SDKs"
      items={[
        {
          key: "node.js",
          leadingComponent: NodejsIcon,
          label: "Node.js",
          href: "/tools/sdks/nodejs/",
          variant: "navigation",
        },
        {
          key: "go",
          leadingComponent: GoIcon,
          label: "Go",
          href: "/tools/sdks/go/",
          variant: "navigation",
        },
        {
          key: "python",
          leadingComponent: PythonIcon,
          label: "Python",
          href: "/tools/sdks/python/",
          variant: "navigation",
        },
        {
          key: "php",
          leadingComponent: PHPIcon,
          label: "PHP",
          href: "/tools/sdks/php/",
          variant: "navigation",
        },
        {
          key: "rust",
          leadingComponent: RustIcon,
          label: "Rust",
          href: "/tools/sdks/rust/",
          variant: "navigation",
        },
        {
          key: "dotnet",
          leadingComponent: DotnetIcon,
          label: ".NET",
          href: "https://github.com/sumup/sumup-dotnet",
          variant: "navigation",
        },
      ]}
      hideLabel
    />
  );
};
