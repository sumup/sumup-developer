import { formatSlug } from "@lib/helpers";
import { OpenAPIV3, type OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "src/types/openapi";
import { doc } from "./documents";
import { resolveBody, resolveParameter } from "./resolvers";

export const isReference = (
  object: OpenAPIV3_1.ResponseObject | OpenAPIV3_1.ReferenceObject | null,
): object is OpenAPIV3_1.ReferenceObject => object !== null && "$ref" in object;

const methods = [
  OpenAPIV3.HttpMethods.GET,
  OpenAPIV3.HttpMethods.POST,
  OpenAPIV3.HttpMethods.PATCH,
  OpenAPIV3.HttpMethods.PUT,
  OpenAPIV3.HttpMethods.DELETE,
  OpenAPIV3.HttpMethods.OPTIONS,
  OpenAPIV3.HttpMethods.HEAD,
  OpenAPIV3.HttpMethods.TRACE,
];

// endpoints is list of Operations with fully resolved parameters and request objects.
export const endpoints: OperationObject[] = Object.entries(
  doc.paths || {},
).flatMap(([path, pathItem]) => {
  if (!pathItem) {
    return [];
  }

  const params: OpenAPIV3_1.ParameterObject[] =
    pathItem.parameters?.map((parameter) => {
      return resolveParameter(parameter);
    }) || [];

  const operations: OperationObject[] = [];
  for (const method of methods) {
    const operationItem = pathItem[method] as OperationObject | undefined;
    if (operationItem) {
      const localParams = params.concat(
        operationItem.parameters?.map((parameter) => {
          return resolveParameter(parameter);
        }) || [],
      );
      operations.push({
        path,
        method,
        slug: formatSlug(
          operationItem["x-codegen"]?.method_name ||
            operationItem.operationId ||
            operationItem.summary ||
            `${method}-${path}`,
        ),
        ...(operationItem as OpenAPIV3_1.OperationObject),
        parameters: localParams,
        requestBody: resolveBody(operationItem.requestBody),
        tag: operationItem.tags?.[0] || "",
        tagSlug: formatSlug(operationItem.tags?.[0]),
      });
    }
  }
  return operations;
});

export const groupped: Record<string, OperationObject[]> = endpoints.reduce(
  (group, operation) => {
    for (const tag of operation.tags || []) {
      const tagSlug = formatSlug(tag);
      group[tagSlug] = group[tagSlug] ?? [];
      group[tagSlug].push(operation);
    }
    return group;
  },
  {} as Record<string, OperationObject[]>,
);

const sorted = Object.fromEntries(
  Object.entries(groupped).map(([tag, operations]) => {
    const methodOrder = (a: OperationObject, b: OperationObject) =>
      methods.indexOf(a.method as OpenAPIV3.HttpMethods) -
      methods.indexOf(b.method as OpenAPIV3.HttpMethods);

    const shortestPathFirst = (a: OperationObject, b: OperationObject) =>
      a.path.length === b.path.length
        ? methodOrder(a, b)
        : a.path.length - b.path.length;

    const deprecatedLast = (a: OperationObject, b: OperationObject) =>
      a.deprecated === b.deprecated
        ? shortestPathFirst(a, b)
        : a.deprecated
          ? 1
          : -1;

    operations.sort(deprecatedLast);
    return [tag, operations];
  }),
);

export const pathsByTag = sorted;
