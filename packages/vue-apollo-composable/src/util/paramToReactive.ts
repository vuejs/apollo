import { Ref, isRef, reactive, computed } from '@vue/composition-api'
import { ReactiveFunction } from './ReactiveFunction'

export function paramToReactive<T extends object> (param: T | Ref<T> | ReactiveFunction<T>): T | Ref<T> {
  if (isRef(param)) {
    return param
  } else if (typeof param === 'function') {
    return computed(param as ReactiveFunction<T>)
  } else if (param) {
    return reactive(param) as T
  } else {
    return param
  }
}