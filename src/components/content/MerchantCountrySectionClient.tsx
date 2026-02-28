import SearchableTable, { type SearchableTableColumn } from "./SearchableTable";
import type {
  MerchantCountry,
  MerchantCountryData,
} from "./merchantCountryData";
import { createCountryColumn } from "./countryColumn";

export type MerchantCountrySectionType =
  | "companyIdentifiers"
  | "legalTypes"
  | "personIdentifiers";

type IdentifierRow = {
  country: string;
  countryCode: string;
  name: string;
  ref: string;
};

type LegalTypeRow = {
  country: string;
  countryCode: string;
  description: string;
  uniqueRef: string;
};

type Props = {
  section: MerchantCountrySectionType;
  data: MerchantCountryData;
};

const buildIdentifierRows = (
  countries: MerchantCountry[],
  section: "companyIdentifiers" | "personIdentifiers",
): IdentifierRow[] =>
  countries.flatMap((country) =>
    country[section].map((item) => ({
      country: country.displayName,
      countryCode: country.isoCode,
      name: item.name,
      ref: item.ref,
    })),
  );

const buildLegalTypeRows = (countries: MerchantCountry[]): LegalTypeRow[] =>
  countries.flatMap((country) =>
    country.legalTypes.map((item) => ({
      country: country.displayName,
      countryCode: country.isoCode,
      description: item.description,
      uniqueRef: item.uniqueRef,
    })),
  );

const MerchantCountrySectionClient = ({ section, data }: Props) => {
  if (section === "legalTypes") {
    const rows = buildLegalTypeRows(data.countries);

    return (
      <SearchableTable
        searchPlaceholder="Search legal types"
        rows={rows}
        getRowKey={(row) => `${row.countryCode}:${row.uniqueRef}`}
        columns={
          [
            createCountryColumn<LegalTypeRow>(),
            {
              key: "description",
              label: "Description",
              getValue: (row) => row.description,
            },
            {
              key: "uniqueRef",
              label: "Reference",
              wrap: "nowrap",
              getValue: (row) => row.uniqueRef,
              render: (row) => <code>{row.uniqueRef}</code>,
            },
          ] satisfies SearchableTableColumn<LegalTypeRow>[]
        }
      />
    );
  }

  const rows = buildIdentifierRows(data.countries, section);

  return (
    <SearchableTable
      searchPlaceholder={
        section === "companyIdentifiers"
          ? "Search company identifiers"
          : "Search person identifiers"
      }
      rows={rows}
      getRowKey={(row) => `${row.countryCode}:${row.ref}`}
      columns={
        [
          createCountryColumn<IdentifierRow>(),
          { key: "name", label: "Name", getValue: (row) => row.name },
          {
            key: "ref",
            label: "Reference",
            wrap: "nowrap",
            getValue: (row) => row.ref,
            render: (row) => <code>{row.ref}</code>,
          },
        ] satisfies SearchableTableColumn<IdentifierRow>[]
      }
    />
  );
};

export default MerchantCountrySectionClient;
