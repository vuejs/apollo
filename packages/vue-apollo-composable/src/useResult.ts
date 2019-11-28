import { Ref, computed } from '@vue/composition-api'

export function useResult<
  TResult = any
> (
  result: Ref<TResult>,
  defaultValue: any = null,
  pick: (data: TResult) => any = null,
) {
  return computed(() => {
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
