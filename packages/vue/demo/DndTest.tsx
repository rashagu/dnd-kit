import {defineComponent, ref, h, Fragment, useSlots, VNodeRef} from 'vue';

import {useDraggable} from '@kousum/dnd-kit-vue';


const DndTest = defineComponent({
  props: {},
  name: 'DndTest',
  setup(props, {attrs}) {
    const slots = useSlots()


    const {ref} = useDraggable({
      id: 'draggable',
    });

    return () => {

      return (
        <button ref={ref as VNodeRef}>
          Draggable
        </button>
      );
    }
  }
})


export default DndTest

