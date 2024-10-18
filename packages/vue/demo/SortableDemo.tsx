import {defineComponent, ref, h, Fragment, useSlots, VNodeRef} from 'vue';
import {useSortable} from '@kousum/dnd-kit-vue/sortable';
import {DragDropProvider} from '@kousum/dnd-kit-vue';

const Sortable = defineComponent({
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const {ref} = useSortable({id: props.id, index: props.index});

    return () => (
      <li ref={ref as VNodeRef}>Item {props.id}</li>
    );
  },
});


const SortableDemo = defineComponent({
  props: {},
  name: 'SortableDemo',
  setup(props, {attrs}) {
    const slots = useSlots();
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];


    return () => (
      <div>
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;
            console.log(event, event);
          }}
        >
          <ul>
            {items.map((id, index) =>
              <Sortable key={id} id={id} index={index} />,
            )}
          </ul>
        </DragDropProvider>

      </div>
    );
  },
});


export default SortableDemo;

