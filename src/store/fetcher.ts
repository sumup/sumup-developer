import http from "@api/http-client";
import { nanoquery } from "@nanostores/query";

export const [createFetcherStore, createMutatorStore] = nanoquery({
  fetcher: (...keys) => http.get(keys.join("")).json(),
});
