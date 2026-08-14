import { describe, expect, it } from "vitest";
import type { OpenAPIV3_1 } from "openapi-types";
import cliSamples from "../../codesamples/cli.json";
import dotnetSamples from "../../codesamples/dotnet.json";
import goSamples from "../../codesamples/go.json";
import javaSamples from "../../codesamples/java.json";
import pythonSamples from "../../codesamples/python.json";
import rustSamples from "../../codesamples/rust.json";
import typescriptSamples from "../../codesamples/typescript.json";
import type { OperationObject } from "../../types/openapi";
import {
  cli,
  curl,
  dotnet,
  go,
  java,
  php,
  python,
  rust,
  typescript,
} from "./index";

const checkoutBodySchema: OpenAPIV3_1.SchemaObject = {
  type: "object",
  required: ["amount", "currency", "description"],
  properties: {
    amount: {
      type: "number",
      example: 1000,
    },
    currency: {
      type: "string",
      example: "EUR",
    },
    description: {
      type: "string",
      example: "Online order #42",
    },
  },
};

const checkoutOperation: OperationObject = {
  operationId: "CreateCheckout",
  tag: "Checkouts",
  slug: "checkouts-create",
  tagSlug: "checkouts",
  summary: "Create checkout",
  description: "Creates a checkout session.",
  method: "POST",
  path: "/v0.1/merchants/{merchant_code}/checkouts",
  "x-codegen": {
    method_name: "create",
  },
  parameters: [
    {
      name: "merchant_code",
      in: "path",
      required: true,
      schema: {
        type: "string",
        example: "MC123",
      },
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: checkoutBodySchema,
        example: {
          amount: 1000,
          currency: "EUR",
          description: "Online order #42",
        },
      },
    },
  },
  responses: {
    "201": {
      description: "Created",
    },
  },
};

describe("code samples", () => {
  it.each([
    ["Python", python, pythonSamples],
    [".NET", dotnet, dotnetSamples],
    ["Go", go, goSamples],
    ["Java", java, javaSamples],
    ["Rust", rust, rustSamples],
    ["TypeScript", typescript, typescriptSamples],
    ["CLI", cli, cliSamples],
  ])("uses the vendored %s sample", (_, codeSample, vendoredSamples) => {
    const expected = vendoredSamples.samples.find(
      ({ operationId }) => operationId === checkoutOperation.operationId,
    );

    expect(codeSample(checkoutOperation)).toBe(expected?.sample);
  });

  it("fails clearly when a vendored sample is missing", () => {
    const operation = {
      ...checkoutOperation,
      operationId: "UnknownOperation",
    };

    expect(() => go(operation)).toThrow(
      "Missing go code sample for UnknownOperation",
    );
    expect(cli(operation)).toBeUndefined();
  });

  it("php sample uses the SumUp PHP SDK", () => {
    expect(php(checkoutOperation)).toBe(
      `$sumup = new \\SumUp\\SumUp();

$result = $sumup->checkouts->create('MC123', [
  'amount' => 1000,
  'currency' => 'EUR',
  'description' => 'Online order #42',
]);`,
    );
  });

  it("curl sample includes headers and body", () => {
    expect(curl(checkoutOperation)).toBe(
      `curl https://api.sumup.com/v0.1/merchants/{merchant_code}/checkouts \\
 -X POST \\
 -H "Authorization: Bearer $SUMUP_API_KEY" \\
 --json '{
    "amount": 1000,
    "currency": "EUR",
    "description": "Online order #42"
  }'`,
    );
  });
});
