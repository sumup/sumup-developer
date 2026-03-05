import { type ReactNode } from "react";

import styles from "./SearchableTable.module.css";

export type TableColumn<T> = {
  key: string;
  label: string;
  getValue: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  width?: string;
  wrap?: "anywhere" | "word" | "nowrap";
};

type Props<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey?: (row: T, index: number) => string;
  tableLayout?: "fixed" | "auto";
};

const getColumnStyle = <T,>(column: TableColumn<T>) => {
  const wrapStyle =
    column.wrap === "nowrap"
      ? {
          whiteSpace: "nowrap" as const,
          overflowWrap: "normal" as const,
          wordBreak: "normal" as const,
        }
      : column.wrap === "word"
        ? {
            whiteSpace: "normal" as const,
            overflowWrap: "normal" as const,
            wordBreak: "normal" as const,
          }
        : undefined;

  return {
    ...(column.width ? { width: column.width } : {}),
    ...(wrapStyle ?? {}),
  };
};

const Table = <T,>({
  columns,
  rows,
  getRowKey,
  tableLayout = "fixed",
}: Props<T>) => (
  <table className={styles.table} style={{ tableLayout }}>
    <thead>
      <tr>
        {columns.map((column) => (
          <th key={column.key} style={getColumnStyle(column)}>
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row, index) => (
        <tr key={getRowKey ? getRowKey(row, index) : String(index)}>
          {columns.map((column) => (
            <td key={column.key} style={getColumnStyle(column)}>
              {column.render
                ? column.render(row)
                : String(column.getValue(row) ?? "")}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);

export default Table;
