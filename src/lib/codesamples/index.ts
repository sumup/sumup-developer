import cliSamples from "../../codesamples/cli.json";
import dotnetSamples from "../../codesamples/dotnet.json";
import goSamples from "../../codesamples/go.json";
import javaSamples from "../../codesamples/java.json";
import pythonSamples from "../../codesamples/python.json";
import rustSamples from "../../codesamples/rust.json";
import typescriptSamples from "../../codesamples/typescript.json";
import type { OperationObject } from "../../types/openapi";
import { curl } from "./curl";
import { php } from "./php";

type CodeSamples = {
  language: string;
  samples: {
    operationId: string;
    sample: string;
  }[];
};

const samplesByOperationId = (codeSamples: CodeSamples) => {
  const samples = new Map<string, string>();

  // The API page shows one sample per language, so use the first example when
  // an operation has multiple vendored variants.
  for (const sample of codeSamples.samples) {
    if (!samples.has(sample.operationId)) {
      samples.set(sample.operationId, sample.sample);
    }
  }

  return samples;
};

const findVendoredSample = (codeSamples: CodeSamples) => {
  const samples = samplesByOperationId(codeSamples);

  return (operation: OperationObject): string | undefined => {
    return operation.operationId
      ? samples.get(operation.operationId)
      : undefined;
  };
};

const fromVendoredSamples = (codeSamples: CodeSamples) => {
  const findSample = findVendoredSample(codeSamples);

  return (operation: OperationObject): string => {
    const sample = findSample(operation);

    if (!sample) {
      throw new Error(
        `Missing ${codeSamples.language} code sample for ${operation.operationId ?? "operation without an ID"}`,
      );
    }

    return sample;
  };
};

const cli = fromVendoredSamples(cliSamples);
const dotnet = fromVendoredSamples(dotnetSamples);
const go = fromVendoredSamples(goSamples);
const java = fromVendoredSamples(javaSamples);
const python = fromVendoredSamples(pythonSamples);
const rust = fromVendoredSamples(rustSamples);
const typescript = fromVendoredSamples(typescriptSamples);

export { cli, curl, dotnet, go, java, php, python, rust, typescript };
