import {
  Confirm,
  Info,
  Notify,
  Sparkles,
  type IconComponentType,
} from "@sumup-oss/icons";
import type { HTMLAttributes, ReactNode } from "react";
import type { CalloutType } from "./calloutTypes";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  type?: CalloutType;
};

const calloutConfig: Record<
  CalloutType,
  {
    icon: IconComponentType<"24">;
    iconLabel: string;
  }
> = {
  note: { icon: Info, iconLabel: "Note" },
  tip: { icon: Sparkles, iconLabel: "Tip" },
  caution: { icon: Notify, iconLabel: "Caution" },
  success: { icon: Confirm, iconLabel: "Success" },
  promo: { icon: Sparkles, iconLabel: "Promo" },
};

export default function Callout({
  children,
  className,
  type = "note",
  ...props
}: Props) {
  const config = calloutConfig[type];
  const classes = ["sumup-callout", `sumup-callout--${type}`, className]
    .filter(Boolean)
    .join(" ");
  const Icon = config.icon;

  return (
    <div {...props} className={classes}>
      <div className="sumup-callout__icon">
        <Icon aria-hidden="true" size="24" />
      </div>
      <span className="visually-hidden">{config.iconLabel}</span>
      <div className="sumup-callout__content">{children}</div>
    </div>
  );
}
