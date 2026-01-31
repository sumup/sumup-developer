import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { getRequestBodyExample, getParameterExample } from "./util";

const phpString = (value: string): string => {
  const escaped = value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `'${escaped}'`;
};

const phpLiteral = (value: string | number | boolean): string => {
  if (typeof value === "string") {
    return phpString(value);
  }
  return String(value);
};

const generatePhpValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  schema?: OpenAPIV3_1.SchemaObject,
  indent = "",
): string => {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "string" || typeof value === "number") {
    return phpLiteral(value);
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "[]";
    }

    const itemSchema =
      schema && "items" in schema && schema.items
        ? (resolveSchema(schema.items) as OpenAPIV3_1.SchemaObject)
        : undefined;

    const arrayLines = value.map((item) => {
      const rendered = generatePhpValue(item, itemSchema, indent + "  ");
      if (rendered.includes("\n")) {
        const indented = rendered.replace(/\n/g, `\n${indent}  `);
        return `${indent}  ${indented}`;
      }
      return `${indent}  ${rendered}`;
    });

    if (arrayLines.some((line) => line.includes("\n"))) {
      return `[\n${arrayLines.join(",\n")},\n${indent}]`;
    }

    return `[${arrayLines.join(", ")}]`;
  }

  if (typeof value === "object") {
    const properties = schema?.properties || {};
    const fields = Object.entries(value)
      .map(([key, nestedValue]) => {
        const propSchema = properties[key];
        const resolved = propSchema ? resolveSchema(propSchema) : undefined;
        const rendered = generatePhpValue(
          nestedValue,
          resolved as OpenAPIV3_1.SchemaObject | undefined,
          indent + "  ",
        );
        const formatted = rendered.includes("\n")
          ? rendered.replace(/\n/g, `\n${indent}  `)
          : rendered;
        return `${indent}  '${key}' => ${formatted},`;
      })
      .join("\n");

    return `[\n${fields}\n${indent}]`;
  }

  return phpLiteral(String(value));
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

  return generatePhpValue(example, schema);
};

export const php = (operation: OperationObject): string => {
  const resource = Case.camel(operation.tag);
  const method = Case.camel(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );

  const body = requestBody(operation);

  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramsString = requiredParams
    .map((param) => phpLiteral(getParameterExample(param)))
    .join(", ");

  const paramsSection = paramsString
    ? `${paramsString}${body ? ", " : ""}`
    : "";

  const code = `$sumup = new \\SumUp\\SumUp();

$result = $sumup->${resource}->${method}(${paramsSection}${body});`;

  return code;
};
