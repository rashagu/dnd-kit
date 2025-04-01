import {shallowRef, watch} from 'vue';

export function useConstant<T = any>(initializer: () => T) {
  const ref = shallowRef<T | null>(null);


  watch(initializer, (v)=>{
    if (!ref.value) {
      ref.value = v;
    }
  }, {immediate: true});

  return ref;
}
