[@vue/apollo-composable](../index.md) / useSubscriptionLoading

# Function: useSubscriptionLoading()

> **useSubscriptionLoading**(): `ComputedRef`\<`boolean`\>

Returns a computed ref indicating if any subscription in the current component is loading.

Must be called inside a setup function.

## Returns

`ComputedRef`\<`boolean`\>

Computed ref that is `true` when any subscription in this component is connecting.

## Example

```vue
<script setup>
import { useSubscription, useSubscriptionLoading } from '@vue/apollo-composable'

const { result: messages } = useSubscription(OnNewMessage)
const { result: notifications } = useSubscription(OnNotification)

const connecting = useSubscriptionLoading()
</script>

<template>
  <div v-if="connecting">
    Connecting...
  </div>
</template>
```
