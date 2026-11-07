import { Status, type StatusProps } from "@sumup-oss/circuit-ui";

const colors: Record<string, StatusProps["color"]> = {
  GET: "confirm",
  HEAD: "confirm",
  POST: "promo",
  PUT: "notify",
  PATCH: "notify",
  DELETE: "alert",
};

export default function MethodStatus({ method }: { method: string }) {
  const name = method.toUpperCase();
  return (
    <Status
      as="span"
      variant="pill"
      color={colors[name] ?? "neutral"}
      data-http-method={name}
    >
      {name}
    </Status>
  );
}
