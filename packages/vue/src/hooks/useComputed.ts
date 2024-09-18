import {computed} from '@dnd-kit/state';
import {useSignal} from './useSignal.ts';
import {shallowRef, watch} from 'vue';

export function useComputed<T = any>(
  compute: () => T,
  dependencies: any[] = [],
  sync = () => false
) {
  const $compute = shallowRef(compute);
  $compute.value = compute;
  const s = shallowRef(computed(() => $compute.value()))
  watch(dependencies, ()=>{
    s.value = computed(() => $compute.value())
  })

  return useSignal(
    s,
    sync
  );
}
