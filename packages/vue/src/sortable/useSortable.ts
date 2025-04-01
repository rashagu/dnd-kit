// import {useCallback} from 'react';
import {batch, deepEqual} from '@dnd-kit/state';
import {type Data} from '@dnd-kit/abstract';
import {Sortable, defaultSortableTransition} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {useInstance} from '@kousum/dnd-kit-vue';
import {
  useImmediateEffect as immediateEffect,
  useIsomorphicLayoutEffect,
  useOnValueChange,
  useOnElementChange,
  useDeepSignal, useComputed,
} from '@kousum/dnd-kit-vue/hooks';
import {currentValue, type RefOrValue} from '@kousum/dnd-kit-vue/utilities';

export interface UseSortableInput<T extends Data = Data>
  extends Omit<SortableInput<T>, 'handle' | 'element' | 'target'> {
  handle?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
  target?: RefOrValue<Element>;
}

export function useSortable<T extends Data = Data>(input: UseSortableInput<T>) {
  const {
    accept,
    collisionDetector,
    collisionPriority,
    data,
    disabled,
    feedback,
    sensors,
    transition = defaultSortableTransition,
    type,
  } = input;



  const id = currentValue(input.id);
  const group = currentValue(input.group);
  const index = currentValue(input.index);
  const handle = currentValue(input.handle);
  const element = currentValue(input.element);
  const target = currentValue(input.target);
  const sortable = useInstance((manager) => {
    return new Sortable(
      {
        ...input,
        register: false,
        handle: handle.value,
        element: element.value,
        target: target.value,
        index: index.value!,
        group: group.value!,
        id: id.value!,
        feedback,
      },
      manager
    );
  });

  const trackedSortable = useDeepSignal(sortable, shouldUpdateSynchronously);
  const isDragSource = useComputed(() => sortable.value.isDragSource);
  const isDragging = useComputed(() => sortable.value.isDragging);
  const isDropping = useComputed(() => sortable.value.isDropping);
  const isDropTarget = useComputed(() => sortable.value.isDropTarget);

  useOnValueChange(()=>id.value, () => (sortable.value.id = id.value!));

  useIsomorphicLayoutEffect(() => {
    batch(() => {
      sortable.value.group = group.value;
      sortable.value.index = index.value!;
    });
  }, [()=>group.value, ()=>index.value]);

  useOnValueChange(()=>type, () => (sortable.value.type = type));
  useOnValueChange(
    ()=>accept,
    () => (sortable.value.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(()=>data, () => data && (sortable.value.data = data));
  useOnValueChange(
    ()=>index.value,
    () => {
      if (sortable.value.manager?.dragOperation.status.idle && transition?.idle) {
        sortable.value.refreshShape();
      }
    },
    immediateEffect
  );
  useOnElementChange(()=>handle.value, () => (sortable.value.handle = handle.value));
  useOnElementChange(()=>element.value, () => (sortable.value.element = element.value));
  useOnElementChange(()=>target.value, () => (sortable.value.target = target.value));
  useOnValueChange(()=>disabled, () => (sortable.value.disabled = disabled === true));
  useOnValueChange(()=>sensors, () => (sortable.value.sensors = sensors));
  useOnValueChange(
    ()=>collisionDetector,
    () => (sortable.value.collisionDetector = collisionDetector)
  );
  useOnValueChange(
    ()=>collisionPriority,
    () => (sortable.value.collisionPriority = collisionPriority)
  );
  useOnValueChange(()=>feedback, () => (sortable.value.feedback = feedback ?? 'default'));
  useOnValueChange(()=>transition, () => (sortable.value.transition = transition));

  return {
    sortable: trackedSortable,
    isDragSource,
    isDragging,
    isDropping,
    isDropTarget,
    // get isDragging() {
    //   return trackedSortable.value.isDragging;
    // },
    // get isDropping() {
    //   return trackedSortable.value.isDropping;
    // },
    // get isDragSource() {
    //   return trackedSortable.value.isDragSource;
    // },
    // get isDropTarget() {
    //   return trackedSortable.value.isDropTarget;
    // },
    // isDragSource,
    // isDropTarget,
    // status,
    handleRef: (element: Element | null) => {
      sortable.value.handle = element ?? undefined;
    },
    ref: (element: Element | null) => {
      if (
        !element &&
        sortable.value.element?.isConnected &&
        !sortable.value.manager?.dragOperation.status.idle
      ) {
        return;
      }


      sortable.value.element = element ?? undefined;
    },
    sourceRef: (element: Element | null) => {
      if (
        !element &&
        sortable.value.element?.isConnected &&
        !sortable.value.manager?.dragOperation.status.idle
      ) {
        return;
      }

      sortable.value.source = element ?? undefined;
    },
    targetRef: (element: Element | null) => {
      if (
        !element &&
        sortable.value.element?.isConnected &&
        !sortable.value.manager?.dragOperation.status.idle
      ) {
        return;
      }

      sortable.value.target = element ?? undefined;
    },
  };
}

function shouldUpdateSynchronously(key: string, oldValue: any, newValue: any) {
  // Update synchronously after drop animation
  if (key === 'isDragSource' && !newValue && oldValue) return true;

  return false;
}
