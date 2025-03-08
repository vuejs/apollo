# Loading 实用工具

## useQueryLoading

返回一个布尔值 `Ref`，如果组件使用的查询中至少有一个正在加载，则为 `true`。

示例：

```vue
<script>
import { useQuery, useQueryLoading } from '@vue/apollo-composable'

export default {
  setup () {
    const { result: one } = useQuery(/* ... */)
    const { result: two } = useQuery(/* ... */)
    const loading = useQueryLoading()

    return {
      one,
      two,
      loading,
    }
  }
}
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else>
    {{ one }}
    {{ two }}
  </div>
</template>
```

## useMutationLoading

返回一个布尔值 `Ref`，如果组件使用的变更中至少有一个正在加载，则为 `true`。

## useSubscriptionLoading

返回一个布尔值 `Ref`，如果组件使用的订阅中至少有一个正在加载，则为 `true`。

## useGlobalQueryLoading

返回一个布尔值 `Ref`，如果整个应用使用的查询中至少有一个正在加载，则为 `true`。

示例：

```vue
<script>
import { useGlobalQueryLoading } from '@vue/apollo-composable'

export default {
  setup () {
    const loading = useGlobalQueryLoading()

    return {
      loading,
    }
  }
}
</script>

<template>
  <div v-if="loading" class="top-loading-bar"></div>
  <router-view>
</template>
```

## useGlobalMutationLoading

返回一个布尔值 `Ref`，如果整个应用使用的变更中至少有一个正在加载，则为 `true`。

## useGlobalSubscriptionLoading

返回一个布尔值 `Ref`，如果整个应用使用的订阅中至少有一个正在加载，则为 `true`。
