import type { ClientCredentials, OAuthApp } from "src/types/oauth-apps";

import http from "./http-client";

export const getOAuthApps = async (
  merchantCode: string,
): Promise<OAuthApp[]> => {
  return await http
    .get(`/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-projects`)
    .json<OAuthApp[]>();
};

export interface OAuthAppRequestData {
  product_name: string;
  home_page: string;
  scopes: string[];
  logo_url?: string;
  terms_and_conditions_url?: string;
  privacy_url?: string;
}

export const createOAuthApp = async (
  merchantCode: string,
  json: OAuthAppRequestData,
): Promise<OAuthApp> => {
  return await http
    .post(`/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-projects`, {
      json,
    })
    .json<OAuthApp>();
};

export const updateOAuthApp = async (
  merchantCode: string,
  clientId: string,
  json: OAuthAppRequestData,
): Promise<void> => {
  await http
    .put(
      `/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-projects/${clientId}`,
      { json },
    )
    .json<void>();
};

export const deleteOAuthApp = async (
  merchantCode: string,
  clientId: string,
): Promise<void> => {
  await http
    .delete(
      `/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-projects/${clientId}`,
    )
    .json<void>();
};

export interface ClientCredentialsRequestData {
  application_type: "web" | "android" | "ios" | "other";
  client_name: string;
  redirect_uris: string[];
  cors_uris?: string[];
}

export const createClientCredentials = async (
  merchantCode: string,
  clientId: string,
  json: ClientCredentialsRequestData,
): Promise<ClientCredentials> => {
  return await http
    .post(
      `/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-projects/${clientId}/client-credentials`,
      {
        json,
      },
    )
    .json<ClientCredentials>();
};

export const updateClientCredentials = async (
  merchantCode: string,
  credentialID: string,
  json: ClientCredentialsRequestData,
): Promise<ClientCredentials> => {
  return await http
    .put(
      `/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-credentials/${credentialID}`,
      { json },
    )
    .json<ClientCredentials>();
};

export const deleteClientCredentials = async (
  merchantCode: string,
  credentialID: string,
): Promise<ClientCredentials> => {
  return await http
    .delete(
      `/proxy/api-gateway/v0.1/merchants/${merchantCode}/client-credentials/${credentialID}`,
    )
    .json<ClientCredentials>();
};
