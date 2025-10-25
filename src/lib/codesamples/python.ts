import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getRequestBodyExample, getParameterExample } from "./util";

/**
 * Generates Python class instantiation code from an example object.
 * Similar to Go struct initialization, uses Pydantic classes with keyword arguments.
 */
const generatePythonClassInit = (
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
        return `${indent}  ${key}=${JSON.stringify(value)},`;
      }

      const resolved = resolveSchema(propSchema);

      // Handle nested objects
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Get the class name from $ref or use schema title/key
        let className = "";
        if ("$ref" in propSchema) {
          className = Case.pascal(propSchema.$ref.split("/").pop()!);
        } else if (resolved.title) {
          className = Case.pascal(resolved.title);
        } else {
          className = Case.pascal(key);
        }

        const nestedInit = generatePythonClassInit(
          value,
          resolved,
          indent + "  ",
        );
        return `${indent}  ${key}=${className}${nestedInit},`;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `${indent}  ${key}=[],`;
        }

        const firstItem = value[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          // Array of objects
          let itemClassName = "";
          if (
            "items" in resolved &&
            resolved.items &&
            "$ref" in resolved.items
          ) {
            itemClassName = Case.pascal(resolved.items.$ref.split("/").pop()!);
          } else if (
            "items" in resolved &&
            resolved.items &&
            "title" in resolved.items &&
            resolved.items.title
          ) {
            itemClassName = Case.pascal(resolved.items.title);
          } else {
            itemClassName = Case.pascal(key);
          }

          const itemSchema =
            "items" in resolved && resolved.items
              ? resolveSchema(resolved.items)
              : {};
          const itemsInit = value
            .map((item) => {
              return `${indent}    ${itemClassName}${generatePythonClassInit(item, itemSchema as OpenAPIV3_1.SchemaObject, indent + "    ")}`;
            })
            .join(",\n");

          return `${indent}  ${key}=[\n${itemsInit},\n${indent}  ],`;
        }

        return `${indent}  ${key}=${JSON.stringify(value)},`;
      }

      // Primitives
      return `${indent}  ${key}=${JSON.stringify(value)},`;
    })
    .join("\n");

  return `(\n${fields}\n${indent})`;
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

  const bodyClassName = `${Case.pascal(operation.operationId!)}Body`;

  const example = getRequestBodyExample(operation);

  if (!example || typeof example !== "object") {
    return "";
  }

  return `${bodyClassName}${generatePythonClassInit(example, schema)}`;
};

export const python = (operation: OperationObject): string => {
  const resource = Case.snake(operation.tag);
  const method = Case.snake(
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

  const njs = `from sumup import Sumup

client = SumUp()

res = sumup.${resource}.${method}(${paramsSection}${body})`;

  return njs;
};
