import { expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';

import useCheckboxTree from '.';
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

it('should return checked items from ', () => {
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
  expect(() => renderHook(() => useCheckboxTree([{ id: 1 }, { id: 1 }]))).toThrow();
  restoreConsole();
});
