import type { ApiCodeSampleView } from "@cloudflare/nimbus-docs/api";

// Handwritten homepage examples, independent of the full API reference catalogs.
// Checked against TypeScript 0.2.2, .NET 0.0.21, Java 0.1.2, Python 0.3.5,
// PHP 0.1.8, Go 0.21.0, Rust 0.6.0, and CLI 0.7.0.
export const hostedCheckoutSamples: ApiCodeSampleView[] = [
  {
    id: "typescript",
    lang: "typescript",
    label: "JavaScript",
    source: `import SumUp from "@sumup/sdk";

const client = new SumUp({ apiKey: "sup_sk_your_api_key" });
const checkout = await client.checkouts.create({
  checkout_reference: "order-123",
  amount: 12,
  currency: "EUR",
  merchant_code: "MERCHANT_CODE",
  hosted_checkout: { enabled: true },
});

console.log(checkout.hosted_checkout_url);`,
  },
  {
    id: "cli",
    lang: "bash",
    label: "CLI",
    source: `sumup --json checkouts create \\
  --merchant-code MERCHANT_CODE \\
  --reference order-123 \\
  --amount 12 \\
  --currency EUR \\
  --hosted-checkout`,
  },
  {
    id: "csharp",
    lang: "csharp",
    label: ".NET",
    source: `using System;
using SumUp;

using var client = new SumUpClient(new SumUpClientOptions
{
    AccessToken = "sup_sk_your_api_key",
});
var response = await client.Checkouts.CreateAsync(new CheckoutCreateRequest
{
    CheckoutReference = "order-123",
    Amount = 12f,
    Currency = Currency.Eur,
    MerchantCode = "MERCHANT_CODE",
    HostedCheckout = new HostedCheckout { Enabled = true },
});

Console.WriteLine(response.Data?.HostedCheckoutUrl);`,
  },
  {
    id: "java",
    lang: "java",
    label: "Java",
    source: `import com.sumup.sdk.SumUpClient;
import com.sumup.sdk.models.CheckoutCreateRequest;
import com.sumup.sdk.models.Currency;
import com.sumup.sdk.models.HostedCheckout;

public class HostedCheckoutSample {
    public static void main(String[] args) throws Exception {
        var client = new SumUpClient("sup_sk_your_api_key");
        var checkout = client.checkouts().create(
            CheckoutCreateRequest.builder()
                .checkoutReference("order-123")
                .amount(12f)
                .currency(Currency.of("EUR"))
                .merchantCode("MERCHANT_CODE")
                .hostedCheckout(HostedCheckout.builder().enabled(true).build())
                .build()
        );

        System.out.println(checkout.hostedCheckoutUrl());
    }
}`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `from sumup import Sumup

with Sumup(api_key="sup_sk_your_api_key") as client:
    checkout = client.checkouts.create(
        checkout_reference="order-123",
        amount=12,
        currency="EUR",
        merchant_code="MERCHANT_CODE",
        hosted_checkout={"enabled": True},
    )

    print(checkout.hosted_checkout_url)`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `<?php

require __DIR__ . '/vendor/autoload.php';

$client = new \\SumUp\\SumUp('sup_sk_your_api_key');
$checkout = $client->checkouts()->create([
    'checkout_reference' => 'order-123',
    'amount' => 12,
    'currency' => 'EUR',
    'merchant_code' => 'MERCHANT_CODE',
    'hosted_checkout' => ['enabled' => true],
]);

echo $checkout->hostedCheckoutUrl;`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `package main

import (
	"context"
	"fmt"
	"log"

	"github.com/sumup/sumup-go"
)

func main() {
	client := sumup.NewClient()
	checkout, err := client.Checkouts.Create(context.Background(), sumup.CheckoutsCreateParams{
		CheckoutReference: "order-123",
		Amount:            12,
		Currency:          "EUR",
		MerchantCode:      "MERCHANT_CODE",
		HostedCheckout:    &sumup.HostedCheckout{Enabled: true},
	})
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(*checkout.HostedCheckoutURL)
}`,
  },
  {
    id: "rust",
    lang: "rust",
    label: "Rust",
    source: `use sumup::{Authorization, Client};
use sumup::resources::checkouts::{CreateRequest, HostedCheckout};
use sumup::resources::common::Currency;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::default()
        .with_authorization(Authorization::api_key("sup_sk_your_api_key"));
    let body = CreateRequest::builder()
        .checkout_reference("order-123")
        .amount(12.0)
        .currency(Currency::EUR)
        .merchant_code("MERCHANT_CODE")
        .hosted_checkout(HostedCheckout::builder().enabled(true).build())
        .build();
    let checkout = client.checkouts().create(body).await?;

    println!("{}", checkout.hosted_checkout_url.unwrap_or_default());
    Ok(())
}`,
  },
];

