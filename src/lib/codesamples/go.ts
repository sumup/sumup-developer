import { resolveSchema } from "@lib/openapi";
import { Case } from "change-case-all";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";

const requestBody = (operation: OperationObject): string => {
  let requestBody =
    operation.requestBody?.content?.["application/json"]?.schema;

  if (!requestBody) {
    return "";
  }

  if ("$ref" in requestBody) {
    requestBody = resolveSchema(requestBody);
  }

  if (!requestBody || !requestBody.properties) {
    return "";
  }

  const bodyStructName = `${Case.pascal(operation.operationId!)}Request`;

  const bodyFields = Object.entries(requestBody.properties)
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
