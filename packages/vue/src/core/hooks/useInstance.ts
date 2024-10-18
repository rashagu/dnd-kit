import type {DragDropManager} from '@dnd-kit/abstract';
import type {CleanupFunction} from '@dnd-kit/state';

import {useDragDropManager} from './useDragDropManager.ts';
import {defaultManager} from '../context/context.ts';
import {Ref, ref, ShallowRef, shallowRef} from 'vue';
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
  const instance = shallowRef<T>(initializer(manager.value === defaultManager ? undefined : manager.value));

  useEffect(() => {
    instance.value.manager = manager.value;

    // Register returns an unregister callback

    const unregister = instance.value.register();
    return unregister;
  }, [instance, manager]);

  return instance as ShallowRef<T>;
}
