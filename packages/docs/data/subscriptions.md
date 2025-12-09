# Subscriptions

This page shows how to use GraphQL subscriptions with the [`useSubscription`](/api/composable/functions/useSubscription) composable for real-time updates.

## Transport Setup

Unlike queries and mutations, subscriptions require a persistent connection to your GraphQL server. The standard `HttpLink` does not support subscriptions—you need to configure either [SSE](/networking/sse) or [WebSocket](/networking/websocket) transport.

See [The Guild's comparison](https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions#sse-vs-websocket) to help decide which transport is right for your use case.

## Overview

Like queries, subscriptions fetch data. Unlike queries, subscriptions maintain an active connection to your GraphQL server, enabling the server to push updates to your client in real time.

Subscriptions are useful for:

- **Small, incremental changes to large objects** - Fetch initial state with a query, then receive updates to individual fields as they occur
- **Low-latency, real-time updates** - Chat messages, notifications, live data feeds

::: tip When to use subscriptions
For most use cases, prefer [polling](/data/queries#polling) or [refetching on demand](/data/queries#refetching). Use subscriptions only when you need real-time push updates from the server.
:::

## Executing a Subscription

Use [`useSubscription`](/api/composable/functions/useSubscription) to subscribe to real-time data:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string, text: string, author: string } }, { channelId: string }>
// ---cut---
const { result, loading, error } = useSubscription(gql`
  subscription OnNewMessage($channelId: ID!) {
    newMessage(channelId: $channelId) {
      id
      text
      author
    }
  }
`, {
  variables: { channelId: '1' },
})
</script>

<template>
  <div v-if="loading">
    Connecting...
  </div>
  <div v-else-if="error">
    Error: {{ error.message }}
  </div>
  <div v-else-if="result">
    New message from {{ result.newMessage.author }}: {{ result.newMessage.text }}
  </div>
</template>
```

The [`useSubscription`](/api/composable/functions/useSubscription) composable returns:

- `result` - A ref containing the latest subscription data
- `loading` - A ref that is `true` until the first event is received
- `error` - A ref containing any error that occurred
- `variables` - A ref containing the current variables

## Variables

Like queries, subscriptions support [multiple levels of reactivity](/data/queries#variables). Pass variables in the options object:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string } }, { channelId: string }>
const ON_NEW_MESSAGE = gql``
// ---cut---
const channelId = ref('general')

const { result } = useSubscription(ON_NEW_MESSAGE, {
  variables: {
    channelId, // Reactive - subscription restarts when value changes
  },
})
```

Or use a getter function:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string } }, { channelId: string }>
const ON_NEW_MESSAGE = gql``
const props = defineProps<{ channelId: string }>()
// ---cut---
const { channelId } = defineProps<{ channelId: string }>()
const { result } = useSubscription(ON_NEW_MESSAGE, () => ({
  variables: { channelId },
}))
```

## Lifecycle Control

Control the subscription with `start`, `stop`, and `restart`:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ notifications: { id: string } }, {}>
const NOTIFICATIONS = gql``
// ---cut---
const { result, start, stop, restart } = useSubscription(NOTIFICATIONS)

function reconnect() {
  restart() // Disconnect and reconnect
}
</script>

<template>
  <div>
    <button @click="stop">
      Pause
    </button>
    <button @click="start">
      Resume
    </button>
    <button @click="reconnect">
      Reconnect
    </button>
  </div>
</template>
```

### Disabling the Subscription

Use the `enabled` option to conditionally enable the subscription:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ notifications: { id: string } }, {}>
const NOTIFICATIONS = gql``
// ---cut---
const isConnected = ref(true)

const { result } = useSubscription(NOTIFICATIONS, {
  enabled: isConnected, // Subscription only active when true
})
```

## Event Hooks

React to subscription lifecycle events:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string, text: string } }, { channelId: string }>
const ON_NEW_MESSAGE = gql``
// ---cut---
const { onResult, onError, onComplete } = useSubscription(ON_NEW_MESSAGE, {
  variables: { channelId: '1' },
})

onResult((result) => {
  console.log('New message:', result.newMessage)
})

onError((error) => {
  console.error('Subscription error:', error)
})

onComplete(() => {
  console.log('Subscription completed')
})
```

## Subscribing to Query Updates

Use [`subscribeToMore`](/api/composable/@vue/namespaces/useQuery/interfaces/Result.md#subscribetomore) from [`useQuery`](/api/composable/functions/useQuery) to update query results with subscription data. This is useful when you want to fetch initial data with a query and then receive real-time updates.

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { watch } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ messages: { id: string, text: string }[] }, { channelId: string }>
declare const gqlSub: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string, text: string } }, { channelId: string }>
declare const GET_MESSAGES = gql``
declare const ON_NEW_MESSAGE = gqlSub``

// ---cut---
const { channelId } = defineProps<{ channelId: string }>()

const { current, subscribeToMore } = useQuery(GET_MESSAGES, {
  variables: { channelId: () => channelId },
})

// Subscribe to new messages once query loads
watch(
  () => current.value.resultState === 'complete',
  (isComplete) => {
    if (!isComplete)
      return

    subscribeToMore({
      document: ON_NEW_MESSAGE,
      variables: { channelId },
      // First document is deprecated, use `previousData` with `complete` flag
      updateQuery(_prev, { subscriptionData, previousData, complete }) {
        if (!complete)
          return
        if (!subscriptionData.data)
          return previousData

        return {
          ...previousData,
          messages: [
            ...previousData.messages,
            subscriptionData.data.newMessage,
          ],
        }
      },
    })
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="current.loading">
    Loading...
  </div>
  <div v-else-if="current.error">
    Error: {{ current.error.message }}
  </div>
  <ul v-else-if="current.resultState === 'complete'">
    <li v-for="msg in current.result.messages" :key="msg.id">
      {{ msg.text }}
    </li>
  </ul>
</template>
```

See [`SubscribeToMoreOptions`](/api/composable/@vue/namespaces/useQuery/interfaces/SubscribeToMoreOptions) for all available options.

## Options

See [`useSubscription.Options`](/api/composable/@vue/namespaces/useSubscription/interfaces/Options) for all available options.

