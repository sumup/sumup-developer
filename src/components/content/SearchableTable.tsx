import { Button, SearchInput } from "@sumup-oss/circuit-ui";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./SearchableTable.module.css";
import Table, { type TableColumn } from "./Table";

export type SearchableTableColumn<T> = TableColumn<T>;

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
          <Table
            columns={columns}
            rows={filteredRows}
            getRowKey={getRowKey}
            tableLayout={tableLayout}
          />
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
