export const checkoutLifecycle = [
  {
    id: "request",
    actor: "Your application → Cloud API",
    title: "Create a checkout",
    description: "Send the amount, reader ID, and HTTPS return_url.",
  },
  {
    id: "accepted",
    actor: "Cloud API → Your application",
    title: "Checkout accepted",
    description:
      "Store client_transaction_id. Acceptance does not confirm payment: keep the order unpaid.",
  },
  {
    id: "customer",
    actor: "Solo reader → Customer",
    title: "Customer completes payment",
    description:
      "The reader asks the customer to present a card and complete any requested steps.",
  },
  {
    id: "webhook",
    actor: "Cloud API → Your application",
    title: "Receive the final result",
    description:
      "Match the solo.transaction.updated webhook's client_transaction_id to the checkout.",
  },
  {
    id: "order",
    actor: "Your application",
    title: "Update the order",
    description:
      "For successful, mark the matching order paid. For failed, keep it unpaid and let the customer retry or choose another payment method.",
  },
];

export const checkoutOutcomes = {
  successful: "Mark the matching order paid.",
  failed: "Keep the order unpaid. Offer a retry or another payment method.",
};
