[@vue/apollo-composable](../index.md) / useGlobalQueryLoading

# Function: useGlobalQueryLoading()

> **useGlobalQueryLoading**(): `ComputedRef`\<`boolean`\>

Returns a computed ref indicating if any query in the entire app is loading.

Can be called anywhere, including outside of setup functions.

## Returns

`ComputedRef`\<`boolean`\>

Computed ref that is `true` when any query in the app is loading.

## Example

```vue
<script setup>
import { useGlobalQueryLoading } from '@vue/apollo-composable'

// Show global loading indicator in app shell
const loading = useGlobalQueryLoading()
</script>

<template>
  <AppShell>
    <template #header>
      <LoadingBar v-if="loading" />
    </template>
    <RouterView />
  </AppShell>
</template>
```
