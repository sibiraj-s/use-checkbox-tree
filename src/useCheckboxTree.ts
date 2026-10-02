import { useCallback, useMemo, useRef, useState } from 'react';
import { CheckboxState, FlatNode, Node, NodeId, NodeState, UserCheckBoxTreeReturnType } from './types';
import { addToSet, flattenNodes, normalizeChecked, toggleChildren, toggleParent } from './helpers';

const useCheckboxTree = <T extends NodeId>(
  nodes: Node<T>[],
  initialChecked: T[] = [],
): UserCheckBoxTreeReturnType<T> => {
  const [rawChecked, setRawChecked] = useState<T[]>(initialChecked);

  // latest checked ids, so consecutive selectNode calls before a re-render build on each other
  const latestChecked = useRef<T[]>(rawChecked);

  const flatNodes = useMemo(() => flattenNodes(nodes), [nodes]);

  const checked = useMemo(() => normalizeChecked(rawChecked, flatNodes), [rawChecked, flatNodes]);

  const selectNode = useCallback(
    (id: T, isChecked: boolean = true) => {
      const checkedSet = new Set<T>(normalizeChecked(latestChecked.current, flatNodes));

      if (!flatNodes.has(id)) {
        return [...checkedSet];
      }

      addToSet<T>(checkedSet, id, isChecked);
      toggleChildren<T>(id, isChecked, flatNodes, checkedSet);
      toggleParent<T>(id, checkedSet, flatNodes);

      const checkedItems = normalizeChecked(checkedSet, flatNodes);
      latestChecked.current = checkedItems;
      setRawChecked(checkedItems);
      return checkedItems;
    },
    [flatNodes],
  );

  const deSelectNode = useCallback((id: T) => selectNode(id, false), [selectNode]);

  const clear = useCallback(() => {
    latestChecked.current = [];
    setRawChecked([]);
  }, []);

  const state = useMemo(() => {
    const nodeState: NodeState<T> = new Map();

    const isNodeIndeterminate = (node: Node<T>, isChecked: boolean) => {
      let isIndeterminate = false;

      if (isChecked) {
        return isIndeterminate;
      }

      const { children = [] } = node;

      // check if child has any checked items
      isIndeterminate = children.some((child) => checked.includes(child.id));

      // if there are no checked items in direct child
      // try deeper by iterating over its child to check if there any checed items inside
      isIndeterminate ||= children.some((child) => isNodeIndeterminate(child, checked.includes(child.id)));

      return isIndeterminate;
    };

    flatNodes.forEach((node: FlatNode<T>) => {
      const isChecked = checked.includes(node.id);
      const isIndeterminate = isNodeIndeterminate(node, isChecked);
      const checkboxState: CheckboxState = isIndeterminate ? 'indeterminate' : isChecked;
      nodeState.set(node.id, checkboxState);
    });

    return nodeState;
  }, [checked, flatNodes]);

  const indeterminates = useMemo(() => {
    return [...state].filter((cbState) => cbState[1] === 'indeterminate').map((cbState) => cbState[0]);
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
