import type { Merchant } from "src/types/merchant";
import http from "./http-client";

type APIMerchant = {
  merchant_code: string;
  locale: string;
  country: string;
  default_currency: string;
  company_name: string;
  merchant_category_code: string;
  extdev: boolean;
};

export const getMerchant = async (merchantCode: string): Promise<Merchant> => {
  const {
    merchant_code,
    locale,
    country,
    default_currency: defaultCurrency,
    company_name: companyName,
    merchant_category_code: merchantCategoryCode,
    extdev,
  } = await http
    .get(`/proxy/api-gateway/v1.0/merchants/${merchantCode}/merchant-profile`)
    .json<APIMerchant>();
  return {
    merchantCode: merchant_code,
    locale,
    country,
    defaultCurrency,
    companyName,
    merchantCategoryCode,
    extdev,
  };
};
