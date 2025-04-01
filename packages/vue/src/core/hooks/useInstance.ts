import type {DragDropManager} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/state';
import {useIsomorphicLayoutEffect} from '@kousum/dnd-kit-vue/hooks';

import {useDragDropManager} from './useDragDropManager.ts';
import {Ref, ref, ShallowRef, shallowRef, watch} from 'vue';
import {useEffect} from '@kousum/dnd-kit-vue/hooks';

export interface Instance<
  T extends DragDropManager<any, any> = DragDropManager<any, any>,
> {
  manager: T | undefined;
  register(): CleanupFunction | void;
}

export function useInstance<T extends Instance>(
  initializer: (manager: DragDropManager<any, any> | undefined) => T
) {
  const manager = useDragDropManager() ?? undefined;
  // const instance = shallowRef<T>(initializer(manager.value === defaultManager ? undefined : manager.value));
  const instance = shallowRef<T>(initializer(manager.value));
  watch(manager, ()=>{
    if (instance.value.manager !== manager.value) {
      instance.value.manager = manager.value;
    }
  }, {immediate: true});

  useIsomorphicLayoutEffect(()=>{
    instance.value.register?.()
  }, [manager, instance]);


  return instance as ShallowRef<T>;
}
