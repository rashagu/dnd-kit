import {Fragment, h} from 'vue';


export function Button({actions, shadow, ...props}, {slots}) {
  return h(
    'button-component',
    {
      'data-shadow': shadow,
      ...props,
    },
    <Fragment>
      {slots.default?.()}
      {actions}
    </Fragment>
  );
}

