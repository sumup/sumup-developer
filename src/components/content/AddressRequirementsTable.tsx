import SearchableTable, { type SearchableTableColumn } from "./SearchableTable";
import styles from "./AddressRequirementsTable.module.css";
import type {
  MerchantCountry,
  MerchantCountryData,
} from "./merchantCountryData";
import { createCountryColumn } from "./countryColumn";

type Props = {
  data: MerchantCountryData;
};

type AddressRequirementRow = {
  country: string;
  countryCode: string;
  fields: { key: string; name: string; optional: boolean }[];
};

const defaultFieldNames: Record<string, string> = {
  street_address: "street_address",
  post_code: "post_code",
  administrative_unit_level1: "province",
  administrative_unit_level2: "administrative_unit_level2",
  administrative_unit_level3: "administrative_unit_level3",
  locality_level1: "city",
  locality_level2: "district",
  locality_level3: "neighborhood",
};

const getCountryFieldNames = (
  country: MerchantCountry,
): Partial<Record<string, string>> =>
  country.addressRequirements.fieldNames;

const getFieldDisplayName = (
  field: string,
  countryFieldNames: Partial<Record<string, string>>,
): string => countryFieldNames[field] ?? defaultFieldNames[field] ?? field;

const mapFields = (
  fields: string[],
  requiredFields: Set<string>,
  countryFieldNames: Partial<Record<string, string>>,
): { key: string; name: string; optional: boolean }[] =>
  fields.map((field) => ({
    key: field,
    name: getFieldDisplayName(field, countryFieldNames),
    optional: !requiredFields.has(field),
  }));

const buildAddressRequirementRows = (
  countries: MerchantCountry[],
): AddressRequirementRow[] =>
  countries
    .slice()
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((country) => {
      const countryFieldNames = getCountryFieldNames(country);
      const requiredFieldSet = new Set(country.addressRequirements.requiredFields);

      return {
        country: country.displayName,
        countryCode: country.isoCode,
        fields: mapFields(
          country.addressRequirements.allowedFields,
          requiredFieldSet,
          countryFieldNames,
        ),
      };
    });

const AddressRequirementsTable = ({ data }: Props) => {
  const rows = buildAddressRequirementRows(data.countries);

  return (
    <SearchableTable
      searchPlaceholder="Search countries or address fields"
      tableLayout="auto"
      rows={rows}
      getRowKey={(row) => row.countryCode}
      columns={
        [
          {
            ...createCountryColumn<AddressRequirementRow>(),
            width: "1%",
            wrap: "nowrap",
          },
          {
            key: "fields",
            label: "Fields",
            getValue: (row) =>
              row.fields.map((field) => `${field.key} ${field.name}`).join(" "),
            render: (row) => (
              <ul className={styles.fieldList}>
                {row.fields.map((field) => (
                  <li key={`${row.countryCode}-${field.key}`}>
                    <code>{field.name}</code>
                    {field.optional ? " (Optional)" : null}
                  </li>
                ))}
              </ul>
            ),
          },
        ] satisfies SearchableTableColumn<AddressRequirementRow>[]
      }
    />
  );
};

export default AddressRequirementsTable;
