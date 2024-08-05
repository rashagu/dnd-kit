import {PropType} from 'vue';

export {currentValue, type RefOrValue} from './currentValue.ts';
// 约束vuePropsType
export type IsOptional<T, K extends keyof T> = {} extends Pick<T, K> ? true : false;
export type CombineProps<T> = {
  [K in keyof Required<T>]: IsOptional<T, K> extends true ?({
    type: PropType<T[K]>;
    default?: any;
    required?: false;
  } | PropType<T[K]>):({
    type: PropType<T[K]>;
    default?: any;
    required: true;
  })
}
