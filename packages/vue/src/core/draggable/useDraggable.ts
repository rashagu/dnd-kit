// import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {deepEqual} from '@dnd-kit/state';
import {Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';
import {
  useComputed,
  useOnValueChange,
  useOnElementChange,
  useDeepSignal,
} from '@kousum/dnd-kit-vue/hooks';
import {currentValue, type RefOrValue} from '@kousum/dnd-kit-vue/utilities';

import {useInstance} from '../hooks/useInstance.ts';

export interface UseDraggableInput<T extends Data = Data>
  extends Omit<DraggableInput<T>, 'handle' | 'element'> {
  handle?: RefOrValue<Element>;
  element?: RefOrValue<Element>;
}

export function useDraggable<T extends Data = Data>(
  input: UseDraggableInput<T>
) {
  const {disabled, data, id, modifiers, sensors} = input;

  const handle = currentValue(input.handle);
  const element = currentValue(input.element);

  const draggable = useInstance(
    (manager) =>
      new Draggable(
        {
          ...input,
          handle: handle.value,
          element: element.value,
        },
        manager
      )
  );
  const isDragSource = useComputed(() => draggable.value.isDragSource);
  const isDragging = useComputed(() => draggable.value.isDragging);
  const isDropping = useComputed(() => draggable.value.isDropping);

  // const status = useComputed(() => draggable.value.status);
  const trackedDraggable = useDeepSignal(draggable, shouldUpdateSynchronously);


  useOnValueChange(()=>id, () => (draggable.value.id = id));
  useOnElementChange(()=>handle.value, () => (draggable.value.handle = handle.value));
  useOnElementChange(()=>element.value, () => (draggable.value.element = element.value));
  useOnValueChange(()=>data, () => data && (draggable.value.data = data));
  useOnValueChange(()=>disabled, () => (draggable.value.disabled = disabled === true));
  useOnValueChange(()=>sensors, () => (draggable.value.sensors = sensors));
  useOnValueChange(
    ()=>modifiers,
    () => (draggable.value.modifiers = modifiers),
    undefined,
    deepEqual
  );
  useOnValueChange(
    ()=>input.feedback,
    () => (draggable.value.feedback = input.feedback ?? 'default')
  );
  useOnValueChange(
    ()=>input.alignment,
    () => (draggable.value.alignment = input.alignment)
  );
  return {
    draggable: trackedDraggable,
    // get isDragging() {
    //   return trackedDraggable.value.isDragging;
    // },
    // get isDropping() {
    //   return trackedDraggable.value.isDropping;
    // },
    // get isDragSource() {
    //   return trackedDraggable.value.isDragSource;
    // },
    // draggable,
    isDropping,
    isDragging,
    isDragSource,
    // status,
    handleRef: (element: Element | null) => {
      draggable.value.handle = element ?? undefined;
    },
    ref: (element: Element | null) => {
      if (
        !element &&
        draggable.value.element?.isConnected &&
        !draggable.value.manager?.dragOperation.status.idle
      ) {
        return;
      }


      draggable.value.element = element ?? undefined;
    },
  };
}

function shouldUpdateSynchronously(key: string, oldValue: any, newValue: any) {
  // Update synchronously after drop animation
  if (key === 'isDragSource' && !newValue && oldValue) return true;

  return false;
}
