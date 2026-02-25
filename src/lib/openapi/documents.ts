import type { Document } from "src/types/openapi";
import Openapi from "../../../openapi.json";

/**
 * Parsed OpenAPI document bundled at build time.
 * This is the canonical source used by preprocessors and renderers.
 */
export const doc = Openapi as unknown as Document;
