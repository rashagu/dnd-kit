

import sortableIcon from '../../assets/sortableIcon.svg';

export const SortableIcon = (props: any) => (
  <img
    src={sortableIcon}
    width="90"
    alt="Sortable"
    draggable={false}
    {...props}
  />
);
