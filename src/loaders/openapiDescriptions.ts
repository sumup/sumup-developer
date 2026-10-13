import type { Loader, LoaderContext } from "astro/loaders";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { OpenAPIV3, type OpenAPIV3_1 } from "openapi-types";
import { renderMarkdown as renderFragment } from "@cloudflare/nimbus-docs/markdown";
import {
  getMarkdownDescriptionId,
  getOperationDescriptionId,
  getTagDescriptionId,
} from "@lib/openapiContent";

const openapiFileUrl = new URL("../../openapi.json", import.meta.url);
const openapiFilePath = fileURLToPath(openapiFileUrl);

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

export function openapiDescriptionsLoader(): Loader {
  return {
    name: "openapi-descriptions",
    async load(context) {
      await syncDescriptions(context);

      if (!context.watcher) {
        return;
      }

      // Imported JSON is cached by the module graph. Watch and reread the file
      // explicitly so a synchronized OpenAPI document updates the collection
      // without requiring the Astro dev server to be restarted.
      context.watcher.add(openapiFilePath);
      context.watcher.on("change", async (changedPath) => {
        if (changedPath !== openapiFilePath) {
          return;
        }

        try {
          await syncDescriptions(context);
          context.logger.info("Reloaded descriptions from openapi.json");
        } catch (error) {
          context.logger.error(
            `Failed to reload openapi.json: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      });
    },
  };
}

async function syncDescriptions({
  generateDigest,
  parseData,
  renderMarkdown,
  store,
}: LoaderContext) {
  const document = JSON.parse(
    await readFile(openapiFileUrl, "utf8"),
  ) as OpenAPIV3_1.Document;

  // Parse the document before clearing the store, preserving the previous
  // collection if a file watcher observes an incomplete write.
  store.clear();

  // Compile all reference fragments in the content loader, keeping the native
  // Markdown processor out of the Cloudflare request bundle.
  const fragments = new Set<string>();
  const collect = (value: unknown) => {
    if (!value || typeof value !== "object") return;
    for (const [key, child] of Object.entries(value)) {
      if (
        (key === "description" || key === "x-deprecation-notice") &&
        typeof child === "string"
      ) {
        fragments.add(child);
      } else {
        collect(child);
      }
    }
  };
  collect(document);
  for (const body of fragments) {
    const id = getMarkdownDescriptionId(body);
    store.set({
      id,
      data: await parseData({ id, data: { kind: "fragment", name: id } }),
      body,
      digest: generateDigest(body),
      rendered: { html: renderFragment(body) },
    });
  }

  for (const tag of document.tags ?? []) {
    const id = getTagDescriptionId(tag.name);
    const body = tag.description ?? "";
    const data = await parseData({
      id,
      data: { kind: "tag", name: tag.name },
    });

    store.set({
      id,
      data,
      body,
      digest: generateDigest(body),
      rendered: await renderMarkdown(body),
    });
  }

  for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
    if (!pathItem) {
      continue;
    }

    for (const method of methods) {
      const operation = pathItem[method] as
        OpenAPIV3_1.OperationObject | undefined;
      if (!operation?.operationId) {
        continue;
      }

      const id = getOperationDescriptionId(operation.operationId);
      const body = operation.description ?? "";
      const data = await parseData({
        id,
        data: {
          kind: "operation",
          name: operation.operationId,
          method,
          path,
        },
      });

      store.set({
        id,
        data,
        body,
        digest: generateDigest(body),
        // Route OpenAPI descriptions through Astro's configured Satteri
        // processor.
        rendered: await renderMarkdown(body),
      });
    }
  }
}
