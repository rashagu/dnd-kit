
import styles from './Grid.module.css';
import {CSSProperties, h} from 'vue';

export interface Props{
  size: number;
}

export function Grid({size}: Props, {slots}) {
  return (
    <div
      class={styles.Grid}
      style={
        {
          '--grid-size': `${size}px`,
        } as CSSProperties
      }
    >
      {slots.default?.()}
    </div>
  );
}
