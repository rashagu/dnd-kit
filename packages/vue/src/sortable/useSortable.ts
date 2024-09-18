// import {useCallback} from 'react';
import {batch, deepEqual} from '@dnd-kit/state';
import {type Data} from '@dnd-kit/abstract';
import {Sortable, defaultSortableTransition} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {useDragDropManager, useInstance} from '@dnd-kit/vue';
import {
  useComputed,
  useImmediateEffect as immediateEffect,
  useIsomorphicLayoutEffect,
  useOnValueChange,
} from '@dnd-kit/vue/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/vue/utilities';

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
    id,
    data,
    index,
    group,
    disabled,
    feedback,
    sensors,
    transition = defaultSortableTransition,
    type,
  } = input;
  const manager = useDragDropManager();
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
        feedback,
      },
      manager
    );
  });

  const isDropTarget = useComputed(() => sortable.value.isDropTarget);
  const isDragSource = useComputed(() => sortable.value.isDragSource);
  const status = useComputed(() => sortable.value.status);

  useOnValueChange(()=>id, () => (sortable.value.id = id));

  useIsomorphicLayoutEffect(() => {
    batch(() => {
      sortable.value.group = group;
      sortable.value.index = index;
    });
  }, [()=>group, ()=>index]);

  useOnValueChange(()=>type, () => (sortable.value.type = type));
  useOnValueChange(
    ()=>accept,
    () => (sortable.value.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(()=>data, () => data && (sortable.value.data = data));
  useOnValueChange(
    ()=>index,
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
    get isDragSource() {
      return isDragSource.value;
    },
    get isDropTarget() {
      return isDropTarget.value;
    },
    get status() {
      return status.value;
    },
    handleRef: (element: Element | null) => {
      sortable.value.handle = element ?? undefined;
    },
    ref: (element: Element | null) => {
      sortable.value.element = element ?? undefined;
    },
    sourceRef: (element: Element | null) => {
      sortable.value.source = element ?? undefined;
    },
    targetRef: (element: Element | null) => {
      sortable.value.target = element ?? undefined;
    },
  };
}
