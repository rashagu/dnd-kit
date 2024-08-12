import React from 'react';
import {useDraggable} from '@dnd-kit/vue';

export function Draggable({id}) {
  const {ref} = useDraggable({
    id,
  });

  return (
    <button ref={ref}>
      Draggable
    </button>
  );
}
