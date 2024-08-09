import {useEffect} from './useIsomorphicLayoutEffect.ts';
import {shallowRef, unref} from 'vue';


export function useOnValueChange<T>(
  value: T,
  onChange: (value: T, oldValue: T) => void,
  effect = useEffect,
  compare = Object.is,
  sources: any[] = []
) {
  const tracked = shallowRef<T>(value);

  effect(() => {
    const oldValue = unref(tracked);

    if (!compare(value, oldValue)) {
      tracked.value = value;
      onChange(value, oldValue);
    }
  }, [()=>onChange, ()=>value]);
}
