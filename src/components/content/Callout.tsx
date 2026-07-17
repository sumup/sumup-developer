import {
  Callout as CircuitCallout,
  type CalloutColor,
} from "@sumup-oss/circuit-ui";
import {
  Confirm,
  Info,
  Notify,
  Sparkles,
  type IconComponentType,
} from "@sumup-oss/icons";
import type { ComponentProps, ReactNode } from "react";
import styles from "./Callout.module.css";

type CalloutType = "note" | "tip" | "caution" | "success" | "promo";

type Props = Omit<ComponentProps<typeof CircuitCallout>, "body" | "color"> & {
  children: ReactNode;
  type?: CalloutType;
};

const calloutConfig: Record<
  CalloutType,
  {
    color: CalloutColor;
    icon: IconComponentType<"24">;
    iconLabel: string;
  }
> = {
  note: { color: "neutral", icon: Info, iconLabel: "Note" },
  tip: { color: "promo", icon: Sparkles, iconLabel: "Tip" },
  caution: { color: "alert", icon: Notify, iconLabel: "Caution" },
  success: { color: "confirm", icon: Confirm, iconLabel: "Success" },
  promo: { color: "promo", icon: Sparkles, iconLabel: "Promo" },
};

export default function Callout({ children, type = "note", ...props }: Props) {
  const config = calloutConfig[type];
  const className = [styles.callout, props.className].filter(Boolean).join(" ");

  return (
    <CircuitCallout
      {...config}
      {...props}
      className={className}
      body={children}
    />
  );
}
