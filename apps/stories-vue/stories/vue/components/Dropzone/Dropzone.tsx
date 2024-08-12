import {h} from 'vue';

interface Props {
  children: any;
  highlight?: boolean;
}

export function Dropzone(
  {highlight},
  {slots},
) {
  return h(
    'dropzone-component',
    {'data-highlight': highlight, 'data-dropped': slots.default != null},
    slots.default?.(),
  );
}
