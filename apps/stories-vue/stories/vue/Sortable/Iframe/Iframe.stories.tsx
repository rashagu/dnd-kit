import type {Meta, StoryObj} from '@storybook/vue3';

import {IframeLists} from './IframeExample.tsx';

const meta: Meta<typeof IframeLists> = {
  title: 'VUE/Sortable/Iframe',
  component: IframeLists,
};

export default meta;
type Story = StoryObj<typeof IframeLists>;

export const Iframe: Story = {
  name: 'Iframe',
  args: {
    debug: false,
    itemCount: 6,
  },
};

export const IframeTransformed: Story = {
  name: 'Transformed Iframe',
  args: {
    debug: false,
    itemCount: 6,
    transform: true,
  },
};
