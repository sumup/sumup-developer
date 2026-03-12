import { type ReactNode, type RefObject } from "react";
import { getIconURL, type IconName } from "@sumup-oss/icons";

import styles from "./Table.module.css";

type IconSize = "16" | "24" | "32" | "480";

export type TableColumn = {
  key: string;
  label: string;
  as?: "text" | "code";
  size?: IconSize | 16 | 24 | 32 | 480;
  minWidth?: string;
  nowrap?: boolean;
};

type Props = {
  columns: TableColumn[];
  rows: Record<string, unknown>[];
  tableLayout?: "fixed" | "auto";
  maxHeight?: number | string;
  containerRef?: RefObject<HTMLDivElement | null>;
};

const getColumnStyle = (column: TableColumn) => {
  const wrapStyle = column.nowrap
    ? {
        whiteSpace: "nowrap" as const,
        overflowWrap: "normal" as const,
        wordBreak: "normal" as const,
      }
    : undefined;

  return {
    ...(column.minWidth ? { minWidth: column.minWidth } : {}),
    ...(wrapStyle ?? {}),
  };
};

const renderCellValue = (
  column: TableColumn,
  row: Record<string, unknown>,
): ReactNode => {
  if (column.key === "icon") {
    const iconSize = column.size
      ? (String(column.size) as IconSize)
      : undefined;
    const iconUrl = column.size
      ? getIconURL(row[column.key] as IconName, iconSize)
      : getIconURL(row[column.key] as IconName);

    return (
      <img className={styles.icon} src={iconUrl} alt="" aria-hidden="true" />
    );
  }

  if (column.as === "code") {
    return <code dir="auto">{String(row[column.key])}</code>;
  }

  return String(row[column.key]);
};

const Table = ({
  columns,
  rows,
  tableLayout = "fixed",
  maxHeight,
  containerRef,
}: Props) => {
  const table = (
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
          <tr key={String(index)}>
            {columns.map((column) => (
              <td
                key={column.key}
                style={getColumnStyle(column)}
                className={column.key === "icon" ? styles.iconCell : undefined}
              >
                {renderCellValue(column, row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className={styles.tableFrame}>
      <div
        ref={containerRef}
        className={styles.tableContainer}
        style={maxHeight === undefined ? undefined : { maxHeight }}
      >
        {table}
      </div>
    </div>
  );
};

export default Table;
