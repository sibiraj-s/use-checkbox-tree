import { useCallback, useMemo, useState } from 'react';

export type NodeId = string | number;
export type Node<T extends NodeId> = {
  [key: string | number]: any;
  id: T;
  children?: Nodes<T>;
};
export type Nodes<T extends NodeId> = Array<Node<T>>;

export interface FlatNode<T extends NodeId> extends Node<T> {
  pid: T | null;
  depth: number;
  children?: Array<Node<T>>;
}
type FlatNodesMap<T extends NodeId> = Map<T, FlatNode<T>>;

type ChecboxState = boolean | 'indeterminate';
export type NodeState<T extends NodeId> = { [key in T]: ChecboxState };

const addToSet = <T>(set: Set<T>, value: T, is: boolean): Set<T> => {
  if (is) {
    set.add(value);
  } else {
    set.delete(value);
  }

  return set;
};

const flattenNodes = <T extends NodeId>(nodes: Nodes<T>): FlatNodesMap<T> => {
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

const toggleChildren = <T extends NodeId>(
  nodeId: T,
  isChecked: boolean,
  flatNodes: FlatNodesMap<T>,
  checkedSet: Set<T>
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

const toggleParent = <T extends NodeId>(nodeId: T, checkedSet: Set<T>, flatNodes: FlatNodesMap<T>) => {
  const node = flatNodes.get(nodeId);
  if (!node || !node.pid) {
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

const useCheckboxTree = <T extends NodeId>(nodes: Nodes<T>, initialChecked: T[] = []) => {
  const [checked, setChecked] = useState<T[]>(initialChecked);

  const flatNodes = useMemo(() => flattenNodes(nodes), [nodes]);

  const selectNode = useCallback(
    (id: T, isChecked: boolean) => {
      const checkedSet = new Set<T>(checked);

      if (!flatNodes.has(id)) {
        return checked;
      }

      addToSet<T>(checkedSet, id, isChecked);
      toggleChildren<T>(id, isChecked, flatNodes, checkedSet);
      toggleParent<T>(id, checkedSet, flatNodes);

      const checkedItems = [...checkedSet];
      setChecked(checkedItems);
      return checkedItems;
    },
    [checked, flatNodes]
  );

  const state = useMemo(() => {
    const nodeState = {} as NodeState<T>; // eslint-disable-line @typescript-eslint/consistent-type-assertions

    const isNodeIndeterminate = (node: Node<T>) => {
      let isIndeterminate = false;
      const { children = [] } = node;

      isIndeterminate = children.some((child) => checked.includes(child.id));

      if (!isIndeterminate) {
        children.forEach((child) => {
          isIndeterminate = isNodeIndeterminate(child);
        });
      }

      return isIndeterminate;
    };

    flatNodes.forEach((node: FlatNode<T>) => {
      const isChecked = checked.includes(node.id);
      const isIndeterminate = !isChecked && isNodeIndeterminate(node);
      const checkboxState: ChecboxState = isIndeterminate ? 'indeterminate' : isChecked;
      nodeState[node.id] = checkboxState;
    });

    return nodeState;
  }, [checked, flatNodes]);

  const indeterminates = useMemo(() => {
    return Object.keys(state).reduce<T[]>((prev, id) => {
      const nodeId = id as T;

      if (state[nodeId] === 'indeterminate') {
        return [...prev, nodeId];
      }

      return prev;
    }, []);
  }, [state]);

  return {
    checked,
    state,
    indeterminates,
    selectNode,
  } as const;
};

export default useCheckboxTree;
