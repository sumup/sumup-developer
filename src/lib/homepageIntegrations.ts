import spec from "../../openapi.json";
import {
  hostedCheckoutSamples,
  readerCheckoutSamples,
} from "./homepageBackendSamples";
import type {
  ApiCodeSampleView,
  ApiResponseView,
} from "@cloudflare/nimbus-docs/api";

export interface HomepageIntegration {
  id: string;
  title: string;
  description: string;
  prerequisites: string;
  codeTitle: string;
  responseTitle?: string;
  samples: ApiCodeSampleView[];
  responses: ApiResponseView[];
  result: string;
  guide: { label: string; href: string };
  links?: { label: string; href: string }[];
}

const hosted = spec.paths["/v0.1/checkouts"].post;
const hostedResponse =
  hosted.responses["201"].content["application/json"].examples.HostedCheckout
    .value;
export const homepageIntegrations: HomepageIntegration[] = [
  {
    id: "hosted-checkout",
    title: "Hosted Checkout",
    description: "Send customers to a SumUp-hosted payment page.",
    prerequisites:
      "Install and configure your SDK or the SumUp CLI with sandbox credentials. Replace the sample merchant code and checkout reference with your own.",
    codeTitle: "Create a hosted checkout",
    responseTitle: "Created checkout",
    samples: hostedCheckoutSamples,
    responses: [
      {
        coordinate: "homepage.hosted.response.201",
        anchor: "homepage-hosted-response",
        status: "201",
        fields: [],
        example: {
          mediaType: "application/json",
          value: {
            id: hostedResponse.id,
            hosted_checkout_url: hostedResponse.hosted_checkout_url,
          },
        },
      },
    ],
    result:
      "Redirect the customer to hosted_checkout_url. Verify the final checkout status on your server before fulfilling the order.",
    guide: {
      label: "Learn more about Hosted Checkout",
      href: "/online-payments/checkouts/hosted-checkout/",
    },
  },
  {
    id: "payment-widget",
    title: "Payment Widget",
    description: "Embed SumUp’s payment form in your website.",
    prerequisites:
      "Create a checkout on your server first. Replace CHECKOUT_ID_FROM_YOUR_SERVER with its ID; keep secret API keys on your server.",
    codeTitle: "Mount the Payment Widget",
    samples: [
      {
        id: "html",
        lang: "html",
        label: "HTML",
        source: `<div id="sumup-card"></div>
<script src="https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js"></script>
<script>
  SumUpCard.mount({
    id: "sumup-card",
    checkoutId: "CHECKOUT_ID_FROM_YOUR_SERVER",
  });
</script>`,
      },
    ],
    responses: [],
    result:
      "The widget collects payment details and handles authentication. Verify the final checkout status on your server before fulfilling the order.",
    guide: {
      label: "Learn more about Payment Widget",
      href: "/online-payments/checkouts/card-widget/",
    },
  },
  {
    id: "mobile-sdk",
    title: "Mobile SDK in-person payments",
    description: "Accept in-person payments from your Android or iOS app.",
    prerequisites:
      "Initialize the Reader SDK with an affiliate key linked to your application or bundle ID, log in a sandbox merchant, and connect a supported reader. The Android example uses EUR; iOS uses the merchant’s currency.",
    codeTitle: "Accept a card payment",
    samples: [
      {
        id: "swift",
        lang: "swift",
        label: "iOS (Swift)",
        source: `import SumUpSDK
import UIKit

@MainActor
func takePayment(from controller: UIViewController) async throws {
    guard let currency = SumUpSDK.currentMerchant?.currencyCode else { return }
    let request = CheckoutRequest(
        total: NSDecimalNumber(string: "12.00"),
        title: nil, currencyCode: currency
    )
    let result = try await SumUpSDK.checkout(with: request, from: controller)
    if result.success { print(result.transactionCode ?? "") }
}`,
      },
      {
        id: "kotlin",
        lang: "kotlin",
        label: "Android (Kotlin)",
        source: `import android.app.Activity
import com.sumup.merchant.reader.api.SumUpAPI
import com.sumup.merchant.reader.api.SumUpPayment
import java.math.BigDecimal

fun takePayment(activity: Activity) {
    val payment = SumUpPayment.builder()
        .total(BigDecimal("12.00"))
        .currency(SumUpPayment.Currency.EUR)
        .build()
    SumUpAPI.checkout(activity, payment, 2)
}`,
      },
    ],
    responses: [],
    result:
      "Handle the payment result in your app: check result.success on iOS, or RESULT_CODE in onActivityResult for Android request code 2. Retain transaction identifiers and handle cancellation and errors.",
    guide: {
      label: "Learn more about mobile SDKs",
      href: "/terminal-payments/sdks/",
    },
    links: [
      {
        label: "Learn more about the iOS SDK",
        href: "/terminal-payments/sdks/ios-sdk/",
      },
      {
        label: "Learn more about the Android SDK",
        href: "/terminal-payments/sdks/android-sdk/",
      },
    ],
  },
  {
    id: "cloud-api",
    title: "Server SDK in-person payments",
    description: "Start a payment on a Solo reader from your backend.",
    prerequisites:
      "Use a paired, online Solo reader, a sandbox API key, and your merchant and reader IDs. You can test with Virtual Solo.",
    codeTitle: "Start a reader payment",
    samples: readerCheckoutSamples,
    responses: [],
    result:
      "Store the returned client_transaction_id. Use it to retrieve the transaction and verify its final status before marking the order paid.",
    guide: {
      label: "Learn more about Cloud API",
      href: "/terminal-payments/cloud-api/",
    },
  },
];
