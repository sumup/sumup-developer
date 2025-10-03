import { isRequestBody, schemaToExample } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bodyExample = (operation: OperationObject): any => {
  if (!isRequestBody(operation.requestBody)) {
    return undefined;
  }

  if (!("application/json" in operation.requestBody.content)) {
    return undefined;
  }

  if (operation.requestBody.content["application/json"].example) {
    return operation.requestBody.content["application/json"].example;
  }

  if (!operation.requestBody.content["application/json"].schema) {
    return undefined;
  }

  return schemaToExample(
    operation.requestBody.content["application/json"].schema!,
  );
};

export const python = (operation: OperationObject): string => {
  const resource = Case.snake(operation.tag);
  const method = Case.snake(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );
  const example = bodyExample(operation);
  const body = example
    ? JSON.stringify(example, null, 2).replace(/"([^"]+)": /g, "$1=")
    : "";

  // Extract required parameters
  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramsString = requiredParams
    .map((param) =>
      JSON.stringify(
        (param.schema as OpenAPIV3_1.SchemaObject)?.example || param.name,
      ),
    )
    .join(", ");

  const paramsSection = paramsString
    ? `${paramsString}${body ? ", " : ""}`
    : "";

  const njs = `from sumup import Sumup

client = SumUp(api_key="sup_sk_MvxmLOl0...")

res = sumup.${resource}.${method}(${paramsSection}${body})`;

  return njs;
};
