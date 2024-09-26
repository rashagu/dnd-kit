import type {
  CollisionDetector,
  Modifiers,
  UniqueIdentifier,
} from '@dnd-kit/abstract';
import {FeedbackType, defaultPreset} from '@dnd-kit/dom';
import {type SortableTransition} from '@dnd-kit/dom/sortable';
import {DragDropProvider} from '@dnd-kit/vue';
import {useSortable} from '@dnd-kit/vue/sortable';
import {directionBiased} from '@dnd-kit/collision';
import {move} from '@dnd-kit/helpers';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {Item, Handle} from '../components/index.ts';
import {createRange} from '../../utilities/createRange.ts';
import {CSSProperties, defineComponent, ref, h} from 'vue';

interface Props {
  debug?: boolean;
  dragHandle?: boolean;
  disabled?: UniqueIdentifier[];
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  layout?: 'vertical' | 'horizontal' | 'grid';
  transition?: SortableTransition;
  itemCount?: number;
  optimistic?: boolean;
  collisionDetector?: CollisionDetector;
  getItemStyle?(id: UniqueIdentifier, index: number): CSSProperties;
}

export const SortableExample = defineComponent({
  props: {
    debug: {
      type: [Boolean],
    },
    itemCount: {
      type: Number,
      default: 15,
    },
    collisionDetector: {
      type: [Function],
    },
    disabled: {
      type: [Array],
    },
    dragHandle: {
      type: Boolean,
    },
    feedback: {
      type: String,
    },
    layout: {
      type: String,
      default: 'vertical',
    },
    optimistic: {
      type: Boolean,
      default: true,
    },
    modifiers: {
      type: Array,
    },
    transition: {
      type: Object,
    },
    getItemStyle: {
      type: [Function],
    },
  },
  setup(props, {slots}) {
    const items = ref(createRange(props.itemCount));

    return () => {
      return (
        <DragDropProvider
          plugins={props.debug ? [Debug, ...defaultPreset.plugins] : undefined}
          modifiers={props.modifiers}
          onDragOver={(event) => {
            const {source, target} = event.operation;

            if (props.optimistic) return;

            items.value = move(items.value, source, target);
          }}
          onDragEnd={(event) => {
            const {source, target} = event.operation;

            console.log(event);
            if (event.canceled) {
              return;
            }

            items.value = move(items.value, source, target);
          }}
        >
          <Wrapper layout={props.layout}>
            {items.value.map((id, index) => (
              <SortableItem
                key={id}
                id={id}
                index={index}
                collisionDetector={props.collisionDetector}
                disabled={props.disabled?.includes(id)}
                dragHandle={props.dragHandle}
                feedback={props.feedback}
                optimistic={props.optimistic}
                transition={props.transition}
                style={props.getItemStyle?.(id, index)}
              />
            ))}
          </Wrapper>
        </DragDropProvider>
      );
    };
  },
});

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
  collisionDetector?: CollisionDetector;
  disabled?: boolean;
  dragHandle?: boolean;
  feedback?: FeedbackType;
  optimistic?: boolean;
  transition?: SortableTransition;
  style?: React.CSSProperties;
}

export const SortableItem = defineComponent({
  props: {
    id: {
      type: [Number, String],
    },
    index: {
      type: [Number, String],
    },
    collisionDetector: {
      type: Function,
      default: directionBiased,
    },
    disabled: {
      type: Boolean,
    },
    dragHandle: {
      type: Boolean,
    },
    feedback: {
      type: String,
    },
    transition: {
      type: Object,
    },
    style: {
      type: Object,
    },
    optimistic: {
      type: Boolean,
    },
  },
  setup(props, {slots}) {
    const element = ref<Element | null>(null);
    const handleRef = ref<HTMLButtonElement | null>(null);
    const {isDragSource} = useSortable({
      id: props.id,
      index: props.index,
      element,
      feedback: props.feedback,
      transition: props.transition,
      handle: handleRef,
      disabled: props.disabled,
      collisionDetector: props.collisionDetector,
    });

    return () => {
      return (
        <Item
          ref={element}
          actions={props.dragHandle ? <Handle ref={handleRef} /> : null}
          shadow={isDragSource?.value}
          style={props.style}
        >
          {props.id}
        </Item>
      );
    };
  },
});

function Wrapper(
  {layout}: {layout: 'vertical' | 'horizontal' | 'grid'},
  {slots}
) {
  return <div style={getWrapperStyles(layout)}>{slots.default?.()}</div>;
}

function getWrapperStyles(
  layout: 'vertical' | 'horizontal' | 'grid'
): CSSProperties {
  const baseStyles: CSSProperties = {
    gap: '18px',
    padding: '0 30px',
  };

  switch (layout) {
    case 'grid':
      return {
        ...baseStyles,
        display: 'grid',
        gridTemplateColumns: 'repeat(5, max-content)',
        justifyContent: 'center',
      };
    case 'horizontal':
      return {
        ...baseStyles,
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        height: '180px',
      };
    case 'vertical':
      return {
        ...baseStyles,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      };
  }
}
