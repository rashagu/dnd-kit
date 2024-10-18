import React from 'react';
import {useDraggable} from '@kousum/dnd-kit-vue';

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