export const readerCheckoutSamples: ApiCodeSampleView[] = [
  {
    id: "typescript",
    lang: "typescript",
    label: "JavaScript",
    source: `import SumUp from "@sumup/sdk";

const client = new SumUp({ apiKey: "sup_sk_your_api_key" });
const checkout = await client.readers.createCheckout(
  "MERCHANT_CODE",
  "READER_ID",
  { total_amount: { currency: "EUR", minor_unit: 2, value: 1200 } },
);

console.log(checkout.data.client_transaction_id);`,
  },
  {
    id: "cli",
    lang: "bash",
    label: "CLI",
    source: `sumup --json readers checkout READER_ID \\
  --merchant-code MERCHANT_CODE \\
  --amount 12 \\
  --currency EUR`,
  },
  {
    id: "csharp",
    lang: "csharp",
    label: ".NET",
    source: `using System;
using SumUp;

using var client = new SumUpClient(new SumUpClientOptions
{
    AccessToken = "sup_sk_your_api_key",
});
var response = await client.Readers.CreateCheckoutAsync(
    "MERCHANT_CODE",
    "READER_ID",
    new CreateReaderCheckoutRequest
    {
        TotalAmount = new CreateReaderCheckoutRequestTotalAmount
        {
            Currency = "EUR",
            MinorUnit = 2,
            Value = 1200,
        },
    });

Console.WriteLine(response.Data?.Data.ClientTransactionId);`,
  },
  {
    id: "java",
    lang: "java",
    label: "Java",
    source: `import com.sumup.sdk.SumUpClient;
import com.sumup.sdk.models.CreateReaderCheckoutRequest;
import com.sumup.sdk.models.Money;

public class ReaderCheckoutSample {
    public static void main(String[] args) throws Exception {
        var client = new SumUpClient("sup_sk_your_api_key");
        var checkout = client.readers().createCheckout(
            "MERCHANT_CODE",
            "READER_ID",
            CreateReaderCheckoutRequest.builder()
                .totalAmount(Money.builder()
                    .currency("EUR")
                    .minorUnit(2L)
                    .value(1200L)
                    .build())
                .build()
        );

        System.out.println(checkout.data().clientTransactionId());
    }
}`,
  },
  {
    id: "python",
    lang: "python",
    label: "Python",
    source: `from sumup import Sumup

with Sumup(api_key="sup_sk_your_api_key") as client:
    checkout = client.readers.create_checkout(
        "MERCHANT_CODE",
        "READER_ID",
        total_amount={"currency": "EUR", "minor_unit": 2, "value": 1200},
    )

    print(checkout.data.client_transaction_id)`,
  },
  {
    id: "php",
    lang: "php",
    label: "PHP",
    source: `<?php

require __DIR__ . '/vendor/autoload.php';

$client = new \\SumUp\\SumUp('sup_sk_your_api_key');
$checkout = $client->readers()->createCheckout('MERCHANT_CODE', 'READER_ID', [
    'total_amount' => [
        'currency' => 'EUR',
        'minor_unit' => 2,
        'value' => 1200,
    ],
]);

echo $checkout->data->clientTransactionId;`,
  },
  {
    id: "go",
    lang: "go",
    label: "Go",
    source: `package main

import (
	"context"
	"fmt"
	"log"

	"github.com/sumup/sumup-go"
)

func main() {
	client := sumup.NewClient()
	checkout, err := client.Readers.CreateCheckout(
		context.Background(), "MERCHANT_CODE", "READER_ID",
		sumup.ReadersCreateCheckoutParams{
			TotalAmount: sumup.CreateCheckoutRequestTotalAmount{
				Currency:  "EUR",
				MinorUnit: 2,
				Value:     1200,
			},
		},
	)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println(checkout.Data.ClientTransactionID)
}`,
  },
  {
    id: "rust",
    lang: "rust",
    label: "Rust",
    source: `use sumup::{Authorization, Client};
use sumup::resources::readers::{CreateCheckoutRequest, CreateCheckoutRequestTotalAmount};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::default()
        .with_authorization(Authorization::api_key("sup_sk_your_api_key"));
    let body = CreateCheckoutRequest::builder()
        .total_amount(CreateCheckoutRequestTotalAmount::builder()
            .currency("EUR")
            .minor_unit(2)
            .value(1200)
            .build())
        .build();
    let checkout = client.readers()
        .create_checkout("MERCHANT_CODE", "READER_ID", body)
        .await?;

    println!("{}", checkout.data.client_transaction_id);
    Ok(())
}`,
  },
];
