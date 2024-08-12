

import styles from './Actions.module.css';
import {h} from 'vue';

export function Actions(props) {
  return <div className={styles.Actions}>{props.children}</div>;
}
