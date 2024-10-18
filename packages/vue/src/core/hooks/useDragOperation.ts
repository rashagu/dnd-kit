import {useComputed} from '@kousum/dnd-kit-vue/hooks';

import {useDragDropManager} from './useDragDropManager.ts';

export function useDragOperation() {
  const manager = useDragDropManager();

  const source = useComputed(() => manager.value?.dragOperation.source, [manager]);
  const target = useComputed(() => manager.value?.dragOperation.target, [manager]);

  return {
    source,
    target,
  };
}
