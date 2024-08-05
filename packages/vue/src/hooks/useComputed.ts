import {computed, Signal} from '@dnd-kit/state';

import {useConstant} from './useConstant.ts';
import {useSignal} from './useSignal.ts';
import {Ref} from 'vue';

export function useComputed<T = any>(compute: () => T, sync = ()=>false) {
  return useSignal(
    useConstant(() => computed(compute)),
    sync
  );
}
