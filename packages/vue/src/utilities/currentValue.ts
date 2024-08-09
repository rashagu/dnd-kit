import type {ComputedRef, Ref, ShallowRef} from 'vue';
import {computed} from 'vue';

export type RefOrValue<T> =
  | T
  | Ref<T | null | undefined>
  | ShallowRef<T | null | undefined>
  | null
  | undefined;

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

    return value;
  })
}
