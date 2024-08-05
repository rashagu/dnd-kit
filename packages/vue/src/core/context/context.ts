
import {DragDropManager} from '@dnd-kit/dom';

import {defineComponent, h, inject, PropType, provide, Ref, ref, shallowRef, UnwrapRef, useSlots, watch} from 'vue';


export function useConfigContext(): { context: Ref<UnwrapRef<DragDropManager>> } {
  const context = inject('ConfigContext', shallowRef<DragDropManager>(defaultManager));
  return {
    context,
  };
}
const Consumer = defineComponent({
  name: 'ConfigContextConsumer',
  setup() {
    const slots = useSlots();
    const { context } = useConfigContext();
    return () => (slots.default ? slots.default(context) : null);
  },
});


export const vuePropsType = {
  value: Object as PropType<DragDropManager>,
};
const Provider = defineComponent({
  props: { ...vuePropsType },
  name: 'ConfigProviderProvider',
  setup(props, { slots }) {
    const ConfigContext = shallowRef<DragDropManager>(props.value as any);

    watch(
      () => props.value,
      () => {
        ConfigContext.value = props.value as any;
      },
      { deep: true }
    );
    provide('ConfigContext', ConfigContext);
    return () => (slots.default ? slots.default() : null);
  },
});



export const defaultManager = new DragDropManager();

export const DragDropContext = {
  Provider,
  Consumer
}
