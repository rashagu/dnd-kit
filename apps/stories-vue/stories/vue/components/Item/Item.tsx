import {CSSProperties, h} from 'vue';


export interface Props {
  actions?: any;
  accentColor?: string;
  shadow?: boolean;
  transitionId?: string;
}
function Button(
  {actions, accentColor, shadow, style, transitionId, ...props}, {slots}
) {
  const Element = actions ? 'div' : 'button';

  return (
    <Element
      {...props}
      class={'Item'}
      style={
        {
          ...style,
          viewTransitionName: transitionId,
          '--accent-color': accentColor,
        } as CSSProperties
      }
      data-shadow={shadow}
      data-accent-color={accentColor}
    >
      {slots.default?.()}
      {actions}
    </Element>
  );
}
export const Item = Button;
