[@vue/apollo-composable](../index.md) / useQueryLoading

# Function: useQueryLoading()

> **useQueryLoading**(): `ComputedRef`\<`boolean`\>

Returns a computed ref indicating if any query in the current component is loading.

Must be called inside a setup function.

## Returns

`ComputedRef`\<`boolean`\>

Computed ref that is `true` when any query in this component is loading.

## Example

```vue
<script setup>
import { useQuery, useQueryLoading } from '@vue/apollo-composable'

// Multiple queries in this component
const { result: users } = useQuery(GetUsers)
const { result: posts } = useQuery(GetPosts)

// Single loading indicator for all queries
const loading = useQueryLoading()
</script>

<template>
  <div v-if="loading">
    Loading...
  </div>
  <div v-else>
    <UserList :users="users" />
    <PostList :posts="posts" />
  </div>
</template>
```
