
import {RestrictToWindow} from '@dnd-kit/dom/modifiers';
import {SnapModifier} from '@dnd-kit/abstract/modifiers';
import {DragDropProvider} from '@kousum/dnd-kit-vue';

import {Grid} from '../../components/index.ts';
import {Draggable} from '../DraggableExample.tsx';
import {defineComponent, ref, h} from 'vue';

export const SnapToGridExample = defineComponent({
  setup(props, { slots }) {
    const gridSize = ref(30);
    const position = ref({x: gridSize, y: gridSize});

    return ()=>{
      return (
        <DragDropProvider
          onDragEnd={(event) => {
            position.value = {
              x: position.value.x + event.operation.transform.x,
              y: position.value.y + event.operation.transform.y,
            }
          }}
        >
          <Grid size={gridSize.value}>
            <Draggable
              id="draggable"
              modifiers={[
                SnapModifier.configure({size: gridSize.value}),
                RestrictToWindow,
              ]}
              style={{translate: `${position.value.x}px ${position.value.y}px`}}
            />
          </Grid>
          <label
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              padding: 15,
              background: 'rgba(255, 255, 255, 0.5)',
            }}
          >
            Grid size
            <br />
            <input
              type="range"
              min="10"
              max="60"
              onInput={(e) => {
                const gridSize_ = parseInt(e.target.value, 10);
                gridSize.value = gridSize_
                position.value = {
                  x: gridSize_,
                  y: gridSize_,
                }
              }}
            />
          </label>
        </DragDropProvider>
      );
    }
  }
})

