import {useEffect} from './useIsomorphicLayoutEffect.ts';
import {shallowRef, unref} from 'vue';


export function useOnValueChange<T>(
  valueFn: ()=>T,
  onChange: (value: T, oldValue: T) => void,
  effect = useEffect,
  compare = Object.is,
  sources: any[] = []
) {
  const tracked = shallowRef<T>(valueFn());

  effect(() => {
    const value = valueFn()
    const oldValue = unref(tracked);

    if (!compare(value, oldValue)) {
      tracked.value = value;
      onChange(value, oldValue);
    }
  }, [()=>onChange, valueFn]);
}
