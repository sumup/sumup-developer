export type Identifier = {
  ref: string;
  name: string;
};

export type LegalType = {
  uniqueRef: string;
  description: string;
};

export type AddressRequirements = {
  requiredFields: string[];
  allowedFields: string[];
  fieldNames: Partial<Record<string, string>>;
};

export type MerchantCountry = {
  isoCode: string;
  displayName: string;
  companyIdentifiers: Identifier[];
  personIdentifiers: Identifier[];
  legalTypes: LegalType[];
  addressRequirements: AddressRequirements;
};

export type MerchantCountryData = {
  countries: MerchantCountry[];
};
