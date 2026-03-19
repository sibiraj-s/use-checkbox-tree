import { expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';

import useCheckboxTree from '.';
import { CheckboxTreeProvider, useCheckboxTreeContext } from './context';
import { suppressErrorOutput } from './test-utils';

const nodes = [
  {
    id: 1,
    children: [{ id: 2, children: [{ id: 2.1 }] }, { id: 2.2 }],
  },
];

it('should return default values correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes));

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);

  expect(result.current.state.get(1)).toEqual(false);
  expect(result.current.state.get(2)).toEqual(false);
  expect(result.current.state.get(2.1)).toEqual(false);
  expect(result.current.state.get(2.2)).toEqual(false);

  expect(result.current.selectNode).toBeInstanceOf(Function);
});

it('should check child nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode(1, true);
  });

  expect(result.current.checked).toEqual([1, 2, 2.1, 2.2]);
});

it('should check parent nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode(2, true);
  });

  act(() => {
    result.current.selectNode(2.2, true);
  });

  expect(result.current.checked).toEqual(expect.arrayContaining([1, 2, 2.1, 2.2]));
});

it('should set indeterminate nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode(2, true);
  });

  expect(result.current.checked).toEqual([2, 2.1]);
  expect(result.current.indeterminates).toEqual([1]);
});

it('should select node with selectNode method', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode(2);
  });

  expect(result.current.checked).toEqual([2, 2.1]);
  expect(result.current.indeterminates).toEqual([1]);
});

it('should deselect node with deSelectNode method', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, [2.1, 2.2]));

  act(() => {
    result.current.deSelectNode(2.2);
  });

  expect(result.current.checked).toEqual([2.1]);
  expect(result.current.indeterminates).toEqual([1, 2]);
});

it('should set uncheck nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, [2]));

  expect(result.current.checked).toEqual([2]);

  act(() => {
    result.current.selectNode(2, false);
  });

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);
});

it('should return checked items from', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, [2]));
  act(() => {
    const checked = result.current.selectNode(2, true);
    expect(checked).toEqual(expect.arrayContaining([2]));
  });

  expect(result.current.checked).toEqual([2, 2.1]);
});

it('should do nothing when selectNode is called with id not in the tree', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes));

  act(() => {
    const checked = result.current.selectNode(10, true);
    expect(checked).toEqual(expect.arrayContaining([]));
  });
  expect(result.current.checked).toEqual([]);
});

it('should clear checked items with clear method', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, [1]));

  act(() => {
    result.current.clear();
  });

  expect(result.current.checked).toEqual([]);
});

it('should throw error for nodes with duplicated ids', () => {
  const restoreConsole = suppressErrorOutput();
  expect(() => renderHook(() => useCheckboxTree([{ id: 1 }, { id: 1 }]))).toThrow(
    'Found duplicate entries in tree for node: 1',
  );
  restoreConsole();
});

it('should detect indeterminate state through multiple levels (grandchild only checked)', () => {
  // Regression test for isNodeIndeterminate recursive call fix:
  // previously passed parent's isChecked to child, masking deep indeterminate states
  const deepNodes = [{ id: 1, children: [{ id: 2, children: [{ id: 3 }] }] }];
  const { result } = renderHook(() => useCheckboxTree(deepNodes, [3]));

  expect(result.current.checked).toEqual([3]);
  expect(result.current.state.get(3)).toEqual(true);
  expect(result.current.state.get(2)).toEqual('indeterminate');
  expect(result.current.state.get(1)).toEqual('indeterminate');
  expect(result.current.indeterminates).toEqual(expect.arrayContaining([1, 2]));
});

it('should uncheck children when parent is deselected', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, [1, 2, 2.1, 2.2]));

  act(() => {
    result.current.deSelectNode(1);
  });

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);
});

it('should make parent indeterminate when intermediate node is deselected', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, [1, 2, 2.1, 2.2]));

  act(() => {
    result.current.deSelectNode(2);
  });

  expect(result.current.checked).toEqual([2.2]);
  expect(result.current.indeterminates).toEqual([1]);
  expect(result.current.state.get(2)).toEqual(false);
  expect(result.current.state.get(2.1)).toEqual(false);
});

it('should work with string ids', () => {
  const stringNodes = [{ id: 'a', children: [{ id: 'b' }, { id: 'c' }] }];
  const { result } = renderHook(() => useCheckboxTree(stringNodes, []));

  act(() => {
    result.current.selectNode('b');
  });

  expect(result.current.checked).toEqual(['b']);
  expect(result.current.indeterminates).toEqual(['a']);

  act(() => {
    result.current.selectNode('c');
  });

  expect(result.current.checked).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  expect(result.current.indeterminates).toEqual([]);
});

it('should handle an empty tree', () => {
  const { result } = renderHook(() => useCheckboxTree([]));

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);
  expect(result.current.state.size).toEqual(0);
});

it('should reset indeterminates when clear is called', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode(2);
  });

  expect(result.current.indeterminates).toEqual([1]);

  act(() => {
    result.current.clear();
  });

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);
});

it('should be idempotent when selecting an already-checked node', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode(1);
  });

  const checkedAfterFirst = result.current.checked;

  act(() => {
    result.current.selectNode(1);
  });

  expect(result.current.checked).toEqual(checkedAfterFirst);
});

it('should provide state via CheckboxTreeProvider and useCheckboxTreeContext', () => {
  const { result } = renderHook(
    () => {
      const tree = useCheckboxTree(nodes, [2, 2.1]);
      return { tree, ctx: useCheckboxTreeContext() };
    },
    {
      wrapper: ({ children }) => {
        const tree = useCheckboxTree(nodes, [2, 2.1]);
        return createElement(CheckboxTreeProvider, { ...tree }, children);
      },
    },
  );

  expect(result.current.ctx).not.toBeNull();
  expect(result.current.ctx?.checked).toEqual([2, 2.1]);
  expect(result.current.ctx?.indeterminates).toEqual([1]);
});
