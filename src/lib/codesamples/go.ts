import { isRequestBody, schemaToExample, resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";

const objectToGo = (x: Record<string, unknown>) => {
  return Object.entries(x)
    .map(([k, v]) => {
      return `${Case.pascal(k)}: ${JSON.stringify(v)}`;
    })
    .join(",\n");
};

const requestBody = (operation: OperationObject): string => {
  if (!isRequestBody(operation.requestBody)) {
    return "";
  }

  if (!("application/json" in operation.requestBody.content)) {
    return "";
  }

  const example =
    operation.requestBody.content["application/json"].example ||
    Object.values(
      operation.requestBody.content["application/json"].examples || {},
    ).at(0)?.value ||
    schemaToExample(
      operation.requestBody?.content?.["application/json"]?.schema,
    );

  if (!example) {
    return "";
  }

  const bodyStructName = `${Case.pascal(operation.operationId!)}Request`;

  if (example) {
    return `${bodyStructName}{
${objectToGo(example)
  .split("\n")
  .map((x) => `\t${x}`)
  .join("\n")}
}`;
  }

  const bodyFields = Object.entries(operation.requestBody.properties)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map(([key, value]: [string, any]) => {
      const field = resolveSchema(value);

      const fieldType = value?.$ref
        ? Case.pascal(value.$ref.split("/").pop()!)
        : value.type === "object"
          ? "struct{}"
          : value.type === "array"
            ? `[]${Case.pascal(value.items?.$ref?.split("/").pop() || "interface")}`
            : value.type || "interface{}";

      let exampleValue = "";
      if (field.example !== undefined) {
        exampleValue = JSON.stringify(field.example);
      } else if (fieldType.includes("struct")) {
        exampleValue = "any";
      } else if (fieldType.includes("[]")) {
        exampleValue = "[]any{}";
      }

      return `${Case.pascal(key)}: ${exampleValue},`;
    })
    .join("\n  ");

  return `${bodyStructName}{
  ${bodyFields}
}`;
};

export const go = (operation: OperationObject): string => {
  const resource = Case.pascal(operation.tag);
  const method = Case.pascal(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );

  const body = requestBody(operation);

  // Extract required parameters
  const requiredParams = operation.parameters?.filter((p) => p.required) || [];
  const paramsString = requiredParams
    .map((param) =>
      JSON.stringify(
        (param.schema as OpenAPIV3_1.SchemaObject)?.example || param.name,
      ),
    )
    .join(", ");

  const paramsSection = paramsString
    ? `, ${paramsString}${body ? ", " : ""}`
    : "";

  const go = `client := sumup.NewClient(client.WithAPIKey("sup_sk_MvxmLOl0..."))

result, err := client.${resource}.${method}(context.Background()${paramsSection}${body ? `, ${body}` : ""})`;

  return go;
};
