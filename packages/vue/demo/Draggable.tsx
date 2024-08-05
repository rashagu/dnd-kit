import {defineComponent, ref, h, Fragment, useSlots, VNodeRef} from 'vue';

import {useDraggable} from "@dnd-kit/vue";


const Draggable = defineComponent({
  props: {},
  name: 'Draggable',
  setup(props, {attrs}) {
    const slots = useSlots()
    const {ref} = useDraggable({
      id: 'draggable',
    });


    return () => (
      <button ref={ref as VNodeRef}>
        Draggable
      </button>
    )
  }
})


export default Draggable

