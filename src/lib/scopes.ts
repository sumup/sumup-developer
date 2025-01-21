import {
  Account,
  CardReaderAir,
  Employees,
  Invoice,
  Items,
  PaymentMethods,
  Payouts,
  Profile,
  Sales,
  Settings,
} from "@sumup-oss/icons";

type ScopeDefinitionProperties = {
  description: string;
  icon: React.FunctionComponent;
  restricted: boolean;
};

// This is non-exhaustive list of scopes circulating around at SumUp.
// We care only about scopes available to external clients here.
// There's no better authoritative source of the scope as of now than: https://developer.sumup.com/online-payments/introduction/authorization/.
// For now we take the developer portal as source of truth until we come up with registry of scopes
// and define the process behind them via RFC.
export const scopes = {
  email: {
    description: "View your email address.",
    icon: Profile,
    restricted: false,
  },
  profile: {
    description: "View user's profile information.",
    icon: Profile,
    restricted: false,
  },
  "transactions.history": {
    description:
      "Allows you to view the transactions and transaction history for a specific merchant user's account.",
    icon: Sales,
    restricted: false,
  },
  "user.app-settings": {
    description:
      "Allows you to view and modify the SumUp mobile application settings for a specific merchant user's account.",
    icon: Settings,
    restricted: false,
  },
  "user.profile_readonly": {
    description:
      "Allows you to view the profile details for a specific merchant user's account.",
    icon: Profile,
    restricted: false,
  },
  "user.profile": {
    description:
      "Allows you to modify the profile details of a specific merchant user's account.",
    icon: Profile,
    restricted: false,
  },
  "user.subaccounts": {
    description:
      "Allows you to view and modify the profile details of a subaccount created for a specific merchant user's account. Subaccounts are user accounts for employees of a merchant and can be granted different permissions by the holder of the main merchant user's account.",
    icon: Employees,
    restricted: false,
  },
  "user.payout-settings": {
    description:
      "Allows you to view and modify the payout settings for a specific merchant user's account.",
    icon: Payouts,
    restricted: false,
  },
  products: {
    description:
      "Allows you to view and modify the product store for a specific merchant user's account. This includes the products, shelves, prices, and VAT rates available in the merchant's product store.",
    icon: Items,
    restricted: false,
  },
  payments: {
    description:
      "Allows you to make payments by creating and processing payment checkouts.",
    icon: Account,
    restricted: true,
  },
  payment_instruments: {
    description:
      "Allows you to save customers and tokenize their payment cards for a specific merchant user's account.",
    icon: PaymentMethods,
    restricted: true,
  },
  "invoices.read": {
    description:
      "Allows you to read all invoices documents data, merchant information, including bank account details.",
    icon: Invoice,
    restricted: false,
  },
  "invoices.write": {
    description:
      "Allows you to create and update invoices documents, mark invoices as paid or unpaid, on behalf of the merchant. Update of merchant information, including bank account details.",
    icon: Invoice,
    restricted: false,
  },
  "accounting.read": {
    description:
      "Allows you to read all accounting documents, reports and bank account details.",
    icon: Invoice,
    restricted: false,
  },
  "accounting.write": {
    description:
      "Allows you to modify accounting data, on behalf of the merchant including reports, accounting documents and bank account details.",
    icon: Invoice,
    restricted: false,
  },
  "readers.read": {
    description:
      "Allows you to view card readers linked to merchant's profile.",
    icon: CardReaderAir,
    restricted: false,
  },
  "readers.write": {
    description:
      "Allow you to pair card readers with merchant profiles and manage paired card readers.",
    icon: CardReaderAir,
    restricted: false,
  },
};

export type Scope = keyof typeof scopes;

export type ScopeDefinition = ScopeDefinitionProperties;

export const getScopeDefinition = (scope: Scope): ScopeDefinition =>
  scopes[scope];

export const isScope = (scope: unknown): scope is Scope => {
  if (typeof scope !== "string") {
    return false;
  }

  const maybeScope = scope as Scope;

  return typeof scopes[maybeScope] !== "undefined";
};
