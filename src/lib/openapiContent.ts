export const getOperationDescriptionId = (operationId: string) =>
  `operation:${operationId}`;

export const getTagDescriptionId = (tagName: string) => `tag:${tagName}`;
import { createHash } from "node:crypto";

export const getMarkdownDescriptionId = (source: string) =>
  `fragment:${createHash("sha256").update(source).digest("hex")}`;
