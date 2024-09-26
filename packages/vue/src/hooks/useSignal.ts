import {effect, Signal} from '@dnd-kit/state';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {getCurrentInstance, nextTick, ShallowRef, shallowRef, toRaw} from 'vue';
import {useRef} from 'react';

/** Wrap the given value in a Signal if it isn't already one, and make changes trigger a re-render. */
export function useSignal<T = any>(signal: ShallowRef<Signal<T>>, sync = ()=>false) {

  let val = toRaw(signal.value)?.peek();
  const read = shallowRef(false);
  const update = shallowRef(val);
  const currentInstance = getCurrentInstance()

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        let val = toRaw(signal.value)?.peek();
        if (!read.value) return;

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
