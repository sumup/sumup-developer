import catalog from "../data/merchant-permissions.json" with { type: "json" };

export type PermissionKind = "assignable" | "inherited";

export function permissionEntries(kind: PermissionKind) {
  return catalog.filter(
    (entry) => entry.assignable === (kind === "assignable"),
  );
}

export function permissionTableMarkdown(kind: PermissionKind) {
  const rows = permissionEntries(kind).map(
    ({ name, granted_by }) =>
      `| \`${name}\` | ${granted_by.length ? granted_by.map((grant) => `\`${grant}\``).join(", ") : "—"} |`,
  );
  return ["| Permission | Granted by |", "| --- | --- |", ...rows].join("\n");
}
