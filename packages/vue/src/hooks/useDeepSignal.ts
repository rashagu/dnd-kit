
import {effect, untracked} from '@dnd-kit/state';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {useForceUpdate} from './useForceUpdate.ts';
import {ShallowRef, shallowRef, watch} from 'vue';
import { RefSymbol } from '@vue/reactivity';

function flushSync(fn: () => void) {
  fn()
}
/** Trigger a re-render when reading signal properties of an object. */
export function useDeepSignal<T>(
  target: ShallowRef<T>,
  synchronous?: (property: keyof T, oldValue: any, newValue: any) => boolean
): ShallowRef<T> {
  const tracked = shallowRef(new Map<string | symbol, any>());
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(() => {
    if (!target.value) {
      tracked.value.clear();
      return;
    }

    return effect(() => {
      let stale = false;
      let sync = false;

      for (const entry of tracked.value) {
        const [key] = entry;
        const value = untracked(() => entry[1]);
        const latestValue = (target.value as any)[key];

        if (value !== latestValue) {
          stale = true;
          tracked.value.set(key, latestValue);
          sync = synchronous?.(key as keyof T, value, latestValue) ?? false;
        }
      }

      if (stale) {
        sync ? flushSync(forceUpdate) : forceUpdate();
      }
    });
  }, [target]);

  const ret = shallowRef(getRet())
  function getRet(){
    return target.value
      ? new Proxy(target.value, {
        get(target, key) {
          const value = (target as any)[key];

          tracked.value.set(key, value);

          return value;
        },
      })
      : target.value
  }
  watch(()=>target.value, ()=>{
    ret.value = getRet()
  })
  return ret as ShallowRef<T>;
}
