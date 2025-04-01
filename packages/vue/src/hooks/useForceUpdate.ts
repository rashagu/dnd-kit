import {ref} from 'vue';


export function useForceUpdate() {
  const state = ref(0);

  return () => {
    state.value++
  };
}
