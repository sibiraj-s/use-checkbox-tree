import { expect, it } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';

import useCheckboxTree from '.';

const nodes = [
  {
    id: '1',
    children: [{ id: '2', children: [{ id: '2.1' }] }, { id: '3' }],
  },
];

it('should return default values correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes));

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);
  expect(result.current.state).toEqual({
    1: false,
    2: false,
    2.1: false,
    3: false,
  });
  expect(result.current.selectNode).toBeInstanceOf(Function);
});

it('should check child nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode('1', true);
  });

  expect(result.current.checked).toEqual(['1', '2', '2.1', '3']);
});

it('should check parent nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode('2', true);
  });

  act(() => {
    result.current.selectNode('3', true);
  });

  expect(result.current.checked).toEqual(expect.arrayContaining(['1', '2', '2.1', '3']));
});

it('should set indeterminate nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode('2', true);
  });

  expect(result.current.checked).toEqual(['2', '2.1']);
  expect(result.current.indeterminates).toEqual(['1']);
});

it('should select node by default with selectNode method', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, []));

  act(() => {
    result.current.selectNode('2');
  });

  expect(result.current.checked).toEqual(['2', '2.1']);
  expect(result.current.indeterminates).toEqual(['1']);
});

it('should set uncheck nodes correctly', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, ['2']));

  expect(result.current.checked).toEqual(['2']);

  act(() => {
    result.current.selectNode('2', false);
  });

  expect(result.current.checked).toEqual([]);
  expect(result.current.indeterminates).toEqual([]);
});

it('selectNode should return checked items', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, ['2']));
  act(() => {
    const checked = result.current.selectNode('2', true);
    expect(checked).toEqual(expect.arrayContaining(['2']));
  });

  expect(result.current.checked).toEqual(['2', '2.1']);
});

it('should throw error for nodes with duplicated ids', () => {
  expect(() => renderHook(() => useCheckboxTree([{ id: 1 }, { id: 1 }]))).toThrow();
});

it('should do nothing when selectNode is called with id not in the tree', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes));

  act(() => {
    const checked = result.current.selectNode('10', true);
    expect(checked).toEqual(expect.arrayContaining([]));
  });
  expect(result.current.checked).toEqual([]);
});

it('should clear checked items with clear method', () => {
  const { result } = renderHook(() => useCheckboxTree(nodes, ['1']));

  act(() => {
    result.current.clear();
  });

  expect(result.current.checked).toEqual([]);
});
