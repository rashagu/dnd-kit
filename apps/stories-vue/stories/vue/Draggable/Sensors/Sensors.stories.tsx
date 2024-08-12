import type {Meta, StoryObj} from '@storybook/vue3';

import docs from './docs/SensorDocs.mdx';
import {DraggableExample} from '../DraggableExample';

const meta: Meta<typeof DraggableExample> = {
  title: 'Vue/Draggable/Sensors',
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

export const Pointer: Story = {
  name: 'Default sensors',
};
