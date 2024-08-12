import type {Meta, StoryObj} from '@storybook/vue3';
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers';
import {RestrictToElement, RestrictToWindow} from '@dnd-kit/dom/modifiers';

import docs from './docs/ModifierDocs.mdx';
import {DraggableExample} from '../DraggableExample';
import {SnapToGridExample} from './SnapToGridExample';
import styles from './styles.module.css';
import {h} from 'vue';

const meta: Meta<typeof DraggableExample> = {
  title: 'Vue/Draggable/Modifiers',
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

export const VerticalAxis: Story = {
  name: 'Vertical axis',
  args: {
    modifiers: [RestrictToVerticalAxis],
  },
};

export const HorizontalAxis: Story = {
  name: 'Horizontal axis',
  args: {
    modifiers: [RestrictToHorizontalAxis],
  },
};

export const WindowModifier: Story = {
  name: 'Restrict to window',
  args: {
    modifiers: [RestrictToWindow],
  },
};

export const ContainerModifier: Story = {
  name: 'Restrict to container',
  args: {
    container({}, {slots}) {
      return (
        <div class={styles.Container} data-container>
          {slots.default?.()}
        </div>
      );
    },
    modifiers: [
      RestrictToElement.configure({
        element() {
          return document.querySelector('[data-container]');
        },
      }),
    ],
  },
};

export const SnapModifierExample: Story = {
  name: 'Snap to grid',
  args: {
    container({}, {slots}) {
      return (
        <SnapToGridExample>
          {slots.default?.()}
        </SnapToGridExample>
      );
    },
  }
};
