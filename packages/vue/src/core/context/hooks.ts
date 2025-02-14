
import {useComputed} from '@kousum/dnd-kit-vue/hooks';
import {useDragDropManager} from '../hooks/useDragDropManager.ts';



export function useDragOperation() {
  const manager = useDragDropManager();

  const source = useComputed(() => manager.value?.dragOperation.source);
  const target = useComputed(() => manager.value?.dragOperation.target);

  return {
    source,
    target,
  };
}
