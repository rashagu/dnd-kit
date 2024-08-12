import draggableIcon from '../../assets/draggableIcon.svg';
import {h} from 'vue';

export const DraggableIcon = () => (
  <img src={draggableIcon} width="140" alt="Draggable" draggable={false} />
);
