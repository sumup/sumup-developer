import { isRequestBody, resolveSchema, schemaToExample } from "@lib/openapi";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";

/**
 * Recursively constructs an example object from a schema by:
 * 1. Using the example if defined in the schema
 * 2. Merging allOf schemas and recursively processing properties
 * 3. Handling objects, arrays, and primitives
 */
export const buildSchemaExample = (
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  return schemaToExample(schema);
};

/**
 * Filters an example object to only include required fields recursively.
 * This keeps examples minimal and focused on what's necessary.
 */
const filterRequiredFields = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example: any,
  schema: OpenAPIV3_1.SchemaObject,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any => {
  if (example === null || example === undefined) {
    return example;
  }

  // Handle primitives
  if (typeof example !== "object") {
    return example;
  }

  const properties = schema.properties || {};
  const requiredFields = new Set(schema.required || []);

  // Handle arrays
  if (Array.isArray(example)) {
    if (example.length === 0) {
      return example;
    }

    const firstItem = example[0];
    if (typeof firstItem === "object" && firstItem !== null) {
      const itemSchema =
        "items" in schema && schema.items ? resolveSchema(schema.items) : {};
      return example.map((item) =>
        filterRequiredFields(item, itemSchema as OpenAPIV3_1.SchemaObject),
      );
    }

    return example;
  }

  // Handle objects
  const filtered: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(example)) {
    if (!requiredFields.has(key)) {
      continue;
    }

    const propSchema = properties[key];
    if (!propSchema) {
      filtered[key] = value;
      continue;
    }

    const resolved = resolveSchema(propSchema);

    if (typeof value === "object" && value !== null) {
      filtered[key] = filterRequiredFields(value, resolved);
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
};

/**
 * Gets the request body example for an operation.
 * - If an explicit example is provided, returns it fully (all fields)
 * - If generating from schema, filters to only required fields for minimal examples
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getRequestBodyExample = (operation: OperationObject): any => {
  const requestBodyContent =
    operation.requestBody?.content?.["application/json"];
  const requestBodySchema = requestBodyContent?.schema;

  if (!requestBodySchema) {
    return undefined;
  }

  const schema = resolveSchema(requestBodySchema);

  if (!schema || !schema.properties) {
    return undefined;
  }

  // Check if an explicit example is provided at the content level or schema level
  const hasExplicitExample =
    requestBodyContent?.example !== undefined ||
    ("example" in requestBodySchema &&
      requestBodySchema.example !== undefined) ||
    ("examples" in requestBodySchema &&
      requestBodySchema.examples &&
      requestBodySchema.examples.length > 0);

  const example = buildSchemaExample(requestBodySchema);

  if (!example || typeof example !== "object") {
    return undefined;
  }

  // Only filter required fields for schema-generated examples, not explicit examples
  if (hasExplicitExample) {
    return example;
  }

  return filterRequiredFields(example, schema);
};

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

  if (!operation.requestBody.content["application/json"].schema) {
    return undefined;
  }

  return schemaToExample(
    operation.requestBody.content["application/json"].schema!,
  );
};

/**
 * Gets the example value for a parameter.
 * If the parameter schema is a reference, resolves it and uses its example.
 * Falls back to the parameter name if no example is found.
 */
export const getParameterExample = (
  param: OpenAPIV3_1.ParameterObject,
): string | number | boolean => {
  if (!param.schema) {
    return param.name;
  }

  // If schema has an example directly, use it
  if ("example" in param.schema && param.schema.example !== undefined) {
    return param.schema.example;
  }

  // If schema is a reference, resolve it and check for example
  if ("$ref" in param.schema) {
    const resolved = resolveSchema(param.schema);
    if (resolved.example !== undefined) {
      return resolved.example;
    }
  }

  // Fallback to parameter name
  return param.name;
};
