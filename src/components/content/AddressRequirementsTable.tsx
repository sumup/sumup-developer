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
  requiredFields: string[];
  optionalFields: string[];
};

const buildAddressRequirementRows = (
  countries: MerchantCountry[],
): AddressRequirementRow[] =>
  countries
    .slice()
    .sort((a, b) => a.displayName.localeCompare(b.displayName))
    .map((country) => {
      const requiredFields = country.addressRequirements.requiredFields
        .slice()
        .sort((a, b) => a.localeCompare(b));
      const requiredFieldSet = new Set(requiredFields);
      const optionalFields = country.addressRequirements.allowedFields
        .filter((field) => !requiredFieldSet.has(field))
        .sort((a, b) => a.localeCompare(b));

      return {
        country: country.displayName,
        countryCode: country.isoCode,
        requiredFields: requiredFields,
        optionalFields: optionalFields,
      };
    });

const AddressRequirementsTable = ({ data }: Props) => {
  const rows = buildAddressRequirementRows(data.countries);

  return (
    <SearchableTable
      searchPlaceholder="Search countries or address fields"
      rows={rows}
      getRowKey={(row) => row.countryCode}
      columns={
        [
          createCountryColumn<AddressRequirementRow>(),
          {
            key: "requiredFields",
            label: "Required fields",
            getValue: (row) => row.requiredFields.join(" "),
            render: (row) => (
              <div className={styles.fieldList}>
                {row.requiredFields.map((field) => (
                  <code key={`required-${row.countryCode}-${field}`}>
                    {field}
                  </code>
                ))}
              </div>
            ),
          },
          {
            key: "optionalFields",
            label: "Optional fields",
            getValue: (row) => row.optionalFields.join(" "),
            render: (row) => (
              <div className={styles.fieldList}>
                {row.optionalFields.map((field) => (
                  <code key={`optional-${row.countryCode}-${field}`}>
                    {field}
                  </code>
                ))}
              </div>
            ),
          },
        ] satisfies SearchableTableColumn<AddressRequirementRow>[]
      }
    />
  );
};

export default AddressRequirementsTable;
