declare module "openapi-snippet" {
  import type { Document } from "src/types/openapi";
  export type Target =
    | "c_libcurl"
    | "csharp_restsharp"
    | "csharp_httpclient"
    | "go_native"
    | "java_okhttp"
    | "java_unirest"
    | "javascript_jquery"
    | "javascript_xhr"
    | "node_native"
    | "node_request"
    | "node_unirest"
    | "objc_nsurlsession"
    | "ocaml_cohttp"
    | "php_curl"
    | "php_http1"
    | "php_http2"
    | "python_python3"
    | "python_requests"
    | "ruby_native"
    | "shell_curl"
    | "shell_httpie"
    | "shell_wget"
    | "swift_nsurlsession";
  export function getEndpointSnippets(
    doc: Document,
    path: string,
    method: string,
    targets: string[],
    queryParams?: Record<string, string>,
  ): ResolvedAstroMarkdocConfig;
}
