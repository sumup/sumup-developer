import type { SearchableTableColumn } from "./SearchableTable";
import CountryCell from "./CountryCell";

type CountryRow = {
  country: string;
  countryCode: string;
};

export const createCountryColumn = <
  T extends CountryRow,
>(): SearchableTableColumn<T> => ({
  key: "country",
  label: "Country",
  getValue: (row) => `${row.country} ${row.countryCode}`,
  render: (row) => (
    <CountryCell country={row.country} countryCode={row.countryCode} />
  ),
});
