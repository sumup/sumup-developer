import spec from "../../openapi.json";
import { getSdkCodeSamples } from "./api/codeSamples";
import type { ApiCodeSampleView } from "@cloudflare/nimbus-docs/api";

const javascriptFirst = (samples: ApiCodeSampleView[]) =>
  samples.sort(
    (a, b) => Number(b.id === "typescript") - Number(a.id === "typescript"),
  );

const hosted = getSdkCodeSamples("CreateCheckout", "HostedCheckout");

// The CLI catalog currently publishes only the standard checkout variant.
// Build its hosted command from the authoritative example until it is synced.
if (!hosted.some(({ id }) => id === "cli")) {
  const example =
    spec.paths["/v0.1/checkouts"].post.requestBody.content["application/json"]
      .examples.HostedCheckout.value;
  const cli = getSdkCodeSamples("CreateCheckout").find(
    ({ id }) => id === "cli",
  )!;
  const quote = (value: string) => `'${value.replaceAll("'", "'\\''")}'`;
  hosted.push({
    ...cli,
    source: `sumup --json checkouts create \\
  --merchant-code ${quote(example.merchant_code)} \\
  --reference ${quote(example.checkout_reference)} \\
  --amount ${example.amount} \\
  --currency ${quote(example.currency)} \\
  --hosted-checkout`,
  });
}

// Trim optional request fields from the SDK-owned examples, keeping their calls
// and typed models. Rust structs still require None for omitted optional fields.
function minimalSample(
  sample: ApiCodeSampleView,
  optional: string[],
): ApiCodeSampleView {
  const fields = optional.map((field) => field.replaceAll("_", "_?")).join("|");
  let source = sample.source;
  if (sample.id === "cli") {
    const flags = optional
      .map((field) =>
        field === "tip_rates" ? "tip-rate" : field.replaceAll("_", "-"),
      )
      .join("|");
    source = source
      .replace(new RegExp(`^.*--(?:${flags})(?:-|\\s).*\\n`, "gm"), "")
      .replace(/ \\\n$/, "\n");
  } else if (sample.lang === "java") {
    source = source
      .replace(
        new RegExp(
          `^[ \\t]*\\.(?:${fields})\\([^\\n]*\\.builder\\(\\)\\n[\\s\\S]*?^[ \\t]*\\.build\\(\\)\\)\\n`,
          "gim",
        ),
        "",
      )
      .replace(new RegExp(`^[ \\t]*\\.(?:${fields})\\([^\\n]*\\n`, "gim"), "");
  } else {
    const field = `^([ \\t]*)["']?(${fields})["']?[ \\t]*(?::|=>|=)`;
    const replacement = sample.lang === "rust" ? "$1$2: None,\n" : "";
    source = source
      .replace(
        new RegExp(
          `${field}[^\\n]*(?:[({\\[]|new [\\w.]+(?:\\[\\])?)[ \\t]*\\n[\\s\\S]*?^\\1[}\\])][^\\n]*\\n`,
          "gim",
        ),
        replacement,
      )
      .replace(new RegExp(`${field}[^\\n]*\\n`, "gim"), replacement);
  }
  source = source
    .replace(/^\s*"github.com\/sumup\/sumup-go\/nullable"\n/gm, "")
    .replace(/^using System.Collections.Generic;\n/gm, "");
  return { ...sample, source };
}

function optionalFields(
  schema: { properties: Record<string, unknown>; required: string[] },
  keep: string[] = [],
): string[] {
  return Object.keys(schema.properties).filter(
    (field) => !schema.required.includes(field) && !keep.includes(field),
  );
}

export const hostedCheckoutSamples = javascriptFirst(
  hosted.map((sample) =>
    minimalSample(
      sample,
      optionalFields(spec.components.schemas.CheckoutCreateRequest, [
        "hosted_checkout",
      ]),
    ),
  ),
);
export const readerCheckoutSamples = javascriptFirst(
  getSdkCodeSamples("CreateReaderCheckout").map((sample) =>
    minimalSample(
      sample,
      optionalFields(spec.components.schemas.CreateReaderCheckoutRequest),
    ),
  ),
);
