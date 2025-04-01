
import {currentValue, type RefOrValue} from '@kousum/dnd-kit-vue/utilities';

import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect.ts';
import {shallowRef} from 'vue';

export function useOnElementChange(
  value: RefOrValue<Element>,
  onChange: (value: Element | undefined) => void
) {
  const previous = shallowRef(currentValue(value).value);

  useIsomorphicLayoutEffect(() => {
    const current = currentValue(value);

    if (current.value !== previous.value) {
      previous.value = current.value;
      onChange(current.value);
    }
  }, []);
}
