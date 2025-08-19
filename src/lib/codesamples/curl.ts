// Adapted from https://github.com/albertodeago/curl-generator
import type { OperationObject } from "src/types/openapi";
import { bodyExample } from "./util";

export function jsonBody(
  body: Record<string | number | symbol, unknown>,
): string {
  return `--json '${JSON.stringify(body, undefined, 2)
    .replace(/([\\'])/g, "\\$1")
    .split("\n")
    .map((s) => "  " + s)
    .join("\n")
    .trimStart()}'`;
}

type StringMap = { [key: string]: string };

const slash = " \\";
const newLine = "\n";

const getCurlMethod = function (method?: string): string {
  let result: string = "";
  if (method) {
    const types: StringMap = {
      GET: "-X GET",
      POST: "-X POST",
      PUT: "-X PUT",
      PATCH: "-X PATCH",
      DELETE: "-X DELETE",
    };
    result = ` ${types[method.toUpperCase()]}`;
  }
  return slash + newLine + result;
};

const getCurlHeaders = function (headers?: StringMap): string {
  let result = "";
  if (headers) {
    Object.keys(headers).map((val) => {
      if (val === "Authorization") {
        // regular quotes for Authorization header to allow using api key as env variable
        result += `${slash}${newLine} -H "${val}: ${headers[val]}"`;
      } else {
        result += `${slash}${newLine} -H '${val}: ${headers[val].replace(
          /(\\|')/g,
          "\\$1",
        )}'`;
      }
    });
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCurlBody = function (body?: any): string {
  let result = "";
  if (body) {
    result += `${slash}${newLine} ${jsonBody(body)}`;
  }
  return result;
};

export const curl = (operation: OperationObject): string => {
  const example = bodyExample(operation);

  let curlSnippet = "curl ";
  curlSnippet += `https://api.sumup.com${operation.path}`;
  curlSnippet += getCurlMethod(operation.method);
  curlSnippet += getCurlHeaders({
    Authorization: "Bearer $SUMUP_API_KEY",
  });
  curlSnippet += getCurlBody(example);
  return curlSnippet.trim();
};
