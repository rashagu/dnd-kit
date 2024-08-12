import {h} from 'vue';
// import {type StoryFn} from '@storybook/vue3';

// import {classNames} from '../../../utilities';
// import {Code} from '../Code';
// import styles from './Preview.module.css';
// import {Story, Unstyled} from '@storybook/blocks';

interface Props {
  // of?: StoryFn;
  code?: string;
  id?: string;
  hero?: boolean;
  tabs?: string[];
  children?: any;
}

export function Preview({code, of, hero, id, tabs}: Props, dep) {
  return (<div></div>)
  // return (
  //   <Unstyled>
  //     <div
  //       class={classNames(
  //         styles.Preview,
  //         hero && styles.hero,
  //         hero && 'hero'
  //       )}
  //       id={id}
  //     >
  //       {dep?.slots?.default?.() ?? <Story of={of} />}
  //     </div>
  //     {code ? (
  //       <div class={styles.Code}>
  //         <Code tabs={tabs} children={code}></Code>
  //       </div>
  //     ) : null}
  //   </Unstyled>
  // );
}
