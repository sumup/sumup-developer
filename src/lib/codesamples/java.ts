import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getParameterExample, getRequestBodyExample } from "./util";

const INDENT = "  ";

const indentMultiline = (text: string, indent: string): string => {
  return text.replace(/\n/g, `\n${indent}`);
};

const getSchemaTypeName = (
  schema: OpenAPIV3_1.ReferenceObject | OpenAPIV3_1.SchemaObject,
  fallback: string,
): string => {
  if ("$ref" in schema) {
    return Case.pascal(schema.$ref.split("/").pop()!);
  }

  if ("title" in schema && schema.title) {
    return Case.pascal(schema.title);
  }

  return Case.pascal(fallback);
};

const formatPrimitive = (
  value: string | number | boolean | null,
  schema?: OpenAPIV3_1.SchemaObject,
): string => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    if (schema?.format === "date-time") {
      return `java.time.OffsetDateTime.parse(${JSON.stringify(value)})`;
    }

    if (schema?.format === "date") {
      return `java.time.LocalDate.parse(${JSON.stringify(value)})`;
    }

    return JSON.stringify(value);
  }

  if (typeof value === "number") {
    if (schema?.type === "integer") {
      if (schema.format === "int64") {
        return `${value}L`;
      }

      return `${value}`;
    }

    if (schema?.type === "number") {
      return Number.isInteger(value) ? `${value}f` : `${value}f`;
    }

    return `${value}`;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  return "null";
};

const isEnumSchema = (schema: OpenAPIV3_1.SchemaObject): boolean => {
  return Array.isArray(schema.enum) && schema.enum.length > 0;
};

const formatEnum = (value: string, typeName: string): string => {
  return `${typeName}.fromValue(${JSON.stringify(value)})`;
};

const formatArray = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[],
  schema: OpenAPIV3_1.SchemaObject,
  indentLevel: number,
  propertyName: string,
): string => {
  if (values.length === 0) {
    return "java.util.List.of()";
  }

  const itemSchema =
    "items" in schema && schema.items ? resolveSchema(schema.items) : {};
  const itemTypeName =
    "items" in schema && schema.items
      ? getSchemaTypeName(schema.items, `${Case.pascal(propertyName)}Item`)
      : `${Case.pascal(propertyName)}Item`;

  const arrayIndent = INDENT.repeat(indentLevel);
  const itemIndent = INDENT.repeat(indentLevel + 1);

  const items = values
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => {
      if (item !== null && typeof item === "object") {
        const objectInit = generateJavaBuilder(
          item,
          itemSchema as OpenAPIV3_1.SchemaObject,
          itemTypeName,
          indentLevel + 1,
        );

        return `${itemIndent}${indentMultiline(objectInit, itemIndent)}`;
      }

      return `${itemIndent}${formatPrimitive(item as never, itemSchema as OpenAPIV3_1.SchemaObject)}`;
    })
    .join(",\n");

  return `java.util.List.of(\n${items}\n${arrayIndent})`;
};

const generateJavaBuilder = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  example: any,
  schema: OpenAPIV3_1.SchemaObject,
  typeName: string,
  indentLevel = 0,
): string => {
  if (!example || typeof example !== "object") {
    return "";
  }

  const indent = INDENT.repeat(indentLevel);
  const fieldIndent = INDENT.repeat(indentLevel + 1);
  const properties = schema.properties || {};

  const fields = Object.entries(example)
    .map(([key, value]) => {
      const methodName = Case.camel(key);
      const propSchema = properties[key];

      if (!propSchema) {
        return `${fieldIndent}.${methodName}(${formatPrimitive(value as never)})`;
      }

      const resolved = resolveSchema(propSchema);

      if (resolved && isEnumSchema(resolved) && typeof value === "string") {
        const enumTypeName = getSchemaTypeName(propSchema, key);
        return `${fieldIndent}.${methodName}(${formatEnum(value, enumTypeName)})`;
      }

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        const nestedTypeName = getSchemaTypeName(propSchema, key);
        const nestedInit = generateJavaBuilder(
          value,
          resolved,
          nestedTypeName,
          indentLevel + 1,
        );

        return `${fieldIndent}.${methodName}(${indentMultiline(nestedInit, fieldIndent)})`;
      }

      if (Array.isArray(value)) {
        const arrayInit = formatArray(value, resolved, indentLevel + 1, key);

        return `${fieldIndent}.${methodName}(${indentMultiline(arrayInit, fieldIndent)})`;
      }

      return `${fieldIndent}.${methodName}(${formatPrimitive(value as never, resolved)})`;
    })
    .join("\n");

  return `${typeName}.builder()\n${fields}\n${fieldIndent}.build()`;
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

  const typeName = getSchemaTypeName(
    requestBodySchema,
    `${Case.pascal(operation.operationId!)}Body`,
  );

  return generateJavaBuilder(example, schema, typeName);
};

const formatArgument = (argument: string): string => {
  return `${INDENT}${indentMultiline(argument, INDENT)}`;
};

export const java = (operation: OperationObject): string => {
  const resource = Case.camel(operation.tag);
  const methodName = Case.camel(operation.operationId!);

  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramArgs = requiredParams.map((param) => {
    const schema = param.schema ? resolveSchema(param.schema) : undefined;
    return formatPrimitive(getParameterExample(param), schema);
  });

  const bodyArg = requestBody(operation);
  const args = [...paramArgs];

  if (bodyArg) {
    args.push(bodyArg);
  }

  const formattedArgs =
    args.length > 0
      ? `\n${args.map((arg) => formatArgument(arg)).join(",\n")}\n`
      : "";

  return `import com.sumup.sdk.SumUpClient;

SumUpClient client = SumUpClient.builder().build();

var result = client.${resource}().${methodName}(${formattedArgs});`;
};
