import type {Meta, StoryObj} from '@storybook/vue3';

import {DroppableExample} from '../DroppableExample';

const meta: Meta<typeof DroppableExample> = {
  title: 'Vue/Droppable/Multiple drop targets',
  component: DroppableExample,
};

export default meta;
type Story = StoryObj<typeof DroppableExample>;

export const Example: Story = {
  args: {
    droppableCount: 3,
    debug: false,
  },
};

export const Debug: Story = {
  args: {
    droppableCount: 3,
    debug: true,
  },
};
