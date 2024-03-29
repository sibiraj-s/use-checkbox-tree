import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useRef } from 'react';

import useCheckboxTree, { CheckboxTreeProvider, useCheckboxTreeContext } from '../src/index';
import type { UserCheckBoxTreeReturnType } from '../src/types';

import FolderIcon from './assets/folder.svg?react';
import FileIcon from './assets/file.svg?react';

interface TreeNode {
  id: number;
  name: string;
  type: 'directory' | 'file';
  children?: TreeNode[];
}

const fileTree: TreeNode[] = [
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

const TreeItem = ({ node }: { node: TreeNode }) => {
  const { selectNode, checked, indeterminates } = useCheckboxTreeContext() as UserCheckBoxTreeReturnType<
    TreeNode['id']
  >;
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!checkboxRef.current) {
      return;
    }

    checkboxRef.current.indeterminate = indeterminates.includes(node.id);
  }, [node.id, indeterminates]);

  return (
    <div className='flex items-center'>
      <input
        ref={checkboxRef}
        id={`${node.id}`}
        type='checkbox'
        checked={checked.includes(node.id)}
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

const TreeView = ({ nodes }: { nodes: TreeNode[] }) => {
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
  const treeMethods = useCheckboxTree(fileTree);

  return (
    <CheckboxTreeProvider {...treeMethods}>
      <TreeView nodes={fileTree} />
    </CheckboxTreeProvider>
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/react/writing-stories/introduction
const meta: Meta<typeof CheckboxTree> = {
  title: 'CheckboxTree',
  component: CheckboxTree,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/react/writing-stories/args
export const Tree: Story = {
  args: {},
};
