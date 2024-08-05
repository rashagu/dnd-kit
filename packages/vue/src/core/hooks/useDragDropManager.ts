// import {useContext} from 'react';

import {defaultManager, DragDropContext} from '../context/context.ts';
import {inject, Ref, ref, ShallowRef, shallowRef} from 'vue';
import {DragDropManager} from '@dnd-kit/dom';

export function useDragDropManager(){
  return inject('ConfigContext', shallowRef<DragDropManager>(defaultManager)) as ShallowRef<DragDropManager>;
}
