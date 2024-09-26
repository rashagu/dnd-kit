
import {flushSync} from 'react-dom';
import {CollisionPriority} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/vue';
import {useSortable} from '@dnd-kit/vue/sortable';
import {move} from '@dnd-kit/helpers';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {supportsViewTransition} from '@dnd-kit/dom/utilities';

import {
  Actions,
  Container,
  Item,
  Handle,
  Remove,
} from '../../components/index.ts';
import {createRange} from '../../../utilities/createRange.ts';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';
import {computed, defineComponent, h, ref} from 'vue';

interface Props {
  debug?: boolean;
  grid?: boolean;
  defaultItems?: Record<string, string[]>;
  columnStyle?: Record<string, string>;
  itemCount: number;
  scrollable?: boolean;
  vertical?: boolean;
}

export const MultipleLists = defineComponent({
  props:{
    debug: Boolean,
    defaultItems: Object,
    grid: Boolean,
    itemCount: Number,
    columnStyle: Object,
    scrollable: Boolean,
    vertical: Boolean,
  },
  setup(props, { slots }) {

    const items = ref(
      props.defaultItems ?? {
        A: createRange(props.itemCount).map((id) => `A${id}`),
        B: createRange(props.itemCount).map((id) => `B${id}`),
        C: createRange(props.itemCount).map((id) => `C${id}`),
        D: [],
      }
    );
    const columns = ref(Object.keys(items.value));
    const snapshot = ref(cloneDeep(items.value));

    function handleRemoveItem(id: string, column: string) {
      const remove = () =>
        items.value = {
          ...items.value,
          [column]: items.value[column].filter((item) => item !== id),
        }

      if (supportsViewTransition(document)) {
        document.startViewTransition(() => flushSync(remove));
      } else {
        remove();
      }
    }
    return ()=>{

      return (
        <DragDropProvider
          plugins={props.debug ? [...defaultPreset.plugins, Debug] : undefined}
          onDragStart={() => {
            snapshot.value = cloneDeep(items.value);
          }}
          onDragOver={(event) => {
            const {source, target} = event.operation;

            if (!source || !target || source.id === target.id) {
              return;
            }

            if (source.type === 'column') {
              columns.value = move(columns.value, source, target)
              return;
            }

            items.value = move(items.value, source, target)
          }}
          onDragEnd={(event) => {
            if (event.canceled) {
              items.value = snapshot.value
            }
          }}
        >
          <div
            style={{
              display: props.grid ? 'grid' : 'flex',
              width: props.grid ? '60%' : undefined,
              gridTemplateColumns: props.grid ? '1fr 1fr' : undefined,
              alignItems: props.vertical ? 'center' : undefined,
              margin: props.grid ? '0 auto' : undefined,
              flexDirection: props.vertical ? 'column' : 'row',
              gap: '20px',
            }}
          >
            {columns.value.map((column, columnIndex) => {
              const rows = items.value[column];
              console.log(rows);
              const children =
                rows.length > 0
                  ? rows.map((id, index) => (
                    <SortableItem
                      key={id}
                      id={id}
                      column={column}
                      index={index}
                      onRemove={handleRemoveItem}
                      style={props.grid ? {height: '100px'} : undefined}
                    />
                  ))
                  : null;

              return (
                <SortableColumn
                  key={column}
                  id={column}
                  index={columnIndex}
                  columns={props.grid ? 2 : 1}
                  scrollable={props.scrollable}
                  style={props.columnStyle}
                >
                  {children}
                </SortableColumn>
              );
            })}
          </div>
        </DragDropProvider>
      )
    }
  }
})


interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: React.CSSProperties;
  onRemove?: (id: string, column: string) => void;
}

const COLORS: Record<string, string> = {
  A: '#7193f1',
  B: '#FF851B',
  C: '#2ECC40',
  D: '#ff3680',
};

const SortableItem = defineComponent({
  props:{
    id: String,
    column: String,
    index: Number,
    style: Object,
    onRemove: Function,
  },
  setup(props, { slots }) {
    const {handleRef, ref: ref_, isDragSource} = useSortable({
      id: computed(()=>{
        console.log(props.id);
        return props.id
      }),
      group: computed(()=>props.column),
      accept: 'item',
      type: 'item',
      feedback: 'clone',
      index: computed(()=>{
        console.log(props.index);
        return props.index
      }),
    });
    return ()=>{
      return (
        <Item
          ref={ref_}
          actions={
            <Actions>
              {props.onRemove && !isDragSource?.value ? (
                <Remove onClick={() => props.onRemove(props.id, props.column)} />
              ) : null}
              <Handle ref={handleRef} />
            </Actions>
          }
          accentColor={COLORS[props.column]}
          shadow={isDragSource?.value}
          style={props.style}
          transitionId={`sortable-${props.column}-${props.id}`}
        >
          {props.id}
        </Item>
      );
    }
  }
})


interface SortableColumnProps {
  columns: number;
  id: string;
  index: number;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

const SortableColumn = defineComponent({
  props: {
    columns: Number,
    id: String,
    index: Number,
    scrollable: Boolean,
    style: Object,
  },
  setup(props, { slots }) {
    const {handleRef, isDragSource, ref:ref_} = useSortable({
      id: computed(()=>props.id),
      accept: ['column', 'item'],
      collisionPriority: CollisionPriority.Low,
      type: 'column',
      index: computed(()=>props.index),
    });


    return ()=>{
      return (
        <Container
          ref={ref_}
          label={`${props.id}`}
          actions={
            <Actions>
              <Handle ref={handleRef} />
            </Actions>
          }
          columns={props.columns}
          shadow={isDragSource?.value}
          scrollable={props.scrollable}
          transitionId={`sortable-column-${props.id}`}
          style={props.style}
        >
          {slots.default?.()}
        </Container>
      );
    }
  }
})
