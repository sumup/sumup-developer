import slugify from "@sindresorhus/slugify";
import source from "../../../openapi.json";
import cli from "../../codesamples/cli.json";
import dotnet from "../../codesamples/dotnet.json";
import go from "../../codesamples/go.json";
import java from "../../codesamples/java.json";
import php from "../../codesamples/php.json";
import python from "../../codesamples/python.json";
import rust from "../../codesamples/rust.json";
import typescript from "../../codesamples/typescript.json";
import operationPaths from "./operationPaths.json";

const languages = [
  ["CLI", cli],
  ["JavaScript", typescript],
  [".NET", dotnet],
  ["Java", java],
  ["Python", python],
  ["PHP", php],
  ["Go", go],
  ["Rust", rust],
] as const;

type Operation = {
  operationId: string;
  tags: string[];
  description?: string;
  "x-codegen": { method_name: string };
  "x-scopes"?: string[];
  "x-permissions"?: unknown[];
  "x-deprecation-notice"?: string;
  "x-codeSamples"?: { lang: string; label: string; source: string }[];
};

const methods = new Set([
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
]);

// API descriptions use CommonMark rather than the MDX guide pipeline.
export const apiDescription = (source: string) =>
  source.replace(
    /^:::(note|tip|caution|danger|info|warning)(?:\[([^\]\n]*)\])?\r?\n([\s\S]*?)^:::[ \t]*$/gm,
    (_, kind: string, title: string | undefined, body: string) =>
      [
        `> **${title || kind}**`,
        ">",
        ...body
          .trimEnd()
          .split("\n")
          .map((line) => `> ${line}`),
      ].join("\n"),
  );

/** Enrich a copy for Nimbus; synchronized contracts and samples stay untouched. */
export function createApiReference() {
  const spec = structuredClone(source);
  const operations: Record<string, string> = {};
  const legacyLinks: Record<string, string> = {
    introduction: "/api/",
    sdks: "/tools/sdks/",
    "sdks-heading": "/tools/sdks/",
    authentication: "/tools/authorization/",
    "authentication-heading": "/tools/authorization/",
    errors: "/tools/errors/",
    "errors-heading": "/tools/errors/",
  };
  const establishedPaths: Record<string, string> = operationPaths;
  const operationIds = new Set(
    Object.values(spec.paths).flatMap((path) =>
      Object.entries(path).flatMap(([method, value]) =>
        methods.has(method) ? [(value as Operation).operationId] : [],
      ),
    ),
  );
  // Nimbus shares the operation/schema coordinate namespace, even with schema
  // pages disabled. Alias colliding schemas in this private projection only.
  const schemas = spec.components.schemas as Record<string, unknown>;
  const aliases = new Map<string, string>();
  for (const name of Object.keys(schemas)) {
    if (!operationIds.has(name)) continue;
    let alias = `${name}Schema`;
    while (alias in schemas || operationIds.has(alias)) alias += "Schema";
    schemas[alias] = schemas[name];
    delete schemas[name];
    aliases.set(
      `#/components/schemas/${name}`,
      `#/components/schemas/${alias}`,
    );
  }
  const rewriteReferences = (value: unknown): unknown => {
    if (typeof value === "string") return aliases.get(value) ?? value;
    if (Array.isArray(value)) return value.map(rewriteReferences);
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([key, child]) => [
          key,
          key === "description" && typeof child === "string"
            ? apiDescription(child)
            : rewriteReferences(child),
        ]),
      );
    }
    return value;
  };

  for (const path of Object.values(spec.paths)) {
    for (const [method, value] of Object.entries(path)) {
      if (!methods.has(method)) continue;
      const operation = value as Operation;
      operations[operation.operationId] =
        establishedPaths[operation.operationId] ??
        `${slugify(operation.tags[0])}/${slugify(operation["x-codegen"].method_name)}`;
      const legacyAnchor = operations[operation.operationId].replace("/", "-");
      legacyLinks[legacyAnchor] = `/api/${operations[operation.operationId]}/`;
      legacyLinks[`${legacyAnchor}-heading`] = legacyLinks[legacyAnchor];
      operation["x-codeSamples"] = languages.map(([label, samples]) => {
        // Match the current reference's first vendored variant per language.
        const sample = samples.samples.find(
          (sample) => sample.operationId === operation.operationId,
        );
        if (!sample)
          throw new Error(
            `Missing ${label} sample for ${operation.operationId}`,
          );
        return { lang: samples.language, label, source: sample.sample };
      });

      // Nimbus's agent Markdown does not render vendor extensions. Include
      // access requirements in the derived description so agents see them too.
      const notes = [operation.description ?? ""];
      if ("x-beta" in operation && operation["x-beta"]) notes.push("**Beta.**");
      if (operation["x-deprecation-notice"]) {
        notes.push(
          `**Deprecation notice:** ${operation["x-deprecation-notice"]}`,
        );
      }
      if (operation["x-scopes"]?.length) {
        notes.push(
          `**OAuth scopes:** Requires one of: ${operation["x-scopes"].map((scope) => `\`${scope}\``).join(", ")}.`,
        );
      }
      if (operation["x-permissions"]?.length) {
        notes.push(
          `**Required permissions:**\n\n${operation["x-permissions"].map((permission) => `- \`${typeof permission === "string" ? permission : JSON.stringify(permission)}\``).join("\n")}`,
        );
      }
      operation.description = notes.join("\n\n");
    }
  }
  for (const tag of spec.tags) {
    const tagSlug = slugify(tag.name);
    legacyLinks[tagSlug] = `/api/tags/${tagSlug}/`;
    const notes = [tag.description];
    if ("x-beta" in tag && tag["x-beta"]) notes.push("**Beta.**");
    if ("x-core-objects" in tag) {
      const objects = tag["x-core-objects"] as { $ref: string }[];
      notes.push(
        `**Objects:**\n\n${objects
          .map((object) => {
            const name = (aliases.get(object.$ref) ?? object.$ref)
              .split("/")
              .pop()!;
            const originalName = object.$ref.split("/").pop()!;
            legacyLinks[`${tagSlug}-object-${slugify(originalName)}`] =
              `/api/schemas/${name}/`;
            return `- [${name}](/api/schemas/${name}/)`;
          })
          .join("\n")}`,
      );
    }
    tag.description = notes.filter(Boolean).join("\n\n");
  }
  spec.info.description = `${spec.info.description.replaceAll("https://developer.sumup.com/api/authentication", "/tools/authorization/")}\n\n**Getting started:** [Authorization](/tools/authorization/), [SDKs](/tools/sdks/), [CLI](/tools/cli/), and [API errors](/tools/errors/).\n\n[Download the OpenAPI specification](/openapi.json).`;
  return {
    spec: rewriteReferences(spec) as typeof spec,
    operations,
    legacyLinks,
  };
}

// Share the projection across API pages instead of rebuilding it for each one.
export const apiReference = createApiReference();
