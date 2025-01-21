import { Anchor, Headline } from "@sumup-oss/circuit-ui";
import styles from "./styles.module.css";

export const PaymentWalletsPageTitle = ({
  children,
}: React.PropsWithChildren) => {
  return (
    <>
      <Anchor href="/settings/wallets" size="s">
        Payment wallets
      </Anchor>
      <Headline as="h1" className={styles.headline}>
        {children}
      </Headline>
    </>
  );
};

export const PaymentWalletsPageHeader = ({
  children,
}: React.PropsWithChildren) => {
  return (
    <Headline as="h3" size="s" className={styles.subHeadline}>
      {children}
    </Headline>
  );
};
