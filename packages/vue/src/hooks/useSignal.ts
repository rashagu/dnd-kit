
import {effect, signal, Signal} from '@dnd-kit/state';

import {useConstant} from './useConstant.ts';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {getCurrentInstance, nextTick, ref, ShallowRef, shallowRef, unref} from 'vue';

/** Wrap the given value in a Signal if it isn't already one, and make changes trigger a re-render. */
export function useSignal<T = any>(signalOrValue: ShallowRef<T>, sync = ()=>false) {
  const sig = useConstant(() =>
    signalOrValue.value instanceof Signal ? signalOrValue.value : signal(signalOrValue.value)
  );
  let val = sig.value?.peek();
  const update = shallowRef(val);
  const currentInstance = getCurrentInstance()

  useIsomorphicLayoutEffect(
    () =>
      effect(() => {
        let val = unref(sig)?.peek();
        if (val !== (val = unref(sig)?.value)) {
          if (sync()) {
            //TODO
            // flushSync(() => update.value = val);
            currentInstance?.proxy?.$forceUpdate()
            nextTick(() => update.value = val)
          } else {
            update.value = val;
          }
        }
      }),
    [sync]
  );
  return sig;
}
