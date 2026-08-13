import dotnetCatalog from "../../codesamples/dotnet.json";
import goCatalog from "../../codesamples/go.json";
import javaCatalog from "../../codesamples/java.json";
import pythonCatalog from "../../codesamples/python.json";
import type { OperationObject } from "../../types/openapi";

export type VendoredCodeSampleLanguage = "dotnet" | "go" | "java" | "python";

type VendoredCodeSample = {
  operationId: string;
  example?: string;
  httpMethod: string;
  path: string;
  sample: string;
};

type CodeSampleCatalog = {
  schemaVersion: number;
  samples: VendoredCodeSample[];
};

const catalogs: Record<VendoredCodeSampleLanguage, CodeSampleCatalog> = {
  dotnet: dotnetCatalog,
  go: goCatalog,
  java: javaCatalog,
  python: pythonCatalog,
};

function getFirstRequestExample(operation: OperationObject) {
  if (!operation.requestBody || "$ref" in operation.requestBody) {
    return undefined;
  }

  for (const mediaType of Object.values(operation.requestBody.content)) {
    const example = Object.keys(mediaType.examples ?? {})[0];

    if (example) {
      return example;
    }
  }

  return undefined;
}

export function getVendoredCodeSample(
  language: VendoredCodeSampleLanguage,
  operation: OperationObject,
) {
  const catalog = catalogs[language];

  if (catalog.schemaVersion !== 1 || !operation.operationId) {
    return undefined;
  }

  const samples = catalog.samples.filter(
    (sample) =>
      sample.operationId === operation.operationId &&
      sample.httpMethod.toLowerCase() === operation.method.toLowerCase() &&
      sample.path === operation.path,
  );

  if (samples.length === 0) {
    return undefined;
  }

  const example = getFirstRequestExample(operation);

  return (
    samples.find((sample) => sample.example === example)?.sample ??
    samples[0]?.sample
  );
}
