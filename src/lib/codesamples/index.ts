import type { OperationObject } from "../../types/openapi";
import { curl } from "./curl";
import { dotnet } from "./dotnet";
import { go } from "./go";
import { java } from "./java";
import { node } from "./node";
import { php } from "./php";
import { python } from "./python";
import { rust } from "./rust";
import {
  getVendoredCodeSample,
  type VendoredCodeSampleLanguage,
} from "./vendored";

export type CodeSampleLanguage =
  "curl" | "dotnet" | "go" | "java" | "node" | "php" | "python" | "rust";

const generators = { curl, dotnet, go, java, node, php, python, rust };
const vendoredLanguages = new Set<CodeSampleLanguage>([
  "dotnet",
  "go",
  "java",
  "python",
]);

export function getCodeSample(
  language: CodeSampleLanguage,
  operation: OperationObject,
) {
  const vendoredSample = vendoredLanguages.has(language)
    ? getVendoredCodeSample(language as VendoredCodeSampleLanguage, operation)
    : undefined;

  return vendoredSample ?? generators[language](operation);
}

export { curl, dotnet, go, java, node, php, python, rust };
