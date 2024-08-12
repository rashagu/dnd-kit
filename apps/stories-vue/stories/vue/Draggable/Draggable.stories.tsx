import type {Meta, StoryObj} from '@storybook/vue3';

import {DraggableExample} from './DraggableExample.tsx';
import docs from './docs/DraggableDocs.mdx';

const meta: Meta<typeof DraggableExample> = {
  title: 'Vue/Draggable',
  component: DraggableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DraggableExample>;

export const Example: Story = {
  name: 'Example',
};
