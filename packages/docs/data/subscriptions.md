# Subscriptions

This page covers GraphQL subscriptions with the [`useSubscription`](/api/composable/functions/useSubscription) composable for real-time updates.

## Overview

Subscriptions maintain an active connection to your GraphQL server, allowing the server to push updates to the client in real time.

They are useful for:

- **Small, incremental changes to large objects.** Fetch initial state with a query, then receive updates to individual fields as they occur.
- **Low-latency, real-time updates.** Chat messages, notifications, live data feeds.

::: tip When to use subscriptions
For most use cases, prefer [polling](/data/refetching#polling) or [refetching on demand](/data/refetching). Reach for subscriptions when you need real-time push updates from the server.
:::

## Transport setup

Subscriptions require a persistent connection. The default `HttpLink` cannot deliver them. Pick one of three transports:

- **WebSocket** through [`graphql-ws`](https://github.com/enisdenjo/graphql-ws). Mature, widely supported, bidirectional. The historical default.
- **Server-Sent Events (SSE)** through [`graphql-sse`](https://github.com/enisdenjo/graphql-sse). Server-to-client only, runs over plain HTTP, simpler infrastructure (no WebSocket proxy).
- **Multipart HTTP**. Built into Apollo Client. No extra library, but only supported by some servers.

See [The Guild's transport comparison](https://the-guild.dev/graphql/yoga-server/docs/features/subscriptions#sse-vs-websocket) to help choose.

### WebSocket setup

Install `graphql-ws`:

```bash
npm install graphql-ws
```

Create a `GraphQLWsLink` and route subscriptions to it with `ApolloLink.split`:

```ts
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { OperationTypeNode } from 'graphql'
import { createClient } from 'graphql-ws'

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/subscriptions',
  }),
)

const splitLink = ApolloLink.split(
  ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
  wsLink,
  httpLink,
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})
```

Queries and mutations continue over HTTP. Subscriptions go through WebSocket.

#### Authenticating over WebSocket

Pass `connectionParams` to `graphql-ws` to send authentication on connection:

```ts {6-8}
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000/subscriptions',
    connectionParams: () => ({
      authToken: getAuthToken(),
    }),
  }),
)
```

Using a function for `connectionParams` ensures the token is re-read on reconnection. The server receives this object whenever the client connects.

### SSE setup

Install `graphql-sse`:

```bash
npm install graphql-sse
```

Create a link that delegates to `graphql-sse`:

```ts
import type { Client, ClientOptions } from 'graphql-sse'
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, Observable } from '@apollo/client'
import { OperationTypeNode, print } from 'graphql'
import { createClient } from 'graphql-sse'

class SSELink extends ApolloLink {
  private client: Client

  constructor(options: ClientOptions) {
    super()
    this.client = createClient(options)
  }

  public request(operation: ApolloLink.Operation): Observable<ApolloLink.Result> {
    return new Observable((sink) => {
      return this.client.subscribe<ApolloLink.Result>(
        {
          query: print(operation.query),
          variables: operation.variables,
          extensions: operation.extensions,
          ...(operation.operationName && { operationName: operation.operationName }),
        },
        {
          next: data => sink.next(data as ApolloLink.Result),
          complete: sink.complete.bind(sink),
          error: sink.error.bind(sink),
        },
      )
    })
  }

  public dispose() {
    this.client.dispose()
  }
}

const httpLink = new HttpLink({ uri: 'http://localhost:4000/graphql' })
const sseLink = new SSELink({ url: 'http://localhost:4000/graphql' })

const splitLink = ApolloLink.split(
  ({ operationType }) => operationType === OperationTypeNode.SUBSCRIPTION,
  sseLink,
  httpLink,
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
})
```

SSE runs over plain HTTP. Pass standard `fetch` headers (auth, etc.) through the `headers` option in the SSE client.

### Multipart HTTP

The default `HttpLink` can also serve subscriptions when the server supports `multipart/mixed` responses. No extra library or configuration is required: Apollo Client adds the right headers when it sees a subscription operation. Support depends on your server (Apollo Router, Yoga, and several others support it).

## Defining a subscription

Subscriptions are GraphQL documents like queries and mutations:

```ts
import type { TypedDocumentNode } from '@apollo/client'
import { gql } from '@apollo/client'

const ON_NEW_MESSAGE: TypedDocumentNode<
  { newMessage: { id: string, text: string, author: string } },
  { channelId: string }
> = gql`
  subscription OnNewMessage($channelId: ID!) {
    newMessage(channelId: $channelId) {
      id
      text
      author
    }
  }
`
```

## Executing a subscription

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

`useSubscription` returns the following refs and helpers:

- `result` holds the most recent subscription payload.
- `loading` is `true` until the first event arrives.
- `error` contains any error from the subscription.
- `start()`, `stop()`, `restart()` control the subscription lifecycle.
- `variables` is a ref holding the current variables.

::: tip Why flat refs and not `current`?
A subscription delivers one result at a time. There is no streaming or partial state to disambiguate, so a discriminated union would not narrow anything. The individual refs match the API directly. See [TypeScript](/data/typescript#composable-return-value-shapes) for the comparison across composables.
:::

## Variables

Subscriptions support the same reactive variable patterns as queries:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string } }, { channelId: string }>
const ON_NEW_MESSAGE = gql`subscription { newMessage { id } }`
// ---cut---
const channelId = ref('general')

const { result } = useSubscription(ON_NEW_MESSAGE, {
  variables: { channelId }, // Subscription restarts when channelId changes
})
```

Or with a getter:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string } }, { channelId: string }>
const ON_NEW_MESSAGE = gql`subscription { newMessage { id } }`
// ---cut---
const { channelId } = defineProps<{ channelId: string }>()
const { result } = useSubscription(ON_NEW_MESSAGE, () => ({
  variables: { channelId },
}))
```

By default, the subscription unsubscribes and resubscribes whenever the variables change. Override that behavior with `shouldResubscribe`:

```ts
useSubscription(ON_NEW_MESSAGE, {
  variables: { channelId },
  shouldResubscribe: false, // Keep the subscription open even when variables change
})
```

`debounce` and `throttle` are also available for variable updates, with the same semantics as in [Queries](/data/queries#throttle-and-debounce).

## Lifecycle control

Manage the connection imperatively:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ notifications: { id: string } }, {}>
const NOTIFICATIONS = gql`subscription { notifications { id } }`
// ---cut---
const { result, start, stop, restart } = useSubscription(NOTIFICATIONS)

function reconnect() {
  restart() // Disconnect and reconnect
}
</script>

<template>
  <button @click="stop">
    Pause
  </button>
  <button @click="start">
    Resume
  </button>
  <button @click="reconnect">
    Reconnect
  </button>
</template>
```

### Conditionally enabling

Use `enabled` to gate the subscription on a condition:

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'
import { ref } from 'vue'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ notifications: { id: string } }, {}>
const NOTIFICATIONS = gql`subscription { notifications { id } }`
// ---cut---
const isConnected = ref(true)

const { result } = useSubscription(NOTIFICATIONS, {
  enabled: isConnected,
})
```

While `enabled` is `false`, no connection exists. When it flips to `true`, the subscription starts.

## Event hooks

```ts twoslash
import { TypedDocumentNode } from '@apollo/client'
import { useSubscription } from '@vue/apollo-composable'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string, text: string } }, { channelId: string }>
const ON_NEW_MESSAGE = gql`subscription { newMessage { id text } }`
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

`onComplete` fires when the server closes the subscription cleanly (for example, after a finite stream like a countdown).

## Subscribing to query updates

`subscribeToMore` lets you fetch initial data with a query and stream updates into it via a subscription. The merged result behaves like a single, continuously-updated query.

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'
import { useQuery } from '@vue/apollo-composable'
import { watch } from 'vue'

declare const GET_MESSAGES: TypedDocumentNode<{ messages: { id: string, text: string }[] }, { channelId: string }>
declare const ON_NEW_MESSAGE: TypedDocumentNode<{ newMessage: { id: string, text: string } }, { channelId: string }>
// ---cut---
const { channelId } = defineProps<{ channelId: string }>()

const { current, subscribeToMore } = useQuery(GET_MESSAGES, {
  variables: { channelId: () => channelId },
})

// Subscribe to new messages once the initial query loads
watch(
  () => current.value.resultState === 'complete',
  (isComplete) => {
    if (!isComplete)
      return

    subscribeToMore({
      document: ON_NEW_MESSAGE,
      variables: { channelId },
      updateQuery(_prev, { subscriptionData, previousData, complete }) {
        // Skip updates until previous data is complete and a new message arrived
        if (!complete)
          return
        if (!subscriptionData.data)
          return

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

The first argument to `updateQuery` (`_prev`) is deprecated in Apollo Client v4. Read from `options.previousData` with the `options.complete` guard for type-safe access.

See [`SubscribeToMoreOptions`](/api/composable/@vue/namespaces/useQuery/interfaces/SubscribeToMoreOptions) for all available options.

## Options and result reference

For every available option and method, see:

- [`useSubscription.Options`](/api/composable/@vue/namespaces/useSubscription/interfaces/Options)
- [`useSubscription.Result`](/api/composable/@vue/namespaces/useSubscription/interfaces/Result)

## Next steps

- [Refetching](/data/refetching) compares subscriptions to polling and refetching.
- [Authentication](/networking/authentication) covers passing auth credentials through your link chain.
- [Error Handling](/data/error-handling) explains error policies and classifying errors.
