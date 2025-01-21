import type { ApiKey, RawApiKey } from "../types/apikeys";

import http from "./http-client";

const mapApikey = ({
  id,
  name,
  preview,
  type,
  created_at,
  updated_at,
  plaintext,
  scopes,
}: RawApiKey): ApiKey => {
  return {
    id,
    name,
    preview,
    type,
    createdAt: new Date(created_at),
    updatedAt: new Date(updated_at),
    plaintext,
    scopes,
  };
};

export const getApiKeys = async (merchantCode: string): Promise<ApiKey[]> => {
  const { items } = await http
    .get(`/proxy/api-gateway/v0.1/merchants/${merchantCode}/api-keys`)
    .json<{ items: RawApiKey[] }>();
  return items.map(mapApikey);
};

export interface ApiKeyRequestData {
  name: string;
  scopes: string[];
}

export const createApiKey = async (
  merchantCode: string,
  params: ApiKeyRequestData,
): Promise<ApiKey> => {
  const key = await http
    .post(`/proxy/api-gateway/v0.1/merchants/${merchantCode}/api-keys`, {
      json: params,
    })
    .json<RawApiKey>();
  return mapApikey(key);
};

export const deleteApiKey = async (
  merchantCode: string,
  keyId: string,
): Promise<void> => {
  await http.delete(
    `/proxy/api-gateway/v0.1/merchants/${merchantCode}/api-keys/${keyId}`,
  );
};
