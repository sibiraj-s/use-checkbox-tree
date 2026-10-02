import { FlatNodesMap, Node, NodeId, Nodes } from './types';

export const addToSet = <T extends NodeId>(set: Set<T>, value: T, is: boolean): Set<T> => {
  if (is) {
    set.add(value);
  } else {
    set.delete(value);
  }

  return set;
};

export const flattenNodes = <T extends NodeId>(nodes: Nodes<T>): FlatNodesMap<T> => {
  const flatMap: FlatNodesMap<T> = new Map();

  const flatten = (node: Node<T>, pid: T | null = null, depth = 0) => {
    if (flatMap.has(node.id)) {
      throw Error(`Found duplicate entries in tree for node: ${node.id}`);
    }

    flatMap.set(node.id, {
      ...node,
      pid,
      depth,
    });

    node.children?.forEach((child) => flatten(child, node.id, depth + 1));
  };

  nodes.forEach((node) => flatten(node, null, 0));
  return flatMap;
};

export const toggleChildren = <T extends NodeId>(
  nodeId: T,
  isChecked: boolean,
  flatNodes: FlatNodesMap<T>,
  checkedSet: Set<T>,
) => {
  const node = flatNodes.get(nodeId);

  if (!node?.children?.length) {
    return;
  }

  node.children.forEach((child) => {
    addToSet<T>(checkedSet, child.id, isChecked);

    if (child.children?.length) {
      toggleChildren(child.id, isChecked, flatNodes, checkedSet);
    }
  });
};

export const toggleParent = <T extends NodeId>(nodeId: T, checkedSet: Set<T>, flatNodes: FlatNodesMap<T>) => {
  const node = flatNodes.get(nodeId);
  if (!node || node.pid === null) {
    return;
  }

  const parent = flatNodes.get(node.pid) as Node<T>;
  if (!parent || !parent.children || !parent.children.length) {
    return;
  }

  const allChecked = parent.children.every((child) => checkedSet.has(child.id));
  addToSet<T>(checkedSet, parent.id, allChecked);
  toggleParent(parent.id, checkedSet, flatNodes);
};

// make checked ids consistent with the tree: drop unknown ids, check descendants
// of checked nodes and check parents whose children are all checked
export const normalizeChecked = <T extends NodeId>(checked: Iterable<T>, flatNodes: FlatNodesMap<T>): T[] => {
  const checkedSet = new Set<T>();
  for (const id of checked) {
    if (flatNodes.has(id)) {
      checkedSet.add(id);
    }
  }

  // flatNodes is in pre-order, so parents are visited before their children
  const ordered = [...flatNodes.values()];

  ordered.forEach((node) => {
    if (node.pid !== null && checkedSet.has(node.pid)) {
      checkedSet.add(node.id);
    }
  });

  ordered.reverse().forEach((node) => {
    if (node.children?.length) {
      const allChecked = node.children.every((child) => checkedSet.has(child.id));
      addToSet<T>(checkedSet, node.id, allChecked);
    }
  });

  return [...flatNodes.keys()].filter((id) => checkedSet.has(id));
};
