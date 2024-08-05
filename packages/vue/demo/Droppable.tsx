import {defineComponent, ref, h, Fragment, useSlots, onMounted, watch, VNodeRef} from 'vue';
import {useDroppable} from "@dnd-kit/vue";

interface DroppableProps {
  name?: string
}

export const vuePropsType = {
  id: String
}
const Droppable = defineComponent({
  props: {...vuePropsType},
  name: 'Droppable',
  setup(props, {attrs}) {
    const slots = useSlots()
    const {isDropTarget, ref, droppable} = useDroppable({
      id: props.id,
    });

    onMounted(()=>{
      // setInterval(()=>{
      //   console.log(droppable.value.manager?.dragOperation.source, isDropTarget.value)
      // }, 1000)
    })

    // watch(()=>isDropTarget.value.value, (v)=>{
    //   console.log('watch', v)
    // })
    // setInterval(()=>{
    //   console.log(isDropTarget.value.value)
    // }, 1000)
    return () => {
      console.log(isDropTarget.value)
      return (
        <div ref={ref as VNodeRef} style={{width: '300px', height: '300px'}}>
          {isDropTarget.value ? 'Draggable element is over me' : 'Drag something over me'}
        </div>
      )
    }
  }
})


export default Droppable

