import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { bodyExample } from "./util";

export const node = (operation: OperationObject): string => {
  const resource = Case.camel(operation.tag);
  const method = Case.camel(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );
  const example = bodyExample(operation);
  const body = example
    ? JSON.stringify(example, null, 2).replace(/"([^"]+)":/g, "$1:")
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

  const njs = `import { SumUp } from '@sumup/sdk';

const sumup = new SumUp({ apiKey: 'sup_sk_MvxmLOl0...' });

const res = await sumup.${resource}.${method}(${paramsSection}${body});`;

  return njs;
};
