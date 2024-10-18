import {DragDropEvents} from '@dnd-kit/abstract';
import type {DragDropManagerInput, Draggable, Droppable} from '@dnd-kit/dom';
import {defaultPreset, DragDropManager} from '@dnd-kit/dom';
import {useEffect, useOnValueChange} from '@kousum/dnd-kit-vue/hooks';

import {DragDropContext} from './context.ts';
import {useRenderer} from './renderer.ts';
import {defineComponent, h, PropType, shallowRef, useSlots} from 'vue';


export type Events = DragDropEvents<Draggable, Droppable, DragDropManager>;

export interface Props extends DragDropManagerInput {
  manager?: DragDropManager;
  onBeforeDragStart?: Events['beforedragstart'];
  onCollision?: Events['collision'];
  onDragStart?: Events['dragstart'];
  onDragMove?: Events['dragmove'];
  onDragOver?: Events['dragover'];
  onDragEnd?: Events['dragend'];
}



export const DragDropProvider = defineComponent({
  props: {
    onCollision: Function as PropType<Props['onCollision']>,
    onBeforeDragStart: Function as PropType<Props['onBeforeDragStart']>,
    onDragStart: Function as PropType<Props['onDragStart']>,
    onDragMove: Function as PropType<Props['onDragMove']>,
    onDragOver: Function as PropType<Props['onDragOver']>,
    onDragEnd: Function as PropType<Props['onDragEnd']>,
    plugins: Object as PropType<Props['plugins']>,
    modifiers: Object as PropType<Props['modifiers']>,
    sensors: Object as PropType<Props['sensors']>,
    manager: Object as PropType<Props['manager']>,
    renderer: Object as PropType<Props['manager']>,
    // actions: Object as PropType<any>,
    // collisionObserver: Object as PropType<any>,
    // dragOperation: Object as PropType<any>,
    // monitor: Object as PropType<any>,
    // registry: Object as PropType<any>,
  },
  name: 'Test',
  setup(props, {attrs}) {
    const slots = useSlots()

    const {renderer, trackRendering, onResolve} = useRenderer();
    const manager = shallowRef<DragDropManager | null>(
      props.manager ?? null
    );
    function setManager(v:DragDropManager){
      manager.value = v
    }


    useEffect(() => {
      const {
        onCollision,
        onBeforeDragStart,
        onDragStart,
        onDragMove,
        onDragOver,
        onDragEnd,
        ...input
      } = props
      const handleBeforeDragStart = props.onBeforeDragStart;
      const handleDragStart = props.onDragStart;
      const handleDragOver = props.onDragOver;
      const handleDragMove = props.onDragMove;
      const handleDragEnd = props.onDragEnd;
      const handleCollision = props.onCollision;

      const manager = props.manager ?? new DragDropManager(input as any);
      manager.renderer = renderer.value!;

      manager.monitor.addEventListener('beforedragstart', (event, manager) => {
        const callback = handleBeforeDragStart;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('dragstart', (event, manager) =>
        handleDragStart?.(event, manager)
      );
      manager.monitor.addEventListener('dragover', (event, manager) => {
        const callback = handleDragOver;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('dragmove', (event, manager) => {
        const callback = handleDragMove;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('dragend', (event, manager) => {
        const callback = handleDragEnd;

        if (callback) {
          trackRendering(() => callback(event, manager));
        }
      });
      manager.monitor.addEventListener('collision', (event, manager) =>
        handleCollision?.(event, manager)
      );

      setManager(manager);

      return manager.destroy;
    }, [renderer]);

    useOnValueChange(
      ()=>props.plugins,
      () => manager.value && (manager.value.plugins = props.plugins as any ?? defaultPreset.plugins)
    );
    useOnValueChange(
      ()=>props.sensors,
      () => manager.value && (manager.value.sensors = props.sensors as any ?? defaultPreset.sensors)
    );
    useOnValueChange(
      ()=>props.modifiers,
      () => manager.value && (manager.value.modifiers = props.modifiers as any ?? [])
    );




    return () => {
      return (
        <DragDropContext.Provider value={manager.value!}>
          {{
            default: ()=>slots.default?.()
          }}
        </DragDropContext.Provider>
      );
    }
  }
})


