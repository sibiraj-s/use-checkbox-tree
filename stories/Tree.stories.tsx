import type { Meta, StoryObj } from '@storybook/react';
import useCheckboxTree, {
  CheckboxTreeProvider,
  Nodes,
  Node,
  useCheckboxTreeContext,
  UserCheckBoxTreeReturnType,
} from '../src/index';

import { ReactComponent as FolderIcon } from './assets/folder.svg';
import { ReactComponent as FileIcon } from './assets/file.svg';
import { useEffect, useRef } from 'react';

const fileTree = [
  {
    id: 1,
    name: 'root',
    type: 'directory',
    children: [
      {
        id: 2,
        name: 'src',
        type: 'directory',
        children: [
          {
            id: 3,
            name: 'index.js',
            type: 'file',
          },
          {
            id: 4,
            name: 'components',
            type: 'directory',
            children: [
              {
                id: 5,
                name: 'Button.js',
                type: 'file',
              },
              {
                id: 6,
                name: 'Header.js',
                type: 'file',
              },
            ],
          },
        ],
      },
      {
        id: 7,
        name: 'public',
        type: 'directory',
        children: [
          {
            id: 8,
            name: 'index.html',
            type: 'file',
          },
          {
            id: 9,
            name: 'images',
            type: 'directory',
            children: [
              {
                id: 10,
                name: 'logo.png',
                type: 'file',
              },
            ],
          },
        ],
      },
    ],
  },
];

const TreeItem = ({ node }: { node: Node<number> }) => {
  const { selectNode, state } = useCheckboxTreeContext() as UserCheckBoxTreeReturnType<number>;
  const checkboxRef = useRef<HTMLInputElement>(null);

  const nodeState = state[node.id];

  useEffect(() => {
    if (!checkboxRef.current) {
      return;
    }
    checkboxRef.current.indeterminate = nodeState === 'indeterminate';
  }, [nodeState]);

  return (
    <div className='flex items-center'>
      <input
        ref={checkboxRef}
        id={`${node.id}`}
        type='checkbox'
        checked={state[node.id] === true}
        onChange={(e) => selectNode(node.id, e.target.checked)}
      />
      <label htmlFor={`${node.id}`} className='flex items-center pl-1'>
        <span className='ml-2 mr-1'>
          {node.type === 'file' && <FileIcon className='w-4 h-4' />}
          {node.type === 'directory' && <FolderIcon className='w-4 h-4' />}
        </span>
        {node.name}
        <span className='text-sm'>{node.type === 'directory' ? '/' : ''}</span>
      </label>
    </div>
  );
};

const TreeView = ({ nodes }: { nodes: Nodes<number> }) => {
  return (
    <>
      {nodes.map((node) => {
        return (
          <div key={`Tree__${node.id}`}>
            <div className='flex items-center'>
              <TreeItem node={node} />
            </div>
            {node.children && (
              <div className='pl-5 my-1 flex flex-col'>
                <TreeView nodes={node.children} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

const CheckboxTree = () => {
  const treeMethods = useCheckboxTree<number>(fileTree);

  return (
    <CheckboxTreeProvider {...treeMethods}>
      <TreeView nodes={fileTree} />
    </CheckboxTreeProvider>
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta = {
  title: 'CheckboxTree',
  component: CheckboxTree,
  tags: ['autodocs'],
} satisfies Meta<typeof CheckboxTree>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Tree: Story = {
  args: {},
};
