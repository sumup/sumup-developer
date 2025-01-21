import { HTTPError, TimeoutError } from "ky";
import http from "./http-client";

export type WalletType = "GOOGLE_PAY" | "APPLE_PAY";

type WalletDomain = {
  id: string;
  domain: string;
  walletType: WalletType;
  createTimestamp: number;
};

type ApplePayCertificateInfo = {
  appleMerchantId: string;
  expireTimestamp: number;
  createTimestamp: number;
  status: "ACTIVE" | "INACTIVE";
};

type WalletDomainsResponse = { items: WalletDomain[] };
type ApplePayCertificatesResponse = { items: ApplePayCertificateInfo[] };

const handleKyErrors = (error: unknown): never => {
  if (error instanceof HTTPError) {
    throw new Error(`Something went wrong (${error.response.status})`);
  }
  if (error instanceof TimeoutError) {
    throw new Error("The request timed out, try again later.");
  }
  throw new Error("Something went wrong.");
};

export const getWalletRegisteredDomains = async ({
  merchantCode,
}: {
  merchantCode: string;
}): Promise<WalletDomainsResponse> => {
  try {
    return await http
      .get(`/proxy/apple-keys/v1/merchants/${merchantCode}/domains`)
      .json();
  } catch (error) {
    return handleKyErrors(error);
  }
};

export const removeWalletRegisteredDomain = async ({
  merchantCode,
  domainId,
}: {
  merchantCode: string;
  domainId: string;
}): Promise<void> => {
  try {
    await http.put(
      `/proxy/apple-keys/v1/merchants/${merchantCode}/domains/${domainId}/deactivate`,
    );
  } catch (error) {
    return handleKyErrors(error);
  }
};

export const registerWalletDomain = async ({
  merchantCode,
  domain,
  walletType,
}: {
  merchantCode: string;
  domain: string;
  walletType: WalletType;
}): Promise<void> => {
  try {
    await http.post(`/proxy/apple-keys/v1/merchants/${merchantCode}/domains`, {
      json: { domain, walletType },
    });
  } catch (error) {
    if (
      walletType === "APPLE_PAY" &&
      error instanceof HTTPError &&
      error.response.status === 404
    ) {
      throw new Error(
        "Apple certificate was not found. Please try hosting it again.",
      );
    }
    return handleKyErrors(error);
  }
};

export const getAppleVerificationContent = async (): Promise<{
  content: string;
}> => {
  try {
    return await http.get("/proxy/apple-keys/v1/domains/verification").json();
  } catch (error) {
    return handleKyErrors(error);
  }
};

export const generateCsr = async (
  merchantCode: string,
): Promise<{ csr: string }> => {
  try {
    return await http
      .post(`/proxy/apple-keys/v1/merchants/${merchantCode}/keys/csr`)
      .json();
  } catch (error) {
    return handleKyErrors(error);
  }
};

export const getApplePayCertificates = async ({
  merchantCode,
}: {
  merchantCode: string;
}): Promise<ApplePayCertificatesResponse> => {
  try {
    return await http
      .get(`/proxy/apple-keys/v1/merchants/${merchantCode}/certificates`)
      .json();
  } catch (error) {
    return handleKyErrors(error);
  }
};

export const saveCertificate = async (
  merchantCode: string,
  file: string,
): Promise<{ message: string }> => {
  try {
    const body = JSON.stringify(file);
    return await http
      .post(`/proxy/apple-keys/v1/merchants/${merchantCode}/certificates`, {
        body,
      })
      .json();
  } catch (error) {
    return handleKyErrors(error);
  }
};

export const deactivateApplePayCertificate = async ({
  merchantCode,
  appleMerchantId,
}: {
  merchantCode: string;
  appleMerchantId: string;
}): Promise<void> => {
  try {
    await http.put(
      `/proxy/apple-keys/v1/merchants/${merchantCode}/certificates/${appleMerchantId}/deactivate`,
    );
  } catch (error) {
    return handleKyErrors(error);
  }
};
