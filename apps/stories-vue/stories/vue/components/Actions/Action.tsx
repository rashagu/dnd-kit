

import {classNames} from '../../../utilities';
import styles from './Actions.module.css';
import {CSSProperties, h} from 'vue';

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: 'light' | 'dark' | 'destructive';
  cursor?: CSSProperties['cursor'];
}

export const Action = ({className, cursor, style, variant = 'light', ...props}, {slots}) => {
  return (
    <button
      {...props}
      class={classNames(styles.Action, styles[variant], className)}
      style={
        {
          ...style,
          cursor,
        } as CSSProperties
      }
    >
      {slots.default?.()}
    </button>
  );
};
