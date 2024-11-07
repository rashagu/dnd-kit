import type {Meta, StoryObj} from '@storybook/vue3';

import {DroppableExample} from './DroppableExample';
import docs from './docs/DroppableDocs.mdx';

const meta: Meta<typeof DroppableExample> = {
  title: 'Vue/Droppable',
  component: DroppableExample,
  tags: ['autodocs'],
  parameters: {
    docs: {
      page: docs,
    },
  },
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Example: Story = {
  name: 'Example',
  args: {
    droppableCount: 1,
    debug: false,
  },
};
