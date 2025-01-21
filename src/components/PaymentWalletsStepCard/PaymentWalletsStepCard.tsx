import { Body, Card, Headline } from "@sumup-oss/circuit-ui";

import styles from "./styles.module.css";

type ApplePaySettingsCardProps = {
  step: React.ReactNode;
  headline: React.ReactNode;
  description: React.ReactNode;
  children: React.ReactNode;
};

export const PaymentWalletsStepCard = ({
  step,
  headline,
  description,
  children,
}: ApplePaySettingsCardProps) => {
  return (
    <Card className={styles.card} data-testid="apple-pay-web-card">
      <Body size="s" as="div">
        {step}
      </Body>
      <Headline data-testid="card-title" as="h1" size="s">
        {headline}
      </Headline>
      <Body data-testid="card-description" className={styles.stepBody}>
        {description}
      </Body>
      {children}
    </Card>
  );
};
