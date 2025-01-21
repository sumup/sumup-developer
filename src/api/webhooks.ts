import type {
  CreateWebhookPayload,
  RawWebhook,
  UpdateWebhookPayload,
  Webhook,
} from "../types/webhooks";
import http from "./http-client";

const mapWebhook = (data: RawWebhook): Webhook => {
  return {
    id: data.id,
    name: data.name,
    merchantCode: data.merchant_code,
    description: data.description,
    secret: data.secret,
    url: data.url,
    events: data.events,
    active: data.active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

export const getMerchantWebhooks = async ({
  merchantCode,
}: {
  merchantCode: string;
}): Promise<Webhook[]> => {
  const webhooks = await http
    .get(`/proxy/api-gateway/v1/merchants/${merchantCode}/webhooks`)
    .json<RawWebhook[]>();
  return webhooks.map(mapWebhook);
};

export const getMerchantWebhook = async ({
  id,
  merchantCode,
}: {
  id: string;
  merchantCode: string;
}): Promise<Webhook> => {
  const webhook = await http
    .get(`/proxy/api-gateway/v1/merchants/${merchantCode}/webhooks/${id}`)
    .json<RawWebhook>();
  return mapWebhook(webhook);
};

export const getWebhookEvents = async (): Promise<string[]> => {
  return await http
    .get("/proxy/api-gateway/v1/webhooks/events")
    .json<string[]>();
};

export type CreateWebhookInput = {
  merchantCode: string;
  data: CreateWebhookPayload;
};

export const createMerchantWebhook = async (
  input: CreateWebhookInput,
): Promise<Webhook> => {
  const createdWebhook = await http
    .post(`/proxy/api-gateway/v1/merchants/${input.merchantCode}/webhooks`, {
      json: input.data,
    })
    .json<RawWebhook>();

  return mapWebhook(createdWebhook);
};

export type UpdateWebhookInput = {
  merchantCode: string;
  data: UpdateWebhookPayload;
};

export const updateMerchantWebhook = async (
  webhookId: string,
  input: UpdateWebhookInput,
): Promise<Webhook> => {
  const updatedWebhook = await http
    .patch(
      `/proxy/api-gateway/v1/merchants/${input.merchantCode}/webhooks/${webhookId}`,
      { json: input.data },
    )
    .json<RawWebhook>();

  return mapWebhook(updatedWebhook);
};
