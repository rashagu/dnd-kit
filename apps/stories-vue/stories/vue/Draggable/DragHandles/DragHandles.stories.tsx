import type {Meta, StoryObj} from '@storybook/vue3';

import docs from './docs/DragHandles.mdx';
import {DraggableExample} from '../DraggableExample';

const meta: Meta<typeof DraggableExample> = {
  title: 'Vue/Draggable/Drag handles',
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

export const DragHandle: Story = {
  name: 'Example',
  args: {
    handle: true,
  },
};
