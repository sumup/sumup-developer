import type { OpenAPIV3_1 } from "openapi-types";
import { doc } from "./documents";

class SchemaError extends Error {
  schema: OpenAPIV3_1.ReferenceObject;

  constructor(message: string, schema: OpenAPIV3_1.ReferenceObject) {
    super(message);
    this.schema = schema;
  }
}

/** Resolves a parameter object, recursively following local `$ref` pointers in `components.parameters`. */
export const resolveParameter = (
  param: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.ParameterObject,
): OpenAPIV3_1.ParameterObject => {
  if ("$ref" in param) {
    const ref = param.$ref;
    const [, , name] = ref.split("/");
    if (!doc.components?.parameters) {
      throw new Error(
        `Resolve reference "${ref}": 'components' don't have 'parameters'`,
      );
    }
    const resolved = doc.components?.parameters[name];
    if (!resolved) {
      throw new Error(`Resolve reference "${ref}": not found`);
    }
    if ("$ref" in resolved) {
      return resolveParameter(resolved);
    }
    return resolved;
  }
  return param;
};

/** Resolves a request body object, recursively following local `$ref` pointers in `components.requestBodies`. */
export const resolveBody = (
  body?: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.RequestBodyObject,
): OpenAPIV3_1.RequestBodyObject | undefined => {
  if (!body) return undefined;
  if ("$ref" in body) {
    const ref = body.$ref;
    const [, , name] = ref.split("/");
    if (!doc.components?.requestBodies) {
      throw new Error(
        `Resolve reference "${ref}": 'components' don't have 'requestBodies'`,
      );
    }
    const resolved = doc.components?.requestBodies[name];
    if (!resolved) {
      throw new Error(`Resolve reference "${ref}": not found`);
    }
    if ("$ref" in resolved) {
      return resolveBody(resolved);
    }
    return resolved;
  }
  return body;
};

/** Returns a raw component collection (for example, `schemas`, `responses`, `parameters`). */
export const reolveComponent = (ref: keyof OpenAPIV3_1.ComponentsObject) => {
  return doc.components?.[ref];
};

/** Resolves a local JSON pointer like `#/components/schemas/Foo` against the loaded OpenAPI document. */
export const resolveReference = <
  T extends OpenAPIV3_1.SchemaObject = OpenAPIV3_1.SchemaObject,
>(
  ref: string,
): T | null => {
  if (!ref.startsWith("#/")) return null;
  const [path, kind, name] = ref.replace("#/", "").split("/");
  const x: Record<
    string,
    Record<string, Record<string, OpenAPIV3_1.SchemaObject>>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  > = doc as any;
  if (!Object.hasOwn(x, path)) return null;
  if (!Object.hasOwn(x[path], kind)) return null;
  if (!Object.hasOwn(x[path][kind], name)) return null;
  return x[path][kind][name] as T;
};

/**
 * Resolves a schema reference and performs a light `allOf` merge.
 *
 * Non-obvious behavior:
 * - This mutates the schema object by merging `allOf` properties into `obj.properties`.
 * - It also forces `obj.type = "object"` as a compatibility fix for the current schema set.
 */
export const resolveSchema = (
  obj: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
): OpenAPIV3_1.SchemaObject => {
  if ("$ref" in obj) {
    const resolved = resolveReference(obj.$ref);
    if (!resolved) {
      throw new SchemaError(`Invalid reference ${obj.$ref}`, obj);
    }
    obj = resolved as OpenAPIV3_1.SchemaObject;
  }

  if (obj.allOf) {
    for (let subSchema of obj.allOf) {
      if ("$ref" in subSchema) {
        const def = resolveReference(subSchema.$ref);
        if (!def) {
          continue;
        }
        subSchema = def;
      }
      obj.properties = {
        ...obj.properties,
        ...subSchema.properties,
      };
    }
    // TODO: remove, fixup for invalid schema
    obj.type = "object";
  }

  return obj;
};

/** Type guard used where request bodies may still be `$ref` objects. */
export const isRequestBody = (
  object:
    | OpenAPIV3_1.RequestBodyObject
    | OpenAPIV3_1.ReferenceObject
    | undefined,
): object is OpenAPIV3_1.RequestBodyObject => !!object && !("$ref" in object);

/**
 * Builds a JSON-like example payload from a schema.
 * Prefers explicit `example`/`examples`; otherwise generates by type recursively.
 */
export const schemaToExample = (
  obj: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  required = false,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | null => {
  const schema = resolveSchema(obj);

  // prefer the top-most example over resolving examples from children properties
  if (schema.example) {
    return schema.example;
  }

  if (schema.examples && schema.examples.length > 0) {
    return schema.examples[0];
  }

  switch (schema.type) {
    case "object":
      return Object.fromEntries(
        Object.entries(schema.properties || {}).map(([key, val]) => [
          key,
          schemaToExample(val, schema.required?.includes(key)),
        ]),
      );
    case "array":
      return [schemaToExample(schema.items)];
    case "string":
      return required ? "" : null;
    case "number":
      return required ? 0.0 : null;
    case "integer":
      return required ? 0 : null;
    case "boolean":
      return required ? false : null;
    default:
      return required ? {} : null;
  }
};
