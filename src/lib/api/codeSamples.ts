import type { ApiCodeSampleView } from "@cloudflare/nimbus-docs/api";
import cli from "../../codesamples/cli.json";
import dotnet from "../../codesamples/dotnet.json";
import go from "../../codesamples/go.json";
import java from "../../codesamples/java.json";
import php from "../../codesamples/php.json";
import python from "../../codesamples/python.json";
import rust from "../../codesamples/rust.json";
import typescript from "../../codesamples/typescript.json";

type Catalog = {
  language: string;
  samples: { operationId: string; example?: string; sample: string }[];
};
const catalogs: readonly [string, Catalog][] = [
  ["CLI", cli],
  ["JavaScript", typescript],
  [".NET", dotnet],
  ["Java", java],
  ["Python", python],
  ["PHP", php],
  ["Go", go],
  ["Rust", rust],
];

/** Select SDK-owned examples; named variants may not exist in every catalog. */
export function getSdkCodeSamples(
  operationId: string,
  example?: string,
): ApiCodeSampleView[] {
  return catalogs.flatMap(([label, catalog]) => {
    const sample = catalog.samples.find(
      (sample) =>
        sample.operationId === operationId &&
        (!example || sample.example === example),
    );
    if (!sample) {
      if (example) return [];
      throw new Error(`Missing ${label} sample for ${operationId}`);
    }
    return [
      {
        id: label === "CLI" ? "cli" : catalog.language,
        lang: catalog.language,
        label,
        source: sample.sample,
      },
    ];
  });
}
