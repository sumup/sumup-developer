import { SearchInput } from "@sumup-oss/circuit-ui";
import { useMemo, useRef, useState } from "react";

import styles from "./SearchableTable.module.css";
import Table, { type TableColumn } from "./Table";

export type SearchableTableColumn = TableColumn;

type Props = {
  columns: SearchableTableColumn[];
  rows: Record<string, unknown>[];
  searchPlaceholder?: string;
  tableLayout?: "fixed" | "auto";
};

const SearchableTable = ({
  columns,
  rows,
  searchPlaceholder = "Search",
  tableLayout = "fixed",
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
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
        maxHeight="420px"
      />
    </section>
  );
};

export default SearchableTable;
