import {computed, effect} from '@dnd-kit/state';
import {useSignal} from './useSignal.ts';
import {ShallowRef, shallowRef, watch} from 'vue';

export function useComputed<T = any>(
  compute: () => T,
  dependencies: any[] = [],
  sync = () => false
): ShallowRef<T> {
  const $compute = shallowRef(compute);
  $compute.value = compute;
  const watchValue = shallowRef(computed(() => $compute.value()))
  watch(dependencies, ()=>{
    watchValue.value = computed(() => $compute.value())
  })

  const value = useSignal(
    watchValue,
    sync
  )
  const effectValue = shallowRef(value.value?.value)
  effect(()=>{
    effectValue.value = value.value?.value
  })

  return effectValue;
}
