// import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {deepEqual} from '@dnd-kit/state';
import {Draggable} from '@dnd-kit/dom';
import type {DraggableInput} from '@dnd-kit/dom';
import {useComputed, useOnValueChange} from '@dnd-kit/vue/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/vue/utilities';

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
  const status = useComputed(() => draggable.value.status);

  useOnValueChange(()=>id, () => (draggable.value.id = id));
  useOnValueChange(()=>handle.value, () => (draggable.value.handle = handle.value));
  useOnValueChange(()=>element.value, () => (draggable.value.element = element.value));
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

  return {
    draggable,
    isDragSource,
    status,
    handleRef: (element: Element | null) => {
      draggable.value.handle = element ?? undefined;
    },
    ref: (element: Element | null) => {
      draggable.value.element = element ?? undefined;
    },
  };
}
