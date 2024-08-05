import type {Ref, ShallowRef} from 'vue';

export type RefOrValue<T> =
  | T
  | Ref<T | null | undefined>
  | ShallowRef<T | null | undefined>
  | null
  | undefined;

export function currentValue<T>(
  value: RefOrValue<T>
): NonNullable<T> | undefined {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'object' && 'value' in value) {
    return value.value ?? undefined;
  }

  return value;
}
