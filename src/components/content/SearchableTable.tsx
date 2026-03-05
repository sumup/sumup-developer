import { Button, SearchInput } from "@sumup-oss/circuit-ui";
import { useEffect, useMemo, useRef, useState } from "react";

import styles from "./SearchableTable.module.css";
import Table, { type TableColumn } from "./Table";

export type SearchableTableColumn = TableColumn;

type Props = {
  columns: SearchableTableColumn[];
  rows: Record<string, unknown>[];
  searchPlaceholder?: string;
  maxHeight?: number;
  tableLayout?: "fixed" | "auto";
};

const SearchableTable = ({
  columns,
  rows,
  searchPlaceholder = "Search",
  maxHeight = 420,
  tableLayout = "fixed",
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const getSearchableRowText = (row: Record<string, unknown>) => {
    return columns
      .map((column) => {
        return String(row[column.key]);
      })
      .join(" ")
      .toLowerCase();
  };

  const filteredRows = useMemo(() => {
    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) =>
      getSearchableRowText(row).includes(normalizedQuery),
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
      <SearchInput
        label="Search"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        placeholder={searchPlaceholder}
        hideLabel
      />

      <Table
        columns={columns}
        rows={filteredRows}
        tableLayout={tableLayout}
        containerRef={wrapperRef}
        maxHeight={isExpanded ? undefined : `${maxHeight}px`}
      />

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
