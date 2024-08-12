
import styles from './Actions.module.css';
import {FunctionalComponent, h} from 'vue';

export const Actions:FunctionalComponent = (props, {slots})=>{
  return <div class={styles.Actions}>{slots.default?.()}</div>;
}

