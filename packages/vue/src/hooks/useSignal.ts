import {effect, Signal} from '@dnd-kit/state';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {getCurrentInstance, nextTick, ShallowRef, shallowRef, toRaw} from 'vue';

/** Wrap the given value in a Signal if it isn't already one, and make changes trigger a re-render. */
export function useSignal<T = any>(signal: ShallowRef<Signal<T>>, sync = ()=>false) {

  let val = toRaw(signal.value)?.peek();
  const update = shallowRef(val);
  const currentInstance = getCurrentInstance()

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        let val = toRaw(signal.value)?.peek();
        if (val !== (val = toRaw(signal.value).value)) {
          if (sync()) {
            //TODO
            // flushSync(() => update.value = val);
            currentInstance?.proxy?.$forceUpdate()
            nextTick(() => update.value = val)
          } else {
            update.value = val;
            currentInstance?.proxy?.$forceUpdate()
          }
        }
      }),
    [()=>signal, sync]
  );
  return signal;
}
