# Loading utilities

## useQueryLoading

Returns a boolean `Ref` which is `true` if at least one of the queries used by the component is loading.

Example:

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

Returns a boolean `Ref` which is `true` if at least one of the mutations used by the component is loading.

## useSubscriptionLoading

Returns a boolean `Ref` which is `true` if at least one of the subscriptions used by the component is loading.

## useGlobalQueryLoading

Returns a boolean `Ref` which is `true` if at least one of the queries in the entire application is loading.

Example:

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

Returns a boolean `Ref` which is `true` if at least one of the mutations in the entire application is loading.

## useGlobalSubscriptionLoading

Returns a boolean `Ref` which is `true` if at least one of the subscriptions in the entire application is loading.
