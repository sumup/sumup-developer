import {
  Input,
  type InputProps,
  useNotificationToast,
} from "@sumup-oss/circuit-ui";
import { Checkmark, Copy } from "@sumup-oss/icons";

import { useEffect, useState } from "react";
import styles from "./styles.module.css";

export const CopyInput = ({
  value,
  ...props
}: Omit<InputProps, "value"> & {
  value: string;
}) => {
  const { setToast } = useNotificationToast();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setToast({
      variant: "success",
      body: "Text copied to clipboard!",
    });
  };

  useEffect(() => {
    if (!copied) return;

    const intervalID = setInterval(() => {
      setCopied(false);
    }, 1500);

    return () => clearInterval(intervalID);
  }, [copied]);

  return (
    <Input
      value={value}
      {...props}
      onClick={copy}
      renderSuffix={({ className }) => {
        if (copied) {
          return (
            <Checkmark
              className={className}
              style={{ color: "var(--cui-fg-success)" }}
            />
          );
        }
        return <Copy className={className} />;
      }}
      inputClassName={copied ? styles.inputCopied : styles.input}
      readOnly
    />
  );
};
