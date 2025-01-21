import type { Document } from "src/types/openapi";
import Openapi from "../../../openapi.json";

export const doc = Openapi as unknown as Document;
