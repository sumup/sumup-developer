import type { OpenAPIV3_1 } from "openapi-types";

type Modify<T, R> = Omit<T, keyof R> & R;

export type TagObject = OpenAPIV3_1.TagObject & {
  slug: string;
  "x-beta"?: boolean;
  "x-core-objects"?: OpenAPIV3_1.ReferenceObject[];
  "x-deprecation-notice"?: string;
};

export type Document = Modify<
  OpenAPIV3_1.Document,
  {
    tags: TagObject[];
  }
>;

export type PermissionRequirements = (
  | string
  | {
      relation: string;
      object_type: string;
      object_id_param: string;
    }
)[];

export type OperationObject = Modify<
  OpenAPIV3_1.OperationObject<{
    "x-beta"?: boolean;
    "x-scopes"?: string[];
    "x-permissions"?: PermissionRequirements;
    "x-codegen"?: {
      method_name: string;
    };
  }>,
  {
    parameters?: OpenAPIV3_1.ParameterObject[];
    requestBody?: OpenAPIV3_1.RequestBodyObject;
    responses?: OpenAPIV3_1.ResponsesObject;
  }
> & {
  path: string;
  method: string;
  slug: string;
  tag: string;
  tagSlug: string;
};

export type Group = {
  objects: OpenAPIV3_1.ComponentsObject[];
  operations: OperationObject[];
};
