
import {DragDropProvider} from '@kousum/dnd-kit-vue';
import {useSortable} from '@kousum/dnd-kit-vue/sortable';
import {move} from '@dnd-kit/helpers';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';
import {Container, Item} from '../../components/index.ts';
import {createRange} from '../../../utilities/createRange.ts';
import {cloneDeep} from '../../../utilities/cloneDeep.ts';
import {defineComponent, onMounted, ref, shallowRef, h, computed, CSSProperties} from 'vue';

const AutoFrame = 'div';

interface Props {
  debug?: boolean;
  defaultItems?: Record<string, string[]>;
  columnStyle?: Record<string, string>;
  itemCount: number;
  scrollable?: boolean;
  transform?: boolean;
}

const IframeLists = defineComponent({
  props:{
    debug: Boolean,
    defaultItems: Object,
    itemCount: Number,
    columnStyle: Object,
    scrollable: Boolean,
    transform: Boolean,
  },
  setup(props){
    console.log(props);

    const items = ref(
      props.defaultItems ?? {
        host: createRange(props.itemCount).map((id) => `Host: ${id}`),
        iframe: createRange(props.itemCount).map((id) => `Iframe: ${id}`),
      }
    );
    console.log(items.value);
    const snapshot = shallowRef(cloneDeep(items.value));

    const bodyClassName = ref('');

    onMounted(()=>{
      const body = document.querySelector('body');

      if (!body) return;

      if (body.classList.contains('dark')) {
        bodyClassName.value = ('dark');
      }
    })
    return ()=>{
      const {
        debug,
        defaultItems,
        itemCount,
        columnStyle,
        scrollable,
        transform,
      } = props
      return (
        <DragDropProvider
          plugins={debug ? [...defaultPreset.plugins, Debug] : undefined}
          onDragStart={() => {
            snapshot.value = cloneDeep(items.value);
          }}
          onDragOver={(event) => {
            items.value = move(items.value, event);
          }}
          onDragEnd={(event) => {
            if (event.canceled) {
              items.value = (snapshot.value);
              return;
            }
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
            }}
          >
            <Column id="host" scrollable={scrollable} style={columnStyle}>
              {items.value.host.map((id, index) => (
                <SortableItem key={id} id={id} column={'host'} index={index} />
              ))}
            </Column>

            <AutoFrame
              style={{
                border: 'none',
                transform: transform ? 'scale(0.8)' : undefined,
              }}
            >
              <style
                dangerouslySetInnerHTML={{
                  __html: 'body { background: transparent; margin: 0 !important; }',
                }}
              />
              <div class={bodyClassName}>
                <Column id="iframe" scrollable={scrollable} style={columnStyle}>
                  {items.value.iframe.map((id, index) => (
                    <SortableItem key={id} id={id} column="iframe" index={index} />
                  ))}
                </Column>
              </div>
            </AutoFrame>
          </div>
        </DragDropProvider>
      )
    };
  }
})

export {IframeLists}

interface SortableItemProps {
  id: string;
  column: string;
  index: number;
  style?: CSSProperties;
}

const COLORS: Record<string, string> = {
  Host: '#7193f1',
  Iframe: '#FF851B',
};

const SortableItem = defineComponent({
  props:{
    id: String,
    column: String,
    index: Number,
    style: Object,
  },
  setup(props){

    const group = computed(()=>props.column);
    const {ref: setRef, isDragSource} = useSortable({
      id: props.id,
      group,
      accept: 'item',
      type: 'item',
      feedback: 'clone',
      index: props.index,
      data: {group: group.value},
    });

    return ()=>(
      <Item
        ref={setRef}
        accentColor={COLORS[props.column]}
        shadow={isDragSource}
        style={props.style}
        transitionId={`sortable-${props.column}-${props.id}`}
      >
        {props.id}
      </Item>
    );
  }
})



interface ColumnProps {
  id: string;
  scrollable?: boolean;
  style?: React.CSSProperties;
}

function Column({
  children,
  id,
  scrollable,
  style,
}, {slots}) {
  return (
    <Container
      label={id.charAt(0).toUpperCase() + id.slice(1)}
      scrollable={scrollable}
      transitionId={`sortable-column-${id}`}
      style={style}
    >
      {{default:()=>slots.default?.()}}
    </Container>
  );
}
