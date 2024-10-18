// import {useCallback} from 'react';
import {batch, deepEqual} from '@dnd-kit/state';
import {type Data} from '@dnd-kit/abstract';
import {Sortable, defaultSortableTransition} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {useDragDropManager, useInstance} from '@kousum/dnd-kit-vue';
import {
  useComputed,
  useImmediateEffect as immediateEffect,
  useIsomorphicLayoutEffect,
  useOnValueChange,
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


  const manager = useDragDropManager();


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

  const isDropTarget = useComputed(() => sortable.value.isDropTarget);
  const isDragSource = useComputed(() => sortable.value.isDragSource);
  const status = useComputed(() => sortable.value.status);

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
      if (manager.value?.dragOperation.status.idle && transition?.idle) {
        sortable.value.refreshShape();
      }
    },
    immediateEffect
  );
  useOnValueChange(()=>handle.value, () => (sortable.value.handle = handle.value));
  useOnValueChange(()=>element.value, () => (sortable.value.element = element.value));
  useOnValueChange(()=>target.value, () => (sortable.value.target = target.value));
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
    isDragSource,
    isDropTarget,
    status,
    handleRef: (element: Element | null) => {
      sortable.value.handle = element ?? undefined;
    },
    ref: (element: Element | null) => {
      if (
        !element &&
        sortable.value.element?.isConnected &&
        !manager?.value.dragOperation.status.idle
      ) {
        return;
      }


      sortable.value.element = element ?? undefined;
    },
    sourceRef: (element: Element | null) => {
      if (
        !element &&
        sortable.value.element?.isConnected &&
        !manager?.value.dragOperation.status.idle
      ) {
        return;
      }

      sortable.value.source = element ?? undefined;
    },
    targetRef: (element: Element | null) => {
      if (
        !element &&
        sortable.value.element?.isConnected &&
        !manager?.value.dragOperation.status.idle
      ) {
        return;
      }

      sortable.value.target = element ?? undefined;
    },
  };
}
