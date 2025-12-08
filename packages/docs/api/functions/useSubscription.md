[@vue/apollo-composable](../index.md) / useSubscription

# Function: useSubscription()

> **useSubscription**(`subscription`, `options?`): [`Result`](../@vue/namespaces/useSubscription/interfaces/Result.md)

A composable for executing GraphQL subscriptions with full reactivity.

## Parameters

### subscription

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<`DocumentNode`\>

A GraphQL subscription document.

### options?

[`MaybeRefOrGetter`](https://vuejs.org/api/utility-types.html#maybereforgetter)\<[`Options`](../@vue/namespaces/useSubscription/interfaces/Options.md)\>

Options to control how the subscription is executed.

## Returns

[`Result`](../@vue/namespaces/useSubscription/interfaces/Result.md)

Subscription result object with reactive refs.

## Example

```vue
<script setup lang="ts">
import { useSubscription } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const OnMessage = gql`subscription OnMessage($channelId: ID!) {
  newMessage(channelId: $channelId) { id text author }
}`

const { result, error, onResult, onError } = useSubscription(OnMessage, {
  variables: { channelId: '1' }
})

onResult((data) => {
  console.log('New message:', data)
})

onError((error) => {
  console.error('Subscription error:', error.message)
})
</script>

<template>
  <div v-if="error">
    Error: {{ error.message }}
  </div>
  <div v-else>
    Last result: {{ result }}
  </div>
</template>
```
