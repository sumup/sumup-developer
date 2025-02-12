import { Case } from "change-case-all";
import type { OperationObject } from "src/types/openapi";

export const go = (operation: OperationObject): string => {
  const resource = Case.pascal(operation.tag);
  const method = Case.pascal(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );
  const go = `client := sumup.NewClient().WithAuth("sup_sk_MvxmLOl0...")

result, err := client.${resource}.${method}()`;

  return go;
};

export const node = (operation: OperationObject): string => {
  const resource = Case.camel(operation.tag);
  const method = Case.camel(
    operation["x-codegen"]?.method_name || operation.operationId!,
  );
  const njs = `import { SumUp } from '@sumup/sdk';

const sumup = new SumUp({ apiKey: 'sup_sk_MvxmLOl0...' });

const res = await sumup.${resource}.${method}();`;

  return njs;
};
