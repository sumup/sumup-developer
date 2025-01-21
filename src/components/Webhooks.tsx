import {
  Badge,
  Body,
  Button,
  NotificationInline,
  Table,
} from "@sumup-oss/circuit-ui";

import { useWebhooks } from "@hooks/useWebhooks";

import type { Webhook } from "../types/webhooks";

import Loading from "./Loading";

function formatDate(date: string | number | Date) {
  if (Number.isNaN(new Date(date).getTime())) {
    return "Invalid date";
  }

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  } as const;

  const locale = navigator.language;
  const dateObj = new Date(date);

  return dateObj.toLocaleDateString(locale, options);
}

export const Webhooks = () => {
  const { webhooks, isLoading, error } = useWebhooks();

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <NotificationInline body={error} variant="danger" />;
  }

  if (webhooks.length === 0) {
    return <EmptyState />;
  }

  return <WebhooksTable webhooks={webhooks} />;
};

const EmptyState = () => (
  <Body size="l">No webhooks found. Create a new webhook to get started.</Body>
);

const headers = ["Status", "Name", "URL", "Created", ""];

const WebhooksTable = ({ webhooks }: { webhooks: Webhook[] }) => {
  const webhookRows = webhooks.map((webhook) => [
    {
      children: (
        <Badge variant={webhook.active ? "success" : "neutral"}>
          {webhook.active ? "Active" : "Inactive"}
        </Badge>
      ),
      scope: "col",
    },
    { children: webhook.name },
    { children: <Body>{truncateUrl(webhook.url)}</Body> },
    { children: formatDate(webhook.createdAt) },
    {
      children: (
        <Button href={`/webhooks/${webhook.id}`} variant="tertiary">
          View
        </Button>
      ),
    },
  ]);

  return <Table headers={headers} rows={webhookRows} />;
};

function truncateUrl(url: string) {
  if (url.length > 20) {
    return `${url.slice(0, 10)}...${url.slice(-10)}`;
  }

  return url;
}
