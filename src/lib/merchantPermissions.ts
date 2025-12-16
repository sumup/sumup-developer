import schema from "../../schema.json" assert { type: "json" };

type RelationNode = {
  this?: Record<string, never>;
  computedUserset?: {
    relation: string;
  };
  union?: {
    child: RelationNode[];
  };
  intersection?: {
    child: RelationNode[];
  };
  difference?: {
    base: RelationNode;
    subtract: RelationNode;
  };
  tupleToUserset?: {
    tupleset: {
      relation: string;
    };
    computedUserset: {
      relation: string;
    };
  };
};

type RelationMetadata = {
  directly_related_user_types?: Array<{
    type: string;
    relation?: string;
  }>;
};

type TypeDefinition = {
  type: string;
  relations: Record<string, RelationNode>;
  metadata: {
    relations: Record<string, RelationMetadata>;
  };
};

type Schema = {
  type_definitions: TypeDefinition[];
};

export type AssignablePermission = {
  name: string;
  grants: string[];
  grantsPermissions: string[];
  grantedBy: string[];
};

const schemaData = schema as unknown as Schema;

const merchantType = schemaData.type_definitions.find(
  (definition) => definition.type === "merchant",
);

if (!merchantType) {
  throw new Error("Unable to find merchant type definition in schema.json");
}

const getAssignableRelations = (
  predicate: (entry: { type: string; relation?: string }) => boolean,
) =>
  new Set(
    Object.entries(merchantType.metadata.relations)
      .filter(([, info]) =>
        info.directly_related_user_types?.some((entry) => predicate(entry)),
      )
      .map(([name]) => name),
  );

const userAssignableRelations = getAssignableRelations(
  (entry) => entry.type === "user",
);

const customRoleAssignableRelations = getAssignableRelations(
  (entry) => entry.type === "role" && entry.relation === "assignee",
);

const adjacency = new Map<string, Set<string>>();
const reverseAdjacency = new Map<string, Set<string>>();

const ensureEdge = (from: string, to: string) => {
  if (!adjacency.has(from)) {
    adjacency.set(from, new Set());
  }
  adjacency.get(from)!.add(to);

  if (!reverseAdjacency.has(to)) {
    reverseAdjacency.set(to, new Set());
  }
  reverseAdjacency.get(to)!.add(from);
};

const collectDependencies = (node: RelationNode | undefined): Set<string> => {
  const deps = new Set<string>();

  if (!node) {
    return deps;
  }

  const addFromChild = (child?: RelationNode) => {
    if (!child) {
      return;
    }
    for (const relation of collectDependencies(child)) {
      deps.add(relation);
    }
  };

  if (node.computedUserset) {
    deps.add(node.computedUserset.relation);
  }

  if (node.tupleToUserset?.computedUserset) {
    deps.add(node.tupleToUserset.computedUserset.relation);
  }

  if (node.union?.child?.length) {
    for (const child of node.union.child) {
      addFromChild(child);
    }
  }

  if (node.intersection?.child?.length) {
    for (const child of node.intersection.child) {
      addFromChild(child);
    }
  }

  if (node.difference) {
    addFromChild(node.difference.base);
    addFromChild(node.difference.subtract);
  }

  return deps;
};

for (const [relation, definition] of Object.entries(merchantType.relations)) {
  const dependencies = collectDependencies(definition);
  for (const dependency of dependencies) {
    ensureEdge(dependency, relation);
  }
}

const traverseGrants = (start: string, assignableSet: Set<string>) => {
  const visited = new Set<string>([start]);
  const granularGrants = new Set<string>();
  const permissionGrants = new Set<string>();
  const queue: string[] = [];

  for (const neighbor of adjacency.get(start) ?? []) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  while (queue.length > 0) {
    const relation = queue.shift()!;
    const isAssignable = assignableSet.has(relation);

    if (isAssignable) {
      if (relation !== start) {
        permissionGrants.add(relation);
      }
    } else {
      granularGrants.add(relation);
    }

    for (const neighbor of adjacency.get(relation) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return {
    granular: Array.from(granularGrants).sort((a, b) => a.localeCompare(b)),
    permissions: Array.from(permissionGrants).sort((a, b) =>
      a.localeCompare(b),
    ),
  };
};

const traverseGrantors = (start: string, assignableSet: Set<string>) => {
  const visited = new Set<string>([start]);
  const grantors = new Set<string>();
  const queue: string[] = [];

  for (const neighbor of reverseAdjacency.get(start) ?? []) {
    if (!visited.has(neighbor)) {
      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  while (queue.length > 0) {
    const relation = queue.shift()!;

    if (assignableSet.has(relation)) {
      grantors.add(relation);
    }

    for (const neighbor of reverseAdjacency.get(relation) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return Array.from(grantors).sort((a, b) => a.localeCompare(b));
};

const collectReachableRelations = (relations: Set<string>) => {
  const reachable = new Set(relations);
  const queue = Array.from(relations);

  while (queue.length > 0) {
    const relation = queue.shift()!;
    for (const neighbor of adjacency.get(relation) ?? []) {
      if (!reachable.has(neighbor)) {
        reachable.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  return reachable;
};

type ComputePermissionsOptions = {
  includeReachable?: boolean;
};

const computePermissions = (
  relations: Set<string>,
  options: ComputePermissionsOptions = {},
) => {
  const seeds = options.includeReachable
    ? collectReachableRelations(relations)
    : relations;

  return Array.from(seeds)
    .map((name) => {
      const { granular, permissions } = traverseGrants(name, relations);
      const grantedBy = traverseGrantors(name, relations);

      return {
        name,
        grants: granular,
        grantsPermissions: permissions,
        grantedBy,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const assignableMerchantPermissions = computePermissions(
  userAssignableRelations,
);

export const customRoleAssignableMerchantPermissions = computePermissions(
  customRoleAssignableRelations,
);

export const customRoleMerchantPermissions = computePermissions(
  customRoleAssignableRelations,
  { includeReachable: true },
);
