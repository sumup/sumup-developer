import { useMemo, useState } from "react";

import type { AssignablePermission } from "@lib/merchantPermissions";
import { Body, SearchInput } from "@sumup-oss/circuit-ui";

const VISIBLE_PERMISSION_COUNT = 20;

type SystemRolePermissionsListProps = {
  permissions: AssignablePermission[];
};

const normalize = (value: string) => value.trim().toLowerCase();

const getGrantDomain = (grant: string) => {
  const separatorIndex = grant.indexOf("_");
  return separatorIndex === -1 ? grant : grant.slice(0, separatorIndex);
};

const groupGrantsByDomain = (grants: string[]) => {
  const groups = new Map<string, string[]>();

  for (const grant of grants) {
    const domain = getGrantDomain(grant);

    if (!groups.has(domain)) {
      groups.set(domain, []);
    }

    groups.get(domain)!.push(grant);
  }

  return Array.from(groups.entries())
    .map(([domain, domainGrants]) => ({
      domain,
      grants: domainGrants.slice().sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.domain.localeCompare(b.domain));
};

export function SystemRolePermissionsList({
  permissions,
}: SystemRolePermissionsListProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const filteredPermissions = useMemo(() => {
    if (!normalizedQuery) {
      return permissions;
    }

    return permissions.filter((permission) =>
      permission.name.toLowerCase().includes(normalizedQuery),
    );
  }, [permissions, normalizedQuery]);

  const visiblePermissions = useMemo(() => {
    if (normalizedQuery) {
      return filteredPermissions;
    }

    return filteredPermissions.slice(0, VISIBLE_PERMISSION_COUNT);
  }, [filteredPermissions, normalizedQuery]);

  return (
    <div className="system-role-permissions">
      <SearchInput
        label="Search"
        placeholder="admin, accountant, member..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {!normalizedQuery && permissions.length > VISIBLE_PERMISSION_COUNT ? (
        <Body color="subtle" as="p" className="system-role-permissions__hint">
          Showing the first {VISIBLE_PERMISSION_COUNT} of {permissions.length}{" "}
          permissions. Use search to find the rest.
        </Body>
      ) : null}
      {filteredPermissions.length === 0 ? (
        <p>No matching permissions.</p>
      ) : (
        <ul className="system-role-permissions__list">
          {visiblePermissions.map((permission) => (
            <li key={permission.name}>
              <details open={normalizedQuery ? true : undefined}>
                <summary>
                  <span className="system-role-permissions__summary">
                    <Body weight="bold" as="span">
                      {permission.name}
                    </Body>
                    <Body color="subtle" as="span">
                      Grants {permission.grants.length} granular{" "}
                      {permission.grants.length === 1
                        ? "permission"
                        : "permissions"}
                    </Body>
                  </span>
                </summary>
                <ul className="system-role-permissions__grants">
                  {groupGrantsByDomain(permission.grants).map((domain) => (
                    <li
                      key={domain.domain}
                      className="system-role-permissions__grant-group"
                    >
                      <span>{domain.domain}</span>
                      <ul className="system-role-permissions__grant-items">
                        {domain.grants.map((grant) => (
                          <li key={grant}>
                            <code>{grant}</code>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .system-role-permissions__hint {
          margin: 0 0 1rem;
        }

        .system-role-permissions__list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .system-role-permissions details {
          border: 1px solid var(--sl-color-border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          background: var(--sl-color-bg-soft);
          margin: 0;
        }

        .system-role-permissions__summary {
          display: inline-flex;
          gap: 1rem;
          align-items: baseline;
          flex-wrap: wrap;
        }

        .system-role-permissions__grants {
          margin: 0.75rem 0 0;
          padding-left: 1.25rem;
          list-style: none;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
          gap: 0.75rem;
        }

        .system-role-permissions__grant-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          list-style: none;
        }

        .system-role-permissions__grant-group span {
          font-weight: 600;
        }

        .system-role-permissions__grant-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .system-role-permissions__grant-items code {
          word-break: break-all;
        }
      `}</style>
    </div>
  );
}
