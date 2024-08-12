
import Prism from 'prismjs';
import Clipboard from 'clipboard';
import 'prismjs/components/prism-jsx.min';

import copy from './copy.svg';
import styles from './CodeHighlighter.module.css';
import {classNames, createRange} from '../../../../../utilities';
import {computed, defineComponent, Fragment, onMounted, onUnmounted, ref} from 'vue';


interface Props {
  children: string;
  language?: string;
}
export const CodeHighlighter = defineComponent({
  props: {
    children: String,
    language: String,
  },
  setup(props, context) {
    const nodeRef = ref<HTMLButtonElement>();
    const highlightedCode = computed(
      () =>
        syntaxReplacements(
          Prism.highlight(
            props.children.trim(),
            Prism.languages[props.language] ?? Prism.languages.txt,
            props.language
          )
        )
    );

    let clipboard: Clipboard
    onMounted(() => {
       clipboard = new Clipboard(nodeRef.value as Element);
    })

    onUnmounted(()=>{
      clipboard.destroy();
    })

    return ()=>{
      const lineCount = props.children.split('\n').length - 1;

      return (
        <div
          class={classNames(styles.CodeHighlighter, 'sb-unstyled', props.language)}
        >
      <pre>
        <div aria-hidden="true" class={styles.LineNumbers}>
          {lineCount > 1
            ? createRange(lineCount).map((line) => (
              <Fragment key={line}>
                {line + 1}
                <br />
              </Fragment>
            ))
            : null}
        </div>
        <code dangerouslySetInnerHTML={{__html: highlightedCode.value}} />
      </pre>
          <button
            class={styles.Copy}
            ref={nodeRef}
            data-clipboard-text={props.children}
          >
            <img src={copy} width="19" height="20" alt="Copy" />
          </button>
        </div>
      );
    }
  }
})

function syntaxReplacements(value: string) {
  const markup = (string, newAttribute = '') =>
    `<span class="token ${newAttribute}">${string}</span>`;
  const replacements = [
    ['const', 'token', 'const'],
    ['null', 'token', 'null'],
    ['function', 'token', 'function'],
    ['[(]', 'punctuation', 'parentheses opening', '('],
    ['[)]', 'punctuation', 'parentheses closing', ')'],
    ['{', 'punctuation', 'braces opening'],
    ['}', 'punctuation', 'braces closing'],
    [';', 'punctuation', 'semicolon'],
    ['=>', 'operator', 'arrow-function'],
  ];

  return replacements.reduce(
    (accumulator, [value, label, annotation, replacement]) =>
      accumulator.replace(
        new RegExp(markup(value, label), 'g'),
        markup(replacement ?? value, `${label} ${annotation}`)
      ),
    value
  );
}
