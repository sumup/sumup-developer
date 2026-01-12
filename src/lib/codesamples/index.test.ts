import { describe, expect, it } from "vitest";
import type { OpenAPIV3_1 } from "openapi-types";
import type { OperationObject } from "../../types/openapi";
import {
  curl,
  dotnet,
  go,
  java,
  node as nodeSample,
  python,
  rust,
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

const updateCustomerBodySchema: OpenAPIV3_1.SchemaObject = {
  type: "object",
  required: ["email"],
  properties: {
    email: {
      type: "string",
      example: "ada@example.com",
    },
  },
};

const updateCustomerOperation: OperationObject = {
  operationId: "UpdateCustomer",
  tag: "Customers",
  slug: "customers-update",
  tagSlug: "customers",
  summary: "Update customer",
  description: "Updates a customer profile.",
  method: "PUT",
  path: "/v0.1/customers/{customer_id}",
  "x-codegen": {
    method_name: "update",
  },
  parameters: [
    {
      name: "customer_id",
      in: "path",
      required: true,
      schema: {
        type: "string",
        example: "cust_123",
      },
    },
    {
      name: "fields",
      in: "query",
      required: false,
      schema: {
        type: "string",
        example: "personal_details",
      },
    },
  ],
  requestBody: {
    content: {
      "application/json": {
        schema: updateCustomerBodySchema,
        example: {
          email: "ada@example.com",
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Updated",
    },
  },
};

describe("code sample generators", () => {
  it("node sample matches the TypeScript SDK usage", () => {
    expect(nodeSample(checkoutOperation)).toBe(
      `import SumUp from '@sumup/sdk';

const client = new SumUp();

const result = await client.checkouts.create("MC123", {
  amount: 1000,
  currency: "EUR",
  description: "Online order #42",
});`,
    );
  });

  it("python sample uses the Sumup SDK client", () => {
    expect(python(checkoutOperation)).toBe(
      `from sumup import Sumup

client = Sumup()

result = client.checkouts.create("MC123", CreateCheckoutBody(
  amount=1000,
  currency="EUR",
  description="Online order #42",
))`,
    );
  });

  it("dotnet sample uses the SumUp .NET client", () => {
    expect(dotnet(checkoutOperation)).toBe(
      `using SumUp;

var client = new SumUpClient();

var result = await client.Checkouts.CreateAsync(
    "MC123",
    new CreateCheckoutBody
    {
        Amount = 1000,
        Currency = "EUR",
        Description = "Online order #42",
    }
);`,
    );
  });

  it("go sample renders struct initialisers", () => {
    expect(go(checkoutOperation)).toBe(
      `client := sumup.NewClient()

result, err := client.Checkouts.Create(context.Background(), "MC123", checkouts.CreateCheckoutBody{
  Amount: 1000,
  Currency: "EUR",
  Description: "Online order #42",
})`,
    );
  });

  it("java sample uses the SumUp client", () => {
    expect(java(checkoutOperation)).toBe(
      `import com.sumup.sdk.SumUpClient;

SumUpClient client = SumUpClient.builder().build();

var result = client.checkouts().createCheckout(
  "MC123",
  CreateCheckoutBody.builder()
    .amount(1000f)
    .currency("EUR")
    .description("Online order #42")
    .build()
);`,
    );
  });

  it("rust sample includes params and body examples", () => {
    expect(rust(updateCustomerOperation)).toBe(
      `use sumup::Client;

let client = Client::default();

let result = client.customers().update("cust_123", sumup::UpdateCustomerParams{
    fields: Some("personal_details".to_string()),
}, sumup::UpdateCustomerBody{
  email: "ada@example.com".to_string(),
}).await;`,
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
