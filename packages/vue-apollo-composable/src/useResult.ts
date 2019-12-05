import { Ref, computed } from '@vue/composition-api'

export function useResult<
  TReturnValue = any,
  TDefaultValue = any,
  TResult = any
> (
  result: Ref<TResult>,
  defaultValue: TDefaultValue = null,
  pick: (data: TResult) => TReturnValue = null,
) {
  return computed<TDefaultValue | TReturnValue>(() => {
    const value = result.value
    if (value) {
      if (pick) {
        try {
          return pick(value)
        } catch (e) {
          // Silent error
        }
      } else {
        const keys = Object.keys(value)
        if (keys.length === 1) {
          // Automatically take the only key in result data
          return value[keys[0]]
        } else {
          // Return entire result data
          return value
        }
      }
    }
    return defaultValue
  })
}
