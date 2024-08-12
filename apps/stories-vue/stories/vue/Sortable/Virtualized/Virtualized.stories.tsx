import type {Meta, StoryObj} from '@storybook/vue3';

import {ReactWindowExample} from './ReactWindowExample';
import {h} from 'vue';

const meta: Meta<typeof ReactWindowExample> = {
  title: 'Vue/Sortable/Virtualized',
  component: (props) => {
    return <div>{props.container?.()}</div>;
  },
};

export default meta;
type Story = StoryObj<typeof ReactWindowExample>;

export const ReactWindow: Story = {
  name: 'vue3-window',
  args: {
    container() {
      return (
        <ReactWindowExample>
        </ReactWindowExample>
      );
    },
  },
};
