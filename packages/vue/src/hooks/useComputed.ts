import {computed, effect} from '@dnd-kit/state';
import {useSignal} from './useSignal.ts';
import {ShallowRef, shallowRef, watch, computed  as computedVue} from 'vue';

export function useComputed<T = any>(
  compute: () => T,
  dependencies: any[] = [],
  sync = () => false
) {
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


  return computedVue({
    // getter
    get() {
      return value.value
    },
    // setter
    set(newValue) {
      // 注意：我们这里使用的是解构赋值语法
    }
  });
}
