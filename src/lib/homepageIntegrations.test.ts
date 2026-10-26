import { runInNewContext } from "node:vm";
import { JSDOM } from "jsdom";
import { expect, it, vi } from "vitest";
import { homepageIntegrations } from "./homepageIntegrations";
import { apiReference } from "./api/reference";
import { getSdkCodeSamples } from "./api/codeSamples";
import spec from "../../openapi.json";

it.each([
  [
    "hosted-checkout",
    spec.components.schemas.CheckoutCreateRequest,
    ["hosted_checkout"],
  ],
  ["cloud-api", spec.components.schemas.CreateReaderCheckoutRequest, []],
] as const)(
  "keeps only the fields required for %s across every SDK",
  (id, schema, keep) => {
    const { samples } = homepageIntegrations.find((item) => item.id === id)!;
    const required = [...schema.required, ...keep];
    const normalize = (value: string) =>
      value.replace(/[^a-z0-9]/gi, "").toLowerCase();
    for (const sample of samples) {
      // Rust's SDK structs require explicit None values; these are not sent.
      const source = normalize(sample.source.replace(/^\s*\w+: None,\n/gm, ""));
      for (const field of Object.keys(schema.properties)) {
        const alias =
          sample.id === "cli"
            ? { checkout_reference: "reference", total_amount: "amount" }[field]
            : undefined;
        if (required.includes(field)) {
          expect(source, `${sample.label}: required ${field}`).toContain(
            normalize(alias ?? field),
          );
        } else {
          expect(source, `${sample.label}: optional ${field}`).not.toContain(
            normalize(field),
          );
        }
      }
      expect(sample.source, sample.label).not.toMatch(/\\\n$/);
      expect(sample.source).not.toContain("serde_json::from_value");
    }
    const rust = samples.find(({ lang }) => lang === "rust")!.source;
    expect(rust).toContain(
      id === "cloud-api"
        ? "readers::CreateCheckoutRequest"
        : "checkouts::CreateRequest",
    );
  },
);

it("keeps the full SDK catalog examples intact for the API reference", () => {
  expect(
    getSdkCodeSamples("CreateReaderCheckout").find(
      ({ lang }) => lang === "rust",
    )!.source,
  ).toContain("aade: Some(");
  expect(
    getSdkCodeSamples("CreateCheckout", "HostedCheckout").find(
      ({ lang }) => lang === "rust",
    )!.source,
  ).toContain('description: Some("A sample checkout"');
});

it("keeps the CLI hosted fallback aligned with the authoritative checkout example", () => {
  const hosted = homepageIntegrations.find(
    ({ id }) => id === "hosted-checkout",
  )!;
  const source = hosted.samples.find(({ id }) => id === "cli")!.source;
  const example =
    spec.paths["/v0.1/checkouts"].post.requestBody.content["application/json"]
      .examples.HostedCheckout.value;
  expect(source).toContain("--hosted-checkout");
  expect(source).toContain(`--amount ${example.amount}`);
  expect(source).toContain(example.checkout_reference);
  expect(source).toContain(example.merchant_code);
  expect(source).not.toContain("--valid-until");
});

it("mounts the Payment Widget into the displayed element using a server-created checkout", () => {
  const integration = homepageIntegrations.find(
    ({ id }) => id === "payment-widget",
  )!;
  const dom = new JSDOM(integration.samples[0].source);
  try {
    const mount = vi.fn();
    const source = [...dom.window.document.querySelectorAll("script")].find(
      (script) => !script.src,
    )!.textContent!;
    runInNewContext(source, {
      SumUpCard: { mount },
      console: { log: vi.fn() },
    });
    const [options] = mount.mock.calls[0];
    expect(dom.window.document.getElementById(options.id)).not.toBeNull();
    expect(options).toEqual({
      id: "sumup-card",
      checkoutId: "CHECKOUT_ID_FROM_YOUR_SERVER",
    });
    expect(
      dom.window.document.querySelector("script[src]")!.getAttribute("src"),
    ).toBe("https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js");
  } finally {
    dom.window.close();
  }
});

it("omits optional mobile payment metadata", () => {
  const { samples } = homepageIntegrations.find(
    ({ id }) => id === "mobile-sdk",
  )!;
  for (const { source } of samples) {
    expect(source).not.toMatch(/foreignTransactionI[Dd]|UUID|"Order"/);
  }
  expect(samples.find(({ lang }) => lang === "swift")!.source).toContain(
    "title: nil",
  );
});

it("offers every API SDK and CLI language for backend integrations without cURL", () => {
  const samples = Reflect.get(
    apiReference.spec.paths["/v0.1/checkouts"].post,
    "x-codeSamples",
  ) as { label: string }[];
  const expected = samples.map(({ label }) => label).sort();
  for (const id of ["hosted-checkout", "cloud-api"]) {
    const samples = homepageIntegrations.find(
      (item) => item.id === id,
    )!.samples;
    expect(samples.map(({ label }) => label).sort()).toEqual(expected);
    expect(samples.some(({ source }) => /\bcurl\b/i.test(source))).toBe(false);
    expect(samples.find(({ label }) => label === "CLI")!.source).toMatch(
      /^sumup\s/,
    );
  }
});
