import { useMemo, useState } from "react";

import type { AssignablePermission } from "@lib/merchantPermissions";
import { Body, SearchInput, Table } from "@sumup-oss/circuit-ui";

const MAX_VISIBLE_PERMISSIONS = 50;

type MerchantPermissionsListProps = {
  permissions: AssignablePermission[];
};

const normalize = (value: string) => value.trim().toLowerCase();

export function MerchantPermissionsList({
  permissions,
}: MerchantPermissionsListProps) {
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const searchParams = new URLSearchParams(window.location.search);

    return searchParams.get("permission") ?? "";
  });
  const normalizedQuery = normalize(query);

  const filteredPermissions = useMemo(() => {
    if (!normalizedQuery) {
      return permissions;
    }

    return permissions.filter((permission) =>
      permission.name.toLowerCase().includes(normalizedQuery),
    );
  }, [permissions, normalizedQuery]);

  const headers = useMemo(
    () => [
      {
        children: "Name",
        sortable: true,
        sortLabel: "Sort permissions by name",
      },
      {
        children: "Grants permissions",
        sortable: false,
      },
      {
        children: "Granted by permissions",
        sortable: false,
      },
    ],
    [],
  );

  const renderPermissionList = (items: string[]) => {
    if (items.length === 0) {
      return <span className="merchant-permissions__empty">—</span>;
    }

    return (
      <ul className="merchant-permissions__chips">
        {items.map((item) => (
          <li key={item}>
            <code>{item}</code>
          </li>
        ))}
      </ul>
    );
  };

  const visiblePermissions = useMemo(
    () => filteredPermissions.slice(0, MAX_VISIBLE_PERMISSIONS),
    [filteredPermissions],
  );

  const rows = useMemo(
    () =>
      visiblePermissions.map((permission) => ({
        cells: [
          {
            children: (
              <div className="merchant-permissions__name">
                <code>{permission.name}</code>
                {permission.grants.length > 0 ? (
                  <Body color="subtle" as="span">
                    Unlocks {permission.grants.length} granular{" "}
                    {permission.grants.length === 1
                      ? "capability"
                      : "capabilities"}
                  </Body>
                ) : null}
              </div>
            ),
            sortByValue: permission.name,
          },
          {
            children: renderPermissionList(permission.grantsPermissions),
          },
          {
            children: renderPermissionList(permission.grantedBy),
          },
        ],
      })),
    [visiblePermissions],
  );

  const visibleCount = visiblePermissions.length;
  const totalCount = filteredPermissions.length;

  return (
    <div className="merchant-permissions">
      <SearchInput
        label="Search"
        placeholder="admin, accountant, member..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <Body as="p" className="merchant-permissions__stats" color="subtle">
        Showing {visibleCount} of {totalCount} permissions
      </Body>
      {filteredPermissions.length === 0 ? (
        <p>No matching permissions.</p>
      ) : (
        <Table
          headers={headers}
          rows={rows}
          rowHeaders={false}
          condensed
          scrollable
          noShadow
        />
      )}
      <style>{`
        .merchant-permissions__search input {
          border: 1px solid var(--sl-color-border);
          border-radius: 0.5rem;
          font: inherit;
          padding: 0.5rem 0.75rem;
        }

        .merchant-permissions__chips {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .merchant-permissions__chips li {
          margin: 0;
          background: var(--sl-color-bg-soft);
          border-radius: 999px;
          padding: 0.125rem 0.75rem;
          font-size: 0.85rem;
          border: 1px solid var(--sl-color-border-strong);
        }

        .merchant-permissions__name {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .merchant-permissions__name code {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .merchant-permissions__empty {
          color: var(--sl-color-text-accent);
        }

        .merchant-permissions__stats {
          font-size: 0.9rem;
          margin: 0.5rem 0 1rem;
        }
      `}</style>
    </div>
  );
}
