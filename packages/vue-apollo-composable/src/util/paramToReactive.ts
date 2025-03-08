import type { Ref } from 'vue-demi'
import type { ReactiveFunction } from './ReactiveFunction'
import { computed, isRef, reactive } from 'vue-demi'

type TObject = object

export function paramToReactive<T extends TObject>(param: T | Ref<T> | ReactiveFunction<T>): T | Ref<T> {
  if (isRef(param)) {
    return param
  }
  else if (typeof param === 'function') {
    return computed(param as ReactiveFunction<T>)
  }
  else if (param) {
    return reactive(param) as T
  }
  else {
    return param
  }
}
