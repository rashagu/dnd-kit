

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {ShallowRef, shallowRef} from 'vue';

export function useLatest<T>(value: T) {
  const valueRef = shallowRef<T | undefined>(value);

  useIsomorphicLayoutEffect(() => {
    valueRef.value = value;
  }, [value]);

  return valueRef as ShallowRef<T | undefined>;
}
