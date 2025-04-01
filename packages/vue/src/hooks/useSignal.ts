import {effect, Signal} from '@dnd-kit/state';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {getCurrentInstance, nextTick, ShallowRef, shallowRef, toRaw} from 'vue';
import {useForceUpdate} from './useForceUpdate.ts';
function flushSync(fn: () => void) {
  fn()
}
/** Trigger a re-render when reading a signal. */
export function useSignal<T = any>(signal: ShallowRef<Signal<T>>, sync = ()=>false) {
  const previous = shallowRef(toRaw(signal.value)?.peek());
  const read = shallowRef(false);
  const forceUpdate = useForceUpdate();

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        const previousValue = previous.value;
        const currentValue = signal.value;

        if (previousValue !== currentValue) {
          previous.value = currentValue;

          if (!read.value) return;

          if (sync()) {
            flushSync(forceUpdate);
          } else {
            forceUpdate();
          }
        }
      }),
    [signal, sync, forceUpdate]
  );

  const effectValue = shallowRef(signal.value?.value)
  effect(()=>{
    effectValue.value = signal.value?.value
  })
  return {
    get value() {
      read.value = true;

      return effectValue.value;
    },
  };
}
