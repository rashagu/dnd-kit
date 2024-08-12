
import {Unstyled} from '@storybook/blocks';
import {Button, Dropzone, Code, Item} from '../stories/components';
import {FunctionalComponent} from 'vue';
import {h} from 'vue';
// Register web components
customElements.define('button-component', Button);
customElements.define('dropzone-component', Dropzone);
customElements.define('item-component', Item);

const DarkModeProvider:FunctionalComponent = ({}, {slots})=> {

  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const dark = params.get('dark');
    const hero = params.get('hero');

    if (dark === 'false') {
      document.body.classList.remove('dark');
    } else if (dark === 'true') {
      document.body.classList.add('dark');
    }

    if (hero === 'true') {
      document.body.classList.add('hero');
    }
  }

  return slots.default?.();
}

const preview = {
  decorators: [
    (Story) => {
      return (
        <DarkModeProvider>
          {Story()}
        </DarkModeProvider>
      );
    },
  ],
  parameters: {
    docs: {
      components: {
        pre: (props) => (
          <Unstyled>
            <pre {...props} />
          </Unstyled>
        ),
        code: Code,
      },
    },
    darkMode: {
      stylePreview: true,
    },
    options: {
      storySort: {
        order: [
          'Docs',
          'React',
          [
            'Draggable',
            'Droppable',
            'Sortable',
            ['Vertical list', 'Horizontal list', 'Grid'],
          ],
        ],
      },
    },
  },
};

export default preview;
