import type {VNode, CSSProperties, ShallowRef} from 'vue';
import {shallowRef, watch, createVNode, defineComponent} from 'vue';
import {useComputed, useDeepSignal} from '@kousum/dnd-kit-vue/hooks';
import {Draggable, Feedback} from '@dnd-kit/dom';

import {useDragDropManager} from '../hooks/useDragDropManager.ts';
import {DragDropContext} from '../context/context.ts';

export interface Props {
  className?: string;
  children: VNode | ((source: Draggable) => VNode);
  style?: CSSProperties;
  tag?: string;
}

function DragOverlay_({children, className, style, tag}: Props) {
}
const DragOverlay = defineComponent({
  props: {
    className: String,
    style: Object,
    tag: String,
  },
  name: 'DragOverlay',
  setup(props, { slots }) {

    const ref = shallowRef<HTMLDivElement | null>(null);
    const manager = useDragDropManager();
    const source = useComputed(
      () => manager.value?.dragOperation.source,
      [manager]
    );

    watch([manager], () => {
      if (!ref.value || !manager.value) return;

      const feedback = manager.value.plugins.find(
        (plugin) => plugin instanceof Feedback
      );

      if (!feedback) return;

      feedback.overlay = ref.value;

      return () => {
        feedback.overlay = undefined;
      };
    }, {immediate: true} );

    // Prevent children of the overlay from registering themselves as draggables or droppables

    function getPatchedManager(){

      if (!manager.value) return null;

      const patchedRegistry = new Proxy(manager.value.registry, {
        get(target, property) {
          if (property === 'register' || property === 'unregister') {
            return noop;
          }

          return target[property as keyof typeof target];
        },
      });

      return new Proxy(manager.value, {
        get(target, property) {
          if (property === 'registry') {
            return patchedRegistry;
          }

          return target[property as keyof typeof target];
        },
      });
    }
    const patchedManager = shallowRef(getPatchedManager());
    watch(manager, ()=>{
      patchedManager.value = getPatchedManager()
    })

    function renderChildren() {
      if (!source.value) return null;
      if (slots.default) {
        return <Children source={source} children={slots.default as any}></Children>;
      }

      return null
    }
    return ()=>{
      const {className, style, tag} = props

      return (
        <DragDropContext.Provider value={patchedManager.value!}>
          {createVNode(
            tag || 'div',
            {ref, className, style, 'data-dnd-overlay': true},

            renderChildren()
          )}
        </DragDropContext.Provider>
      )
    };

  }
})
export {DragOverlay}
function noop() {
  return () => {};
}

function Children({
  children,
  source,
}: {
  children: (source: Draggable) => VNode;
  source: ShallowRef<Draggable>;
}) {
  return children(useDeepSignal(source).value as Draggable);
}
