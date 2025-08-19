import { isRequestBody, schemaToExample } from "@lib/openapi";
import type { OperationObject } from "src/types/openapi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const bodyExample = (operation: OperationObject): any => {
  if (!isRequestBody(operation.requestBody)) {
    return undefined;
  }

  if (!("application/json" in operation.requestBody.content)) {
    return undefined;
  }

  if (operation.requestBody.content["application/json"].example) {
    return operation.requestBody.content["application/json"].example;
  }

  return schemaToExample(
    operation.requestBody.content["application/json"].schema!,
  );
};
