import type { Ref } from 'vue-demi'
import type { ReactiveFunction } from './ReactiveFunction'
import { computed, isRef, ref } from 'vue-demi'

export function paramToRef<T>(param: T | Ref<T> | ReactiveFunction<T>): Ref<T> {
  if (isRef(param)) {
    return param
  }
  else if (typeof param === 'function') {
    return computed(param as ReactiveFunction<T>)
  }
  else {
    return ref(param) as Ref<T>
  }
}
