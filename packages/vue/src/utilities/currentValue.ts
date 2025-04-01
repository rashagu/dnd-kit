import type {ComputedRef, ShallowRef} from 'vue';
import {computed} from 'vue';

export type Ref<T> = ShallowRef<T | null | undefined>;

export type RefOrValue<T> = T | Ref<T> | null | undefined | (() => T | undefined);

export function currentValue<T>(
  value: RefOrValue<T>
): ComputedRef<NonNullable<T> | undefined> {
  return computed(()=>{
    if (value == null) {
      return undefined;
    }

    if (typeof value === 'object' && 'value' in value) {
      return value.value ?? undefined;
    }
    if (typeof value === 'function') {
      //@ts-ignore
      return value?.()
    }

    return value;
  })
}
