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
export type FlatNodesMap<T extends NodeId> = Map<T, FlatNode<T>>;

export type ChecboxState = boolean | 'indeterminate';
export type NodeState<T extends NodeId> = { [key in T]: ChecboxState };

export interface UserCheckBoxTreeReturnType<T extends NodeId> {
  checked: T[];
  state: NodeState<T>;
  indeterminates: T[];
  selectNode: (id: T, isChecked?: boolean) => void;
  deSelectNode: (id: T) => void;
  clear: () => void;
}
