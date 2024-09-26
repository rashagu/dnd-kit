import {useComputed} from '@dnd-kit/vue/hooks';

import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();

  const source = useComputed(() => manager.value?.dragOperation.source);
  const target = useComputed(() => manager.value?.dragOperation.target);

  return {
    get source() {
      return source.value;
    },
    get target() {
      return target.value;
    },
  };
}
