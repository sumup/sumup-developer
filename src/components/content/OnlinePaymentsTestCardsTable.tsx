import type { TableColumn } from "./Table";
import Table from "./Table";
import styles from "./OnlinePaymentsTestCardsTable.module.css";
import { ListItemGroup } from "@sumup-oss/circuit-ui";
import { getIconURL, type IconName } from "@sumup-oss/icons";
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

const brandIconNames: Partial<
  Record<OnlinePaymentsTestCard["brand"], IconName>
> = {
  VISA: "visa",
  Mastercard: "mastercard",
  MAESTRO: "maestro",
  "American Express": "american_express",
  "Diners / Discover": "discover",
  JCB: "jcb",
  Dankort: "dankort",
  UnionPay: "union_pay",
  "Bancontact Link": "bancontact",
};

const getBrandIconUrl = (brand: string) => {
  const iconName = brandIconNames[brand];

  return iconName ? getIconURL(iconName, "24") : null;
};

const getColumns = () =>
  [
    {
      key: "brand",
      label: "Brand",
      getValue: (row: OnlinePaymentsTestCard) => row.brand,
      wrap: "nowrap",
      render: (row: OnlinePaymentsTestCard) => {
        const logoUrl = getBrandIconUrl(row.brand);

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

const getBrandLeadingComponent = (brand: string) => {
  const logoUrl = getBrandIconUrl(brand);

  if (!logoUrl) {
    return undefined;
  }

  return function BrandIcon() {
    return <img src={logoUrl} alt={brand} className={styles.brandLogo} />;
  };
};

const excludedBrands = new Set<OnlinePaymentsTestCard["brand"]>([
  "Cashlink Malta",
  "Carte Bancaire",
]);

const OnlinePaymentsTestCardsTable = ({
  flow,
}: {
  flow: OnlinePaymentsTestCard["flow"];
}) => {
  const rows = onlinePaymentsTestCards.filter(
    (row) => row.flow === flow && !excludedBrands.has(row.brand),
  );
  const listItems = rows.map((row) => ({
    key: `${row.brand}:${row.flow}:${row.number}`,
    label: <code>{formatCardNumber(row.number)}</code>,
    leadingComponent: getBrandLeadingComponent(row.brand),
    details: getExpectedBehavior(row),
  }));

  return (
    <section className={`${tableStyles.section} not-content ${styles.section}`}>
      <div className={styles.tableView}>
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
      </div>
      <div className={styles.listView}>
        <ListItemGroup label="Test cards" items={listItems} hideLabel />
      </div>
    </section>
  );
};

export default OnlinePaymentsTestCardsTable;
