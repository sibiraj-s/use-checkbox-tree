import { useCallback, useMemo, useState } from 'react';
import { ChecboxState, FlatNode, Node, NodeId, NodeState, Nodes, UserCheckBoxTreeReturnType } from './types';
import { addToSet, flattenNodes, toggleChildren, toggleParent } from './helpers';

const useCheckboxTree = <T extends NodeId>(
  nodes: Nodes<T>,
  initialChecked: T[] = []
): UserCheckBoxTreeReturnType<T> => {
  const [checked, setChecked] = useState<T[]>(initialChecked);

  const flatNodes = useMemo(() => flattenNodes(nodes), [nodes]);

  const selectNode = useCallback(
    (id: T, isChecked: boolean = true) => {
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

  const deSelectNode = useCallback(
    (id: T) => {
      selectNode(id, false);
    },
    [selectNode]
  );

  const clear = useCallback(() => {
    setChecked([]);
  }, []);

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
    deSelectNode,
    clear,
  };
};

export default useCheckboxTree;