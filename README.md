# use-checkbox-tree

> React hook for checkbox tree component

[![Tests](https://github.com/sibiraj-s/use-checkbox-tree/actions/workflows/tests.yml/badge.svg)](https://github.com/sibiraj-s/use-checkbox-tree/actions/workflows/tests.yml)
[![Version](https://badgen.net/npm/v/use-checkbox-tree)](https://npmjs.com/use-checkbox-tree)
[![License](https://badgen.net/npm/license/use-checkbox-tree)](https://github.com/sibiraj-s/use-checkbox-tree/blob/master/LICENSE)

## Installation

```bash
npm i use-checkbox-tree
```

## Usage

```jsx
import ReactDOM from 'react-dom';
import useCheckboxTree from 'use-checkbox-tree';

const nodes = [
  {
    id: '1',
    children: [
      {
        id: '1.1',
      },
      {
        id: '1.2',
      },
    ],
  },
];

const initialValue = [];

const TreeComponent = () => {
  const { checked, state, selectNode } = useCheckboxTree(nodes, initialValue);

  return (
    // iterate through nodes and create your own tree view
    <div />
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<TreeComponent />);
```

### Return values

- checked - array of selected node ids
- selectNode - a function to select node

```js
selectNode('1', true); // select a node
selectNode('1', false); // deselect a node
```

- state - object with id as key and value as `boolean | indeterminate`

```json
{
  "1": "indeterminate",
  "1.1": true,
  "1.2": false
}
```
