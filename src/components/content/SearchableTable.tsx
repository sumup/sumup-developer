import { Button, SearchInput } from "@sumup-oss/circuit-ui";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";

import styles from "./SearchableTable.module.css";

export type SearchableTableColumn<T> = {
  key: string;
  label: string;
  getValue: (row: T) => string | number | null | undefined;
  render?: (row: T) => ReactNode;
  width?: string;
  wrap?: "anywhere" | "word" | "nowrap";
};

type Props<T> = {
  title?: string;
  columns: SearchableTableColumn<T>[];
  rows: T[];
  getRowKey?: (row: T, index: number) => string;
  searchPlaceholder?: string;
  maxHeight?: number;
  tableLayout?: "fixed" | "auto";
};

const SearchableTable = <T,>({
  title,
  columns,
  rows,
  getRowKey,
  searchPlaceholder = "Search",
  maxHeight = 320,
  tableLayout = "fixed",
}: Props<T>) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredRows = useMemo(() => {
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      columns.some((column) => {
        const value = column.getValue(row);
        return String(value ?? "")
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    );
  }, [columns, normalizedQuery, rows]);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) {
      return;
    }

    setCanExpand(container.scrollHeight > maxHeight);
  }, [filteredRows, maxHeight]);

  useEffect(() => {
    setIsExpanded(false);
  }, [searchQuery]);

  const getColumnStyle = (column: SearchableTableColumn<T>) => {
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

  return (
    <section className={`${styles.section} not-content`}>
      {title ? <h5>{title}</h5> : null}

      <SearchInput
        label="Search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={searchPlaceholder}
        hideLabel
      />

      <div className={styles.tableFrame}>
        <div
          ref={wrapperRef}
          className={styles.tableContainer}
          style={{ maxHeight: isExpanded ? "none" : `${maxHeight}px` }}
        >
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
              {filteredRows.map((row, index) => (
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
        </div>
      </div>

      {canExpand ? (
        <Button
          type="button"
          variant="tertiary"
          size="s"
          onClick={() => setIsExpanded((value) => !value)}
          className={styles.button}
        >
          {isExpanded ? "Collapse" : "Expand to view all"}
        </Button>
      ) : null}
    </section>
  );
};

export default SearchableTable;
