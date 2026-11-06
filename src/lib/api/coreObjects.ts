import {
  buildApiModel,
  getApiPageProps,
  renderApiPageMarkdown,
  type ApiExampleView,
  type ApiSchemaPage,
  type JsonValue,
} from "@cloudflare/nimbus-docs/api";

export type CoreObject = ApiSchemaPage & { example: ApiExampleView };

/** Resolve schemas and generate examples through Nimbus without publishing pages. */
export async function prepareCoreObjects(
  spec: Record<string, JsonValue>,
  targets: Record<string, string>,
): Promise<Record<string, CoreObject>> {
  const names = Object.keys(targets);
  const paths = Object.fromEntries(
    names.map((name, index) => [
      `/core-object-${index}`,
      {
        get: {
          operationId: `CoreObjectExample${index}`,
          responses: {
            "200": {
              description: "Example",
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${name}` },
                },
              },
            },
          },
        },
      },
    ]),
  );
  // This private model supplies schema view models and generated response
  // examples only. The public collection has schemaPages disabled.
  const model = await buildApiModel({
    collection: "api",
    spec: {
      openapi: spec.openapi,
      info: spec.info,
      components: spec.components,
      paths,
    },
    schemaPages: true,
    samples: { generate: [] },
  });
  const targetFor = (href: string) =>
    targets[href.replace(/^\/api\/schemas\//, "").replace(/\/$/, "")];
  const adapt = (value: unknown, key = ""): unknown => {
    if (Array.isArray(value))
      return value
        .map((entry) => adapt(entry, key))
        .filter((entry) => entry !== undefined);
    if (!value || typeof value !== "object") return value;
    const object = value as Record<string, unknown>;
    if (
      typeof object.href === "string" &&
      object.href.startsWith("/api/schemas/")
    ) {
      const target = targetFor(object.href);
      if (!target && ["typeRef", "typeRefs", "link"].includes(key))
        return undefined;
      return Object.fromEntries(
        Object.entries(object).flatMap(([name, entry]) =>
          name === "href"
            ? target
              ? [[name, target]]
              : []
            : [[name, adapt(entry, name)]],
        ),
      );
    }
    return Object.fromEntries(
      Object.entries(object).map(([name, entry]) => [name, adapt(entry, name)]),
    );
  };
  return Object.fromEntries(
    names.map((name, index) => {
      const schema = getApiPageProps(model, name);
      const operation = getApiPageProps(model, `CoreObjectExample${index}`);
      if (schema.kind !== "schema" || operation.kind !== "operation")
        throw new Error(`Missing prepared core object: ${name}`);
      const example = operation.responses[0]?.example;
      if (!example) throw new Error(`Missing JSON example: ${name}`);
      return [
        name,
        {
          ...(adapt(schema) as ApiSchemaPage),
          href: targets[name],
          breadcrumbs: [],
          example,
        },
      ];
    }),
  );
}

export function coreObjectMarkdown(object: CoreObject) {
  // Description headings are escaped by Nimbus's agent serializer. Use the
  // same bold section labels as the rest of the tag description instead.
  const schema = renderApiPageMarkdown(object).replace(
    /^## Fields$/gm,
    "**Fields:**",
  );
  return `**${object.title} object:**\n\n${schema}\n**Example:**\n\n\`\`\`json\n${JSON.stringify(object.example.value, null, 2)}\n\`\`\``;
}
