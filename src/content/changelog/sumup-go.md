---
title: "Go SDK"
tags: ["SDK", "Go"]
publishedDate: 2023-11-27
---

We are happy to announce the beta release of our [Go](https://go.dev/) SDK. The SDK is maintained under [sumup/sumup-go](https://github.com/sumup/sumup-go) with its acompanying documentation at [pkg.go.dev](https://pkg.go.dev/github.com/sumup/sumup-go#section-readme).

The Go SDK provides easy access to SumUp APIs:

```go
package main

import (
	"context"
	"log"

	"github.com/sumup/sumup-go"
)

func main() {
	ctx := context.Background()
	client := sumup.NewClient()

	checkout, err := client.Checkouts.Create(ctx, sumup.CheckoutsCreateParams{
		Amount:            123,
		CheckoutReference: "TX000001",
		Currency:          sumup.CurrencyEUR,
		MerchantCode:      "MK0001",
	})
	if err != nil {
		log.Printf("[ERROR] create checkout: %v", err)
		return
	}

	log.Printf("[INFO] checkout created: id=%q, amount=%v, currency=%q", *checkout.ID, *checkout.Amount, string(*checkout.Currency))

	checkoutSuccess, err := client.Checkouts.Process(ctx, *checkout.ID, sumup.CheckoutsProcessParams{
		Card: &sumup.Card{
			Cvv:         "123",
			ExpiryMonth: "12",
			ExpiryYear:  "2023",
			Name:        "Boaty McBoatface",
			Number:      "4200000000000042",
		},
		PaymentType: sumup.ProcessCheckoutPaymentTypeCard,
	})
	if err != nil {
		log.Printf("[ERROR] process checkout: %v", err)
		return
	}

	success, _ := checkoutSuccess.AsCheckoutSuccess()
	log.Printf("[INFO] checkout processed: id=%q, transaction_id=%q", *success.ID, string((*success.Transactions)[0].ID))
}
```

See the repository for more [examples](https://github.com/sumup/sumup-go) and don't hesitate to [let us know](/contact) if you have any questions.
