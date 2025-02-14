import {useCallback} from 'react';
import {batch, deepEqual} from '@dnd-kit/state';
import {type Data} from '@dnd-kit/abstract';
import {Sortable, defaultSortableTransition} from '@dnd-kit/dom/sortable';
import type {SortableInput} from '@dnd-kit/dom/sortable';
import {useDragDropManager, useInstance} from '@dnd-kit/react';
import {
  useComputed,
  useImmediateEffect as immediateEffect,
  useIsomorphicLayoutEffect,
  useOnValueChange,
} from '@dnd-kit/react/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/react/utilities';

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
        handle,
        element,
        target,
        feedback,
      },
      manager
    );
  });

  const isDropTarget = useComputed(() => sortable.isDropTarget);
  const isDragSource = useComputed(() => sortable.isDragSource);
  const status = useComputed(() => sortable.status);

  useOnValueChange(id, () => (sortable.id = id));

  useIsomorphicLayoutEffect(() => {
    batch(() => {
      sortable.group = group;
      sortable.index = index;
    });
  }, [group, index]);

  useOnValueChange(type, () => (sortable.type = type));
  useOnValueChange(
    accept,
    () => (sortable.accept = accept),
    undefined,
    deepEqual
  );
  useOnValueChange(data, () => data && (sortable.data = data));
  useOnValueChange(
    index,
    () => {
      if (manager?.dragOperation.status.idle && transition?.idle) {
        sortable.refreshShape();
      }
    },
    immediateEffect
  );
  useOnValueChange(handle, () => (sortable.handle = handle));
  useOnValueChange(element, () => (sortable.element = element));
  useOnValueChange(target, () => (sortable.target = target));
  useOnValueChange(disabled, () => (sortable.disabled = disabled === true));
  useOnValueChange(sensors, () => (sortable.sensors = sensors));
  useOnValueChange(
    collisionDetector,
    () => (sortable.collisionDetector = collisionDetector)
  );
  useOnValueChange(
    collisionPriority,
    () => (sortable.collisionPriority = collisionPriority)
  );
  useOnValueChange(feedback, () => (sortable.feedback = feedback ?? 'default'));
  useOnValueChange(transition, () => (sortable.transition = transition));

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
    handleRef: useCallback(
      (element: Element | null) => {
        sortable.handle = element ?? undefined;
      },
      [sortable]
    ),
    ref: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          sortable.element?.isConnected &&
          !manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.element = element ?? undefined;
      },
      [sortable]
    ),
    sourceRef: useCallback(
      (element: Element | null) => {
        const {manager} = sortable;

        if (
          !element &&
          sortable.source?.isConnected &&
          !manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.source = element ?? undefined;
      },
      [sortable]
    ),
    targetRef: useCallback(
      (element: Element | null) => {
        if (
          !element &&
          sortable.target?.isConnected &&
          !manager?.dragOperation.status.idle
        ) {
          return;
        }

        sortable.target = element ?? undefined;
      },
      [sortable]
    ),
  };
}
