
import type {Modifiers, Sensors} from '@dnd-kit/abstract';
import type {FeedbackType} from '@dnd-kit/dom';
import {DragDropProvider, useDraggable} from '@dnd-kit/vue';

import {Button, Handle} from '../components';
import {DraggableIcon} from '../icons';
import {CSSProperties, defineComponent, ref, h, watch} from 'vue';

interface Props {
  container?: any;
  handle?: boolean;
  modifiers?: Modifiers;
  sensors?: Sensors;
}

export function DraggableExample({
  container,
  handle,
  modifiers,
  sensors,
}: Props) {
  const Wrapper = container ?? 'div';

  return (
    <DragDropProvider sensors={sensors}>
      <Wrapper>
        <Draggable id="draggable" modifiers={modifiers} handle={handle} />
      </Wrapper>
    </DragDropProvider>
  );
}

interface DraggableProps {
  id: string;
  handle?: boolean;
  feedback?: FeedbackType;
  modifiers?: Modifiers;
  style?: CSSProperties;
}

export const Draggable = defineComponent({
  props:{
    id: String,
    handle: Boolean,
    feedback: String,
    modifiers: Array,
    style: Object,
  },
  setup(props, { slots }) {

    const element = ref(null);
    const handleRef = ref();
    watch(element, (v)=>{
      console.log(v);
    })

    const {isDragSource, ref: elementRel} = useDraggable({
      id: props.id,
      modifiers: props.modifiers,
      element: element,
      feedback: props.feedback,
      handle: handleRef,
    });


    return ()=>{
      return (
        <Button
          ref={element}
          shadow={isDragSource}
          actions={props.handle ? <Handle ref={handleRef} variant="dark" /> : undefined}
          style={props.style}
        >
          {{default: ()=><DraggableIcon />}}
        </Button>
      );
    }
  }
})
