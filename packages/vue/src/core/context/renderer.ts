import {nextTick, ref, shallowRef} from 'vue';
import type {Renderer} from '@dnd-kit/abstract';
import {useConstant} from '@dnd-kit/vue/hooks';

export function useRenderer() {

  const rendering = shallowRef<Promise<void>>();
  const transitionCount = ref(0);
  const resolver = shallowRef<() => void>();
  const renderer = useConstant<Renderer>(() => ({
    get rendering() {
      return rendering.value ?? Promise.resolve();
    },
  }));

  function onResolve(){
    resolver.value?.();
    rendering.value = undefined;
  }



  return {
    onResolve,
    renderer,
    trackRendering(callback: () => void) {
      if (!rendering.value) {
        rendering.value = new Promise<void>((resolve) => {
          resolver.value = resolve;
        });
      }
      callback();
      onResolve()

    },
  };
}
