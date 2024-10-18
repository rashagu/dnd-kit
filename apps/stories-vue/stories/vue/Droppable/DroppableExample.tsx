
import type {UniqueIdentifier} from '@dnd-kit/abstract';
import {DragDropProvider, useDraggable, useDroppable} from '@kousum/dnd-kit-vue';
import {defaultPreset} from '@dnd-kit/dom';
import {Debug} from '@dnd-kit/dom/plugins/debug';

import {createRange} from '../../utilities';
import {Button, Dropzone} from '../components';
import {DraggableIcon} from '../icons';
import {defineComponent, ref, h} from 'vue';

interface Props {
  droppableCount?: number;
  debug?: boolean;
}
export const DroppableExample = defineComponent({
  props:{
    droppableCount: Number,
    debug: Boolean
  },
  setup(props, {slots}) {
    const parent = ref<UniqueIdentifier | undefined>();
    const draggable = <Draggable id="draggable" />;

    return ()=>{
      return (
        <DragDropProvider
          plugins={props.debug ? [...defaultPreset.plugins, Debug] : undefined}
          onDragEnd={(event) => {
            const {target} = event.operation;

            if (event.canceled) {
              return;
            }
            parent.value = target?.id
          }}
        >
          <section>
            <div style={{display: 'flex', justifyContent: 'center'}}>
              {parent.value == null ? draggable : null}
            </div>
            {createRange(props.droppableCount).map((id) => (
              <Droppable key={id} id={id}>
                {parent.value === id ? draggable : null}
              </Droppable>
            ))}
          </section>
        </DragDropProvider>
      );
    }
  }
})


interface DraggableProps {
  id: UniqueIdentifier;
}

const Draggable = defineComponent({
  props:{
    id: String,
  },
  setup(props, {slots}) {
    const element = ref<Element | null>(null);

    const {isDragSource} = useDraggable({
      id: props.id,
      element,
    });
    return ()=>{
      return (
        <Button ref={element} shadow={isDragSource?.value}>
          <DraggableIcon />
        </Button>
      );
    }
  }
})


interface DroppableProps {
  id: UniqueIdentifier;
}
const Droppable = defineComponent({
  props: {
    id: [String, Number],
  },
  setup(props, {slots}) {
    const {ref, isDropTarget} = useDroppable({id: props.id});

    return ()=>{
      return (
        <Dropzone ref={ref} highlight={isDropTarget.value}>
          {slots.default?.()}
        </Dropzone>
      );
    }
  }
})
