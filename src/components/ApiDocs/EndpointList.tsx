import { ListItemGroup } from "@sumup-oss/circuit-ui";
import type { OperationObject } from "src/types/openapi";

import styles from "./EndpointList.module.css";

interface Props {
  operations: OperationObject[];
  tagSlug: string;
}

const EndpointDetails = ({ operation }: { operation: OperationObject }) => {
  const method = operation.method.toLowerCase();

  return (
    <span className={styles.endpoint}>
      <span className={`${styles.method} ${styles[method] ?? ""}`}>
        {method.toUpperCase()}
      </span>
      <span className={styles.path}>{operation.path}</span>
    </span>
  );
};

export default function EndpointList({ operations, tagSlug }: Props) {
  return (
    <ListItemGroup
      label="Endpoints"
      hideLabel
      items={operations.map((operation) => ({
        key: operation.slug,
        label:
          operation.summary ??
          `${operation.method.toUpperCase()} ${operation.path}`,
        details: <EndpointDetails operation={operation} />,
        href: `/api/${tagSlug}/${operation.slug}/`,
        variant: "navigation",
      }))}
    />
  );
}
