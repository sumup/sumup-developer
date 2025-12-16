import type { AssignablePermission } from "@lib/merchantPermissions";

import SearchableTable, { type SearchableTableColumn } from "./SearchableTable";
import styles from "./MerchantPermissionsTable.module.css";

type MerchantPermissionsTableProps = {
  permissions: AssignablePermission[];
};

const renderPermissionList = (items: string[]) => {
  if (items.length === 0) {
    return <span className={styles.empty}>-</span>;
  }

  return (
    <ul className={styles.chips}>
      {items.map((item) => (
        <li key={item}>
          <code>{item}</code>
        </li>
      ))}
    </ul>
  );
};

const columns: SearchableTableColumn<AssignablePermission>[] = [
  {
    key: "name",
    label: "Name",
    getValue: (permission) => permission.name,
    wrap: "nowrap",
    render: (permission) => (
      <div className={styles.name}>
        <code>{permission.name}</code>
        {permission.grants.length > 0 ? (
          <small className={styles.hint}>
            Unlocks {permission.grants.length} granular{" "}
            {permission.grants.length === 1 ? "capability" : "capabilities"}
          </small>
        ) : null}
      </div>
    ),
  },
  {
    key: "grantsPermissions",
    label: "Grants permissions",
    getValue: (permission) => permission.grantsPermissions.join(" "),
    render: (permission) => renderPermissionList(permission.grantsPermissions),
  },
  {
    key: "grantedBy",
    label: "Granted by permissions",
    getValue: (permission) => permission.grantedBy.join(" "),
    render: (permission) => renderPermissionList(permission.grantedBy),
  },
];

const MerchantPermissionsTable = ({
  permissions,
}: MerchantPermissionsTableProps) => (
  <SearchableTable
    searchPlaceholder="Search permissions"
    tableLayout="auto"
    rows={permissions}
    getRowKey={(permission) => permission.name}
    columns={columns}
  />
);

export default MerchantPermissionsTable;
