
import {classNames} from '../../../utilities';

import styles from './Container.module.css';
import {CSSProperties, h} from 'vue';

export interface Props {
  children: any;
  actions?: any;
  columns?: number;
  label?: string;
  scrollable?: boolean;
  shadow?: boolean;
  style?: CSSProperties;
  transitionId?: string;
}

export const Container = (
  {
    actions,
    columns = 1,
    label,
    style,
    scrollable,
    shadow,
    transitionId,
    ...props
  }: Props,
  {slots}
) => {
  return (
    <div
      {...props}
      style={
        {
          ...style,
          viewTransitionName: transitionId,
          '--columns': columns,
        } as CSSProperties
      }
      class={classNames(
        styles.Container,
        scrollable && styles.scrollable,
        shadow && styles.shadow
      )}
    >
      {label ? (
        <div class={styles.Header}>
          {label}
          {actions}
        </div>
      ) : null}
      <ul id={label}>{slots.default?.()}</ul>
    </div>
  );
};
