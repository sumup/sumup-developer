import { ListItemGroup } from "@sumup-oss/circuit-ui";
import type {
  ApiOperationPage,
  ApiOperationRef,
} from "@cloudflare/nimbus-docs/api";
import MethodStatus from "./MethodStatus";
import styles from "./ReferenceList.module.css";

type Props =
  | { label: "Endpoints"; operations: ApiOperationRef[] }
  | { label: "Events"; operations: ApiOperationPage[] };

export default function ReferenceList({ label, operations }: Props) {
  return (
    <ListItemGroup
      className={`not-content ${styles.list}`}
      label={label}
      hideLabel
      items={operations.map((operation) => ({
        key: operation.href,
        href: operation.href,
        variant: "navigation",
        ...(label === "Endpoints" ? { "data-api-endpoint": true } : {}),
        label:
          label === "Events" ? (
            <code className={styles.code}>{operation.path}</code>
          ) : "label" in operation ? (
            operation.label
          ) : (
            operation.title
          ),
        details:
          label === "Events" ? (
            operation.description
          ) : (
            <span className={styles.signature}>
              <MethodStatus method={operation.method} />
              <code className={styles.code}>{operation.path}</code>
            </span>
          ),
        trailingLabel: operation.deprecated ? "Deprecated" : undefined,
      }))}
    />
  );
}
