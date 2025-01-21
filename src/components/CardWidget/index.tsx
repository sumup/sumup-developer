import { useEffect } from "react";

import styles from "./styles.module.css";

declare global {
  const SumUpCard: {
    mount: (options: {
      checkoutId: string;
      onResponse: (type: string) => void;
    }) => void;
  };
}

export const appendScript = (
  scriptToAppend: string,
  onLoad: () => void,
): void => {
  const script = document.createElement("script");
  script.async = false;
  script.onload = onLoad;
  script.src = scriptToAppend;
  document.body.appendChild(script);
};

function initSumupCardWidget() {
  SumUpCard.mount({
    checkoutId: "demo",
    onResponse(type) {
      if (type === "success") {
        // eslint-disable-next-line no-alert
        alert("[DEMO] Transaction is successful!");
      }
    },
  });
}

export default function CardWidget() {
  useEffect(() => {
    appendScript(
      "https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js",
      initSumupCardWidget,
    );
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <div className={styles.note}>
          You can experience the payment widget&lsquo;s functionality by using
          the interactive demo below (no real charges will occur)
        </div>
        <div className={styles.widget}>
          <div id="sumup-card" />
        </div>
      </div>
    </div>
  );
}
