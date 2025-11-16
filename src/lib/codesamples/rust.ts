import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getRequestBodyExample, getParameterExample } from "./util";

/**
 * Generates Rust struct initialization code from an example object.
 * Uses Rust struct literal syntax with named fields.
 */
const generateRustStructInit = (
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
      const fieldName = Case.snake(key);
      const propSchema = properties[key];

      if (!propSchema) {
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

        const nestedInit = generateRustStructInit(
          value,
          resolved,
          indent + "  ",
        );
        return `${indent}  ${fieldName}: sumup::${structName} ${nestedInit},`;
      }

      // Handle arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `${indent}  ${fieldName}: vec![],`;
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

          const itemSchema =
            "items" in resolved && resolved.items
              ? resolveSchema(resolved.items)
              : {};
          const itemsInit = value
            .map((item) => {
              return `${indent}    ${itemStructName} ${generateRustStructInit(item, itemSchema as OpenAPIV3_1.SchemaObject, indent + "    ")}`;
            })
            .join(",\n");

          return `${indent}  ${fieldName}: vec![\n${itemsInit},\n${indent}  ],`;
        }

        // Array of primitives
        const primitiveValues = value.map((v) => JSON.stringify(v)).join(", ");
        return `${indent}  ${fieldName}: vec![${primitiveValues}],`;
      }

      // Primitives - handle strings with proper Rust syntax
      if (typeof value === "string") {
        if (resolved.format === "password") {
          return `${indent}  ${fieldName}: crate::secret::Secret::from("${value}"),`;
        }
        return `${indent}  ${fieldName}: "${value}".to_string(),`;
      }

      return `${indent}  ${fieldName}: ${JSON.stringify(value)},`;
    })
    .join("\n");

  if (!fields) return "{}";

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

  const bodyStructName = `${Case.pascal(operation.operationId!)}Body`;

  const example = getRequestBodyExample(operation);

  if (!example || typeof example !== "object") {
    return "";
  }

  return `sumup::${bodyStructName}${generateRustStructInit(example, schema)}`;
};

export const rust = (operation: OperationObject): string => {
  const resource = Case.snake(operation.tag);
  const method = Case.snake(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );

  const body = requestBody(operation);

  // Separate path and query parameters
  const pathParams =
    operation.parameters?.filter((p) => p.in === "path" && p.required) || [];
  const queryParams =
    operation.parameters?.filter((p) => p.in === "query") || [];

  // Build the parameter list
  const paramsList: string[] = [];

  // Add path parameters first
  for (const param of pathParams) {
    const example = getParameterExample(param);
    const paramSchema = param.schema ? resolveSchema(param.schema) : {};
    if (typeof example === "string") {
      if (paramSchema.format === "password") {
        paramsList.push(`crate::secret::Secret::from("${example}")`);
      } else {
        paramsList.push(`"${example}"`);
      }
    } else {
      paramsList.push(`&${JSON.stringify(example)}`);
    }
  }

  // Add query parameters as a struct if any exist
  if (queryParams.length > 0) {
    const paramsStructName = `${Case.pascal(operation.operationId!)}Params`;
    const queryFields = queryParams
      .map((param) => {
        const fieldName = Case.snake(param.name);
        const example = getParameterExample(param);
        if (typeof example === "string") {
          return `    ${fieldName}: Some("${example}".to_string()),`;
        } else if (typeof example === "number") {
          return `    ${fieldName}: Some(${example}),`;
        } else if (typeof example === "boolean") {
          return `    ${fieldName}: Some(${example}),`;
        }
        return `    ${fieldName}: Some(${JSON.stringify(example)}),`;
      })
      .join("\n");

    paramsList.push(`sumup::${paramsStructName}{\n${queryFields}\n}`);
  }

  // Add body last
  if (body) {
    paramsList.push(`${body}`);
  }

  const paramsSection = paramsList.length > 0 ? paramsList.join(", ") : "";

  const rs = `use sumup::Client;

let client = Client::default();

let result = client.${resource}().${method}(${paramsSection}).await;`;

  return rs;
};
