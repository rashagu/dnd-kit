
import {Unstyled} from '@storybook/blocks';

import {CodeHighlighter} from './components';
import styles from './Code.module.css';
import {defineComponent, h, ref} from 'vue';

interface Props {
  children: string | string[];
  tabs?: string[];
  className?: string;
}

export const Code = defineComponent({
  props:{
    children: [String, Array],
    tabs: Array,
    className: String
  },
  setup(props, context) {
    const selectedTab = ref(0);

    return ()=>{
      const contents = Array.isArray(props.children) ? props.children[selectedTab.value] : props.children;
      return Array.isArray(props.children) || props.children.includes('\n') ? (
        <Unstyled>
          <div class={styles.Code}>
            {props.tabs ? (
              <div class={styles.Tabs} role="tablist">
                {props.tabs.map((tab, index) => (
                  <button
                    key={tab}
                    className={styles.Tab}
                    role="tab"
                    aria-selected={index === selectedTab.value}
                    onClick={() => selectedTab.value = index}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            ) : null}
            <div className={styles.TabContent} role="tabpanel">
              <CodeHighlighter language={props.className?.replace('language-', '')} children={contents}>
              </CodeHighlighter>
            </div>
          </div>
        </Unstyled>
      ) : (
        <code className={styles.InlineCode}>{props.children}</code>
      );
    }
  }
})
