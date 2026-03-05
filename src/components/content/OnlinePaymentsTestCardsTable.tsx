import type { TableColumn } from "./Table";
import Table from "./Table";
import styles from "./OnlinePaymentsTestCardsTable.module.css";
import {
  type OnlinePaymentsTestCard,
  onlinePaymentsTestCards,
} from "../../lib/onlinePaymentsTestCards";
import tableStyles from "./SearchableTable.module.css";

const formatCardNumber = (number: string) =>
  number.replace(/\B(?=(\d{4})+(?!\d))/g, " ");

const getExpectedBehavior = (row: OnlinePaymentsTestCard) => {
  if (row.flow === "Challenge") {
    return "3D Secure challenge is required.";
  }

  if (row.flow === "Error") {
    if (row.result.includes("Technical Error")) {
      return "Authentication fails due to a technical error.";
    }
    if (row.result.includes("User not enrolled")) {
      return "Cardholder is not enrolled for 3D Secure.";
    }
    if (row.result.includes("Card not participating")) {
      return "Card or issuer does not participate in 3D Secure.";
    }

    return "Authentication does not complete successfully.";
  }

  if (row.result.includes("Successful frictionless")) {
    return "Payment succeeds with frictionless authentication.";
  }
  if (row.result.includes("Attempt")) {
    return "Authentication is attempted and payment proceeds without challenge.";
  }

  return "Follow your standard 3D Secure handling.";
};

const brandLogoUrls: Record<string, string> = {
  VISA: "https://sumup.docs.oppwa.com/sites/default/files/brands/VISA.png",
  Mastercard:
    "https://sumup.docs.oppwa.com/sites/default/files/brands/MASTER.png",
  MAESTRO:
    "https://sumup.docs.oppwa.com/sites/default/files/brands/MAESTRO.png",
  "American Express":
    "https://sumup.docs.oppwa.com/sites/default/files/brands/AMEX.png",
  "Diners / Discover":
    "https://sumup.docs.oppwa.com/sites/default/files/brands/DISCOVER.png",
  JCB: "https://sumup.docs.oppwa.com/sites/default/files/brands/JCB.png",
  "Cashlink Malta":
    "https://sumup.docs.oppwa.com/sites/default/files/brands/CASHLINKMALTA.png",
  Dankort:
    "https://sumup.docs.oppwa.com/sites/default/files/brands/DANKORT.png",
  "Carte Bancaire":
    "https://sumup.docs.oppwa.com/sites/default/files/brands/CARTEBANCAIRE.png",
  UnionPay:
    "https://sumup.docs.oppwa.com/sites/default/files/brands/UNIONPAY.png",
  "Bancontact Link":
    "https://sumup.docs.oppwa.com/sites/default/files/brands/BANCONTACT_LINK.png",
};

const getColumns = () =>
  [
    {
      key: "brand",
      label: "Brand",
      getValue: (row: OnlinePaymentsTestCard) => row.brand,
      wrap: "nowrap",
      render: (row: OnlinePaymentsTestCard) => {
        const logoUrl = brandLogoUrls[row.brand];

        return (
          <span className={styles.brandCell}>
            {logoUrl ? (
              <img src={logoUrl} alt={row.brand} className={styles.brandLogo} />
            ) : null}
            <span>{row.brand}</span>
          </span>
        );
      },
    },
    {
      key: "number",
      label: "Card Number",
      getValue: (row: OnlinePaymentsTestCard) => row.number,
      width: "1%",
      wrap: "nowrap",
      render: (row: OnlinePaymentsTestCard) => (
        <code>{formatCardNumber(row.number)}</code>
      ),
    },
    {
      key: "result",
      label: "Expected Behavior",
      getValue: (row: OnlinePaymentsTestCard) => getExpectedBehavior(row),
      render: (row: OnlinePaymentsTestCard) => getExpectedBehavior(row),
    },
  ] satisfies TableColumn<OnlinePaymentsTestCard>[];

type Props = {
  flow: OnlinePaymentsTestCard["flow"];
  title?: string;
};

const OnlinePaymentsTestCardsTable = ({ flow, title }: Props) => {
  const rows = onlinePaymentsTestCards.filter((row) => row.flow === flow);

  return (
    <section className={`${tableStyles.section} not-content ${styles.section}`}>
      {title ? <h4>{title}</h4> : null}
      <div className={tableStyles.tableFrame}>
        <div
          className={tableStyles.tableContainer}
          style={{ maxHeight: "none" }}
        >
          <Table
            columns={getColumns()}
            rows={rows}
            tableLayout="auto"
            getRowKey={(row) => `${row.brand}:${row.flow}:${row.number}`}
          />
        </div>
      </div>
    </section>
  );
};

export default OnlinePaymentsTestCardsTable;
