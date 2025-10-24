import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getRequestBodyExample, getParameterExample } from "./util";

/**
 * Generates Go struct initialization code from an example object.
 */
const generateGoStructInit = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example: any,
  schema: OpenAPIV3_1.SchemaObject,
  packageName: string,
  indent = "",
): string => {
  if (example === null || example === undefined) {
    return "";
  }

  const properties = schema.properties || {};

  const fields = Object.entries(example)
    .map(([key, value]) => {
      const fieldName = Case.pascal(key);
      const propSchema = properties[key];

      if (!propSchema) {
        // Fallback for unknown properties
        return `${indent}  ${fieldName}: ${JSON.stringify(value)},`;
      }

      const resolved = resolveSchema(propSchema);

      // Handle nested objects
      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        // Get the struct name from $ref or use schema title/key
        let structName = "";
        if ("$ref" in propSchema) {
          structName = Case.pascal(propSchema.$ref.split("/").pop()!);
        } else if (resolved.title) {
          structName = Case.pascal(resolved.title);
        } else {
          structName = Case.pascal(key);
        }

        const nestedInit = generateGoStructInit(
          value,
          resolved,
          packageName,
          indent + "  ",
        );
        return `${indent}  ${fieldName}: ${packageName}.${structName}${nestedInit},`;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `${indent}  ${fieldName}: []any{},`;
        }

        const firstItem = value[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          // Array of objects
          let itemStructName = "";
          if (
            "items" in resolved &&
            resolved.items &&
            "$ref" in resolved.items
          ) {
            itemStructName = Case.pascal(resolved.items.$ref.split("/").pop()!);
          } else if (
            "items" in resolved &&
            resolved.items &&
            "title" in resolved.items &&
            resolved.items.title
          ) {
            itemStructName = Case.pascal(resolved.items.title);
          } else {
            itemStructName = Case.pascal(key);
          }

          const itemsInit = value
            .map((item) => {
              const itemSchema =
                "items" in resolved && resolved.items
                  ? resolveSchema(resolved.items)
                  : {};
              return `${indent}    ${packageName}.${itemStructName}${generateGoStructInit(item, itemSchema as OpenAPIV3_1.SchemaObject, packageName, indent + "    ")}`;
            })
            .join(",\n");

          return `${indent}  ${fieldName}: []${packageName}.${itemStructName}{\n${itemsInit},\n${indent}  },`;
        }

        // Array of primitives
        return `${indent}  ${fieldName}: ${JSON.stringify(value)},`;
      }

      // Primitives
      return `${indent}  ${fieldName}: ${JSON.stringify(value)},`;
    })
    .join("\n");

  return `{\n${fields}\n${indent}}`;
};

const requestBody = (operation: OperationObject): string => {
  const example = getRequestBodyExample(operation);

  if (!example || typeof example !== "object") {
    return "";
  }

  const requestBodySchema =
    operation.requestBody?.content?.["application/json"]?.schema;
  if (!requestBodySchema) {
    return "";
  }

  const schema = resolveSchema(requestBodySchema);
  if (!schema || !schema.properties) {
    return "";
  }

  const packageName = Case.snake(operation.tag);
  const bodyStructName = `${Case.pascal(operation.operationId!)}Body`;

  return `${packageName}.${bodyStructName}${generateGoStructInit(example, schema, packageName)}`;
};

export const go = (operation: OperationObject): string => {
  const resource = Case.pascal(operation.tag);
  const method = Case.pascal(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );

  const body = requestBody(operation);

  // Extract required parameters and use their examples from referenced schemas if available
  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramsString = requiredParams
    .map((param) => JSON.stringify(getParameterExample(param)))
    .join(", ");

  const go = `client := sumup.NewClient()

result, err := client.${resource}.${method}(context.Background()${paramsString ? `, ${paramsString}` : ""}${body ? `, ${body}` : ""})`;

  return go;
};
