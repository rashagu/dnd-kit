

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {shallowRef} from 'vue';

export function useLatest<T>(value: T) {
  const valueRef = shallowRef<T | undefined>(value);

  useIsomorphicLayoutEffect(() => {
    valueRef.value = value;
  }, [value]);

  return valueRef;
}
