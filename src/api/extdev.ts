import { HTTPError } from "ky";
import type { Extdev } from "src/types/extdev";
import http from "./http-client";
import type { APIUser } from "./user";

export const getExtDevAccount = async (): Promise<Extdev | null> => {
  try {
    return await http.get("/proxy/api-gateway/v0.1/extdev").json<Extdev>();
  } catch (error) {
    if (error instanceof HTTPError && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const updateExtDevAccount = async (
  pw: string,
): Promise<{
  user: Extdev;
  password: string;
}> => {
  const {
    user: {
      id,
      email,
      email_verified: emailVerified,
      locale,
      zoneinfo,
      created_at: createdAt,
      updated_at: updatedAt,
      classic,
    },
    password,
  } = await http
    .put("/proxy/api-gateway/v0.1/extdev", { json: { password: pw } })
    .json<{
      user: APIUser;
      password: string;
    }>();

  return {
    user: {
      id,
      email,
      emailVerified,
      locale,
      zoneinfo,
      createdAt: new Date(createdAt as string),
      updatedAt: new Date(updatedAt as string),
      classic,
    },
    password,
  };
};

export const createExtDevAccount = async (
  country: string,
): Promise<{
  user: Extdev;
  password: string;
}> => {
  const {
    user: {
      id,
      email,
      email_verified: emailVerified,
      locale,
      zoneinfo,
      created_at: createdAt,
      updated_at: updatedAt,
      classic,
    },
    password,
  } = await http
    .post("/proxy/api-gateway/v0.1/extdev", { json: { country } })
    .json<{
      user: APIUser;
      password: string;
    }>();

  return {
    user: {
      id,
      email,
      emailVerified,
      locale,
      zoneinfo,
      createdAt: new Date(createdAt as string),
      updatedAt: new Date(updatedAt as string),
      classic,
    },
    password,
  };
};
