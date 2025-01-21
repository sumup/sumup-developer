import { persistentAtom } from "@nanostores/persistent";
import { $authed } from "./user";

import { getExtDevAccount } from "@api/extdev";
import type { Extdev } from "src/types/extdev";
import { createFetcherStore } from "./fetcher";

export const $testMode = persistentAtom<boolean>("test_mode", false, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const $extdev = createFetcherStore<Extdev | null>(
  [$authed, "/v0.1/extdev"],
  {
    fetcher: getExtDevAccount,
  },
);
