import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getRequestBodyExample, getParameterExample } from "./util";

/**
 * Generates TypeScript object literal code from an example object.
 */
const generateTypeScriptObjectLiteral = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example: any,
  schema: OpenAPIV3_1.SchemaObject,
  indent = "",
): string => {
  if (example === null || example === undefined) {
    return "";
  }

  const properties = schema.properties || {};

  const fields = Object.entries(example)
    .map(([key, value]) => {
      const propSchema = properties[key];

      if (!propSchema) {
        return `${indent}  ${key}: ${JSON.stringify(value)},`;
      }

      const resolved = resolveSchema(propSchema);

      // Handle nested objects
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        const nestedLiteral = generateTypeScriptObjectLiteral(
          value,
          resolved,
          indent + "  ",
        );
        return `${indent}  ${key}: ${nestedLiteral},`;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `${indent}  ${key}: [],`;
        }

        const firstItem = value[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          const itemSchema =
            "items" in resolved && resolved.items
              ? resolveSchema(resolved.items)
              : {};
          const itemsLiteral = value
            .map((item) => {
              return `${indent}    ${generateTypeScriptObjectLiteral(item, itemSchema as OpenAPIV3_1.SchemaObject, indent + "    ")}`;
            })
            .join(",\n");

          return `${indent}  ${key}: [\n${itemsLiteral},\n${indent}  ],`;
        }

        return `${indent}  ${key}: ${JSON.stringify(value)},`;
      }

      // Primitives
      return `${indent}  ${key}: ${JSON.stringify(value)},`;
    })
    .join("\n");

  return `{\n${fields}\n${indent}}`;
};

const requestBody = (operation: OperationObject): string => {
  const requestBodySchema =
    operation.requestBody?.content?.["application/json"]?.schema;
  if (!requestBodySchema) {
    return "";
  }

  const schema = resolveSchema(requestBodySchema);
  if (!schema || !schema.properties) {
    return "";
  }

  const example = getRequestBodyExample(operation);

  if (!example || typeof example !== "object") {
    return "";
  }

  return generateTypeScriptObjectLiteral(example, schema);
};

export const node = (operation: OperationObject): string => {
  const resource = Case.camel(operation.tag);
  const method = Case.camel(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );

  const body = requestBody(operation);

  // Extract required parameters and use their examples from referenced schemas if available
  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramsString = requiredParams
    .map((param) => JSON.stringify(getParameterExample(param)))
    .join(", ");

  const paramsSection = paramsString
    ? `${paramsString}${body ? ", " : ""}`
    : "";

  const njs = `import { SumUp } from '@sumup/sdk';

const sumup = new SumUp();

const res = await sumup.${resource}.${method}(${paramsSection}${body});`;

  return njs;
};
