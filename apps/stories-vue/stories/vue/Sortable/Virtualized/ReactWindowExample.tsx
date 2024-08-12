
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider} from '@dnd-kit/vue';
import {useSortable} from '@dnd-kit/vue/sortable';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {move} from '@dnd-kit/helpers';
import {FixedSizeList as List} from '@kousum/vue3-window';

import {Item, Handle} from '../../components';
import {createRange, cloneDeep} from '../../../utilities';
import {CSSProperties, defineComponent, ref, h} from 'vue';

interface Props {
  debug?: boolean;
}

export const ReactWindowExample = defineComponent({
  props:{
    debug: Boolean
  },
  setup(props: Props) {
    const items = ref<UniqueIdentifier[]>(createRange(1000));
    const snapshot = ref(cloneDeep(items.value));

    return ()=>{

     return (
        <DragDropProvider
          plugins={props.debug ? [Debug, ...defaultPreset.plugins] : undefined}
          onDragStart={() => {
            snapshot.value = cloneDeep(items);
          }}
          onDragOver={(event) => {
            const {source, target} = event.operation;

            if (!source || !target) {
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
          <div>
            <List
              width={window.innerWidth - 100}
              height={window.innerHeight - 100}
              itemCount={items.value.length}
              itemSize={82}
              itemData={items.value}
              itemKey={(index) => items.value[index]}
              style={{margin: '0 auto'}}
            >
              {{default: (p)=>Row(p)}}
            </List>
          </div>
        </DragDropProvider>
      );
    }
  }
})


function Row(
  {
    data,
    index,
    style,
  }: {
    data: UniqueIdentifier[];
    index: number;
    style: React.CSSProperties;
  }
) {
  return <Sortable id={data[index]} index={index} style={style} />;
}

interface SortableProps {
  id: UniqueIdentifier;
  index: number;
  style: CSSProperties;
}

const Sortable = defineComponent({
  props:{id: [String, Number], index: Number, style: Object},
  setup(props, { slots }) {
    const {isDragSource, ref:ref_, handleRef} = useSortable({
      id: props.id,
      index: props.index,
    });

    return ()=>{
      return (
        <div
          ref={ref_}
          style={{...props.style, display: 'flex', justifyContent: 'center', padding: '10px'}}
        >
          <Item
            actions={<Handle ref={handleRef} />}
            data-index={props.index}
            shadow={isDragSource}
          >
            {props.id}
          </Item>
        </div>
      );
    }
  }
})
