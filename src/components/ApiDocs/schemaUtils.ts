import { resolveSchema } from "@lib/openapi";
import type { OpenAPIV3_1 } from "openapi-types";

type SchemaOrRef = OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject;

export const isNonArraySchemaObject = (
  object: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined,
): object is OpenAPIV3_1.NonArraySchemaObject =>
  !!object && !("items" in object);

export const getRenderableAttributesSchema = (
  object: OpenAPIV3_1.SchemaObject | OpenAPIV3_1.ReferenceObject | undefined,
): OpenAPIV3_1.SchemaObject | null => {
  if (!object) return null;

  const schema = resolveSchema(object);
  const hasProperties = Object.keys(schema.properties || {}).length > 0;

  if (hasProperties) return schema;

  if (schema.type === "array" && "items" in schema) {
    return getRenderableAttributesSchema(schema.items);
  }

  return null;
};

export const getSchemaEnumValues = (
  schema: OpenAPIV3_1.SchemaObject,
): unknown[] | null => {
  if ("enum" in schema && Array.isArray(schema.enum)) {
    return schema.enum;
  }

  if ("items" in schema && schema.items) {
    const items = resolveSchema(schema.items as SchemaOrRef);
    if ("enum" in items && Array.isArray(items.enum)) {
      return items.enum;
    }
  }

  return null;
};
