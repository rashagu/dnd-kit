import React from 'react';
import {DragDropProvider} from '@dnd-kit/vue';

import {Draggable} from './Draggable';

export function Example() {
  return (
    <DragDropProvider>
      <Draggable id="draggable" />
    </DragDropProvider>
  );
}
