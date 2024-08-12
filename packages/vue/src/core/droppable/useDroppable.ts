// import {useCallback} from 'react';
import type {Data} from '@dnd-kit/abstract';
import {Droppable} from '@dnd-kit/dom';
import {deepEqual, effect} from '@dnd-kit/state';
import type {DroppableInput} from '@dnd-kit/dom';
import {useComputed, useOnValueChange} from '@dnd-kit/vue/hooks';
import {currentValue, type RefOrValue} from '@dnd-kit/vue/utilities';

import {useInstance} from '../hooks/useInstance.ts';
import {ref, shallowRef, unref} from 'vue';

export interface UseDroppableInput<T extends Data = Data>
  extends Omit<DroppableInput<T>, 'element'> {
  element?: RefOrValue<Element>;
}

export function useDroppable<T extends Data = Data>(
  input: UseDroppableInput<T>
) {
  const {collisionDetector, data, disabled, id, accept, type} = input;
  const element = currentValue(input.element);
  const droppable = useInstance(
    (manager) =>
      new Droppable(
        {
          ...input,
          element: element.value,
        },
        manager
      )
  );
  const isDropTarget = useComputed(() => droppable.value.isDropTarget);

  useOnValueChange(()=>id, () => (droppable.value.id = id));
  useOnValueChange(()=>accept, () => (droppable.value.id = id), undefined, deepEqual);
  useOnValueChange(()=>collisionDetector, () => (droppable.value.id = id));
  useOnValueChange(()=>data, () => data && (droppable.value.data = data));
  useOnValueChange(()=>disabled, () => (droppable.value.disabled = disabled === true));
  useOnValueChange(()=>element.value, () => (droppable.value.element = element.value));
  useOnValueChange(()=>type, () => (droppable.value.id = id));

  const isDropTarget_ = shallowRef<boolean>(isDropTarget.value?.value)
  effect(()=>{
    isDropTarget_.value = isDropTarget.value?.value
  })
  return {
    isDropTarget: isDropTarget_,
    ref: (element: Element | null) => {
      droppable.value.element = element ?? undefined;
    },
    droppable,
  };
}
