import type { Preview } from '@storybook/react';

import './tailwind.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i, // eslint-disable-line prefer-named-capture-group
        date: /Date$/,
      },
    },
  },
};

export default preview;
