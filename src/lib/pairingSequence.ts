export const pairingActors = [
  { id: "app", title: "Your application", description: "Point of sale" },
  { id: "api", title: "Cloud API", description: "SumUp" },
  { id: "reader", title: "Solo reader", description: "Card terminal" },
] as const;

type Actor = (typeof pairingActors)[number]["id"];

export const pairingSequence = [
  {
    id: "code",
    from: "reader",
    to: "reader",
    title: "Generate pairing code",
    description:
      "On the logged-out Solo reader, open Connections → API → Connect. Copy the pairing code; it expires after five minutes.",
  },
  {
    id: "pair",
    from: "app",
    to: "api",
    title: "Pair reader using the code",
    description:
      "Your application sends the pairing code to the Create Reader endpoint for your merchant account.",
  },
  {
    id: "reader-id",
    from: "api",
    to: "app",
    title: "Return reader ID",
    description:
      "The Cloud API returns the reader ID. Your application uses this ID to address checkout requests to the paired reader.",
  },
  {
    id: "confirmation",
    from: "api",
    to: "reader",
    title: "Display pairing confirmation",
    description:
      "The Solo reader briefly displays the pairing confirmation, then returns to the idle screen.",
  },
  {
    id: "checkout",
    from: "app",
    to: "api",
    title: "Start checkout on reader",
    description:
      "Your application creates a checkout using the paired reader ID and the payment amount.",
  },
  {
    id: "initiate",
    from: "api",
    to: "reader",
    title: "Initiate checkout",
    description:
      "The Cloud API sends the checkout to the Solo reader. Starting a checkout is asynchronous and may take some time.",
  },
  {
    id: "present",
    from: "reader",
    to: "reader",
    title: "Present checkout to customer",
    description:
      "The reader prompts the customer to pay. Follow the checkout lifecycle below to handle the final payment result.",
  },
] satisfies {
  id: string;
  from: Actor;
  to: Actor;
  title: string;
  description: string;
}[];

export function pairingActorLabel(step: (typeof pairingSequence)[number]) {
  const from = pairingActors.find(({ id }) => id === step.from)!.title;
  const to = pairingActors.find(({ id }) => id === step.to)!.title;
  return step.from === step.to ? from : `${from} → ${to}`;
}
