/**
 * This HTTP client is supposed to be used for SumUp APIs using our JSON Web
 * Token (JWT) for authentication.
 *
 * The token is set as `Authorization` header on every request.
 *
 * Do not use for third-party APIs.
 */

import ky from "ky";
import { refreshToken } from "./auth";

export default ky.create({
  timeout: 10000,
  retry: {
    statusCodes: [401],
  },
  hooks: {
    beforeRetry: [refreshToken],
  },
});
