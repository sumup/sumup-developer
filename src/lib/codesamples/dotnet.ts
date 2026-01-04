import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getParameterExample, getRequestBodyExample } from "./util";

const INDENT = "    ";

const indentMultiline = (text: string, indent: string): string => {
  return text.replace(/\n/g, `\n${indent}`);
};

const formatPrimitive = (value: string | number | boolean | null): string => {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return `${value}`;
  }

  if (value === null) {
    return "null";
  }

  return "null";
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

const generateArrayInitializer = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  values: any[],
  schema: OpenAPIV3_1.SchemaObject,
  indentLevel: number,
  propertyName: string,
): string => {
  if (values.length === 0) {
    return "Array.Empty<object>()";
  }

  const firstValue = values[0];

  if (typeof firstValue === "object" && firstValue !== null) {
    const itemsSchema =
      "items" in schema && schema.items ? resolveSchema(schema.items) : {};
    const typeName =
      "items" in schema && schema.items
        ? getSchemaTypeName(schema.items, `${Case.pascal(propertyName)}Item`)
        : `${Case.pascal(propertyName)}Item`;

    const collectionIndent = INDENT.repeat(indentLevel);
    const itemIndent = INDENT.repeat(indentLevel + 1);

    const items = values
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => {
        const objectInit = generateCSharpObjectInitializer(
          item,
          itemsSchema as OpenAPIV3_1.SchemaObject,
          typeName,
          indentLevel + 1,
        );

        return `${itemIndent}${indentMultiline(objectInit, itemIndent)},`;
      })
      .join("\n");

    return `new[]\n${collectionIndent}{\n${items}\n${collectionIndent}}`;
  }

  const primitiveValues = values.map((value) => formatPrimitive(value));
  return `new[] { ${primitiveValues.join(", ")} }`;
};

const generateCSharpObjectInitializer = (
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
      const propertyName = Case.pascal(key);
      const propSchema = properties[key];

      if (!propSchema) {
        return `${fieldIndent}${propertyName} = ${formatPrimitive(value as never)},`;
      }

      const resolved = resolveSchema(propSchema);

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        const nestedTypeName = getSchemaTypeName(propSchema, propertyName);
        const nestedInit = generateCSharpObjectInitializer(
          value,
          resolved,
          nestedTypeName,
          indentLevel + 1,
        );

        return `${fieldIndent}${propertyName} = ${nestedInit},`;
      }

      if (Array.isArray(value)) {
        const arrayInit = generateArrayInitializer(
          value,
          resolved,
          indentLevel + 1,
          propertyName,
        );

        return `${fieldIndent}${propertyName} = ${arrayInit},`;
      }

      return `${fieldIndent}${propertyName} = ${formatPrimitive(value as never)},`;
    })
    .join("\n");

  return `new ${typeName}\n${indent}{\n${fields}\n${indent}}`;
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

  return generateCSharpObjectInitializer(example, schema, typeName);
};

const formatArgument = (argument: string): string => {
  return `${INDENT}${indentMultiline(argument, INDENT)}`;
};

export const dotnet = (operation: OperationObject): string => {
  const resource = Case.pascal(operation.tag);
  const methodName = Case.pascal(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );

  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramArgs = requiredParams.map((param) => {
    return formatPrimitive(getParameterExample(param) as never);
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

  return `using SumUp;

var client = new SumUpClient();

var result = await client.${resource}.${methodName}Async(${formattedArgs});`;
};
