# Subscriptions

A GraphQL subscription is a long-lived read. Instead of answering once and closing, the server holds the connection open and pushes a new result every time the data changes, so the client learns about it without asking.

That makes it the only one of the three operation types the client does not drive. A [query](/data/queries) runs when you ask, a [mutation](/data/mutations) when you call it, and a subscription whenever the server has something to say.

Subscriptions are useful for:

- **Small, incremental changes to large objects.** Fetch initial state with a query, then receive updates to individual fields as they occur.
- **Low-latency, real-time updates.** Chat messages, notifications, live data feeds.

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

The default `HttpLink` can also serve subscriptions when the server supports `multipart/mixed` responses. No extra library or configuration is required. Support depends on your server (Apollo Router, Yoga, and several others support it).

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

:::: composition-api
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
::::

:::: components-api
`<ApolloSubscription>` has a single slot, and it is optional. With one, you render the
latest payload:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const gql: (literals: TemplateStringsArray, ...placeholders: any[]) => TypedDocumentNode<{ newMessage: { id: string, text: string, author: string } }, { channelId: string }>
// ---cut---
import { ApolloSubscription } from '@vue/apollo-components'
</script>

<template>
  <ApolloSubscription
    v-slot="{ result, loading, error }"
    :subscription="gql`
      subscription OnNewMessage($channelId: ID!) {
        newMessage(channelId: $channelId) {
          id
          text
          author
        }
      }
    `"
    :variables="{ channelId: '1' }"
  >
    <div v-if="loading">
      Connecting...
    </div>
    <div v-else-if="error">
      Error: {{ error.message }}
    </div>
    <div v-else-if="result">
      New message from {{ result.newMessage.author }}: {{ result.newMessage.text }}
    </div>
  </ApolloSubscription>
</template>
```

The slot gives you `result`, `loading`, `error`, `start`, `stop` and `restart`.

Without a slot the component renders nothing at all, which is often what you want: a
subscription frequently exists to *cause an effect* rather than to display something.
`@result` is then the whole API.

```vue-html
<ApolloSubscription
  :subscription="OnNewMessage"
  :variables="{ channelId }"
  @result="playChime"
/>
```
::::

## Variables

:::: composition-api
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
::::

:::: components-api
Bind `variables` as a prop. The subscription unsubscribes and resubscribes whenever they
change:

```vue-html
<ApolloSubscription :subscription="OnNewMessage" :variables="{ channelId }" />
```

`shouldResubscribe`, `debounce` and `throttle` have no dedicated props; pass them through
`options`:

```vue-html
<ApolloSubscription
  :subscription="OnNewMessage"
  :variables="{ channelId }"
  :options="{ shouldResubscribe: false }"
/>
```
::::

## Lifecycle control

:::: composition-api
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
::::

:::: components-api
`start`, `stop` and `restart` are all slot props:

```vue twoslash
<script setup lang="ts">
import { TypedDocumentNode } from '@apollo/client'

declare const Notifications: TypedDocumentNode<{ notifications: { id: string } }, Record<string, never>>
// ---cut---
import { ApolloSubscription } from '@vue/apollo-components'
</script>

<template>
  <ApolloSubscription v-slot="{ start, stop, restart }" :subscription="Notifications">
    <button @click="stop()">
      Pause
    </button>
    <button @click="start()">
      Resume
    </button>
    <button @click="restart()">
      Reconnect
    </button>
  </ApolloSubscription>
</template>
```

For pausing declaratively, prefer the `disabled` prop below, which survives re-renders.
::::

### Conditionally enabling

:::: composition-api
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
::::

:::: components-api
Use the `disabled` prop:

```vue-html
<ApolloSubscription :subscription="Notifications" :disabled="!isConnected" />
```

While `disabled` is `true`, no connection exists. When it flips to `false`, the subscription
starts.

As with [`<ApolloQuery>`](/data/queries#disabling-queries), the prop is `disabled` rather
than the composable's `enabled`, so that an absent prop means "on". `options: { enabled }`
still works.
::::

## Event hooks

:::: composition-api
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
::::

:::: components-api
The three hooks are emitted as `@result`, `@error` and `@complete`:

```vue
<script setup lang="ts">
import { ApolloSubscription } from '@vue/apollo-components'
import { OnNewMessage } from './subscriptions'
</script>

<template>
  <ApolloSubscription
    :subscription="OnNewMessage"
    :variables="{ channelId: '1' }"
    @result="result => console.log('New message:', result.newMessage)"
    @error="error => console.error('Subscription error:', error)"
    @complete="() => console.log('Subscription completed')"
  />
</template>
```

`@complete` fires when the server closes the subscription cleanly (for example, after a
finite stream like a countdown).
::::

## Subscribing to query updates

:::: composition-api
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
::::

:::: components-api
[`<ApolloSubscribeToMore>`](/api/components/ApolloSubscribeToMore) does this declaratively.
Drop it inside an `<ApolloQuery>` and it subscribes to the query it finds, with no `watch`
and no waiting for the query to load first:

```vue
<script setup lang="ts">
import type { SubscribeToMoreUpdateQueryFn } from '@apollo/client'
import { ApolloQuery, ApolloSubscribeToMore } from '@vue/apollo-components'
import { GetMessages, OnNewMessage } from './operations'

const { channelId } = defineProps<{ channelId: string }>()

const addMessage: SubscribeToMoreUpdateQueryFn<
  { messages: { id: string, text: string }[] },
  { channelId: string },
  { newMessage: { id: string, text: string } }
> = (_prev, { subscriptionData, previousData, complete }) => {
  if (!complete || !subscriptionData.data)
    return

  return {
    ...previousData,
    messages: [...previousData.messages, subscriptionData.data.newMessage],
  }
}
</script>

<template>
  <ApolloQuery :query="GetMessages" :variables="{ channelId }">
    <ApolloSubscribeToMore
      :document="OnNewMessage"
      :variables="{ channelId }"
      :updateQuery="addMessage"
    />

    <template #loading>
      Loading...
    </template>
    <template #error="{ error }">
      Error: {{ error.message }}
    </template>
    <template #data="{ data }">
      <ul>
        <li v-for="msg in data.messages" :key="msg.id">
          {{ msg.text }}
        </li>
      </ul>
    </template>
  </ApolloQuery>
</template>
```

The component renders nothing. It subscribes on mount, unsubscribes on unmount, and
resubscribes when `document`, `variables` or `context` change. Changing `updateQuery`
alone never resubscribes.

The `context` prop is passed to the link chain for this subscription alone, which is where
per-subscription headers or link options belong:

```vue-html
<ApolloSubscribeToMore
  :document="OnNewMessage"
  :variables="{ channelId }"
  :context="{ headers: { 'x-channel': channelId } }"
  :updateQuery="addMessage"
/>
```

::: warning It must be inside an `<ApolloQuery>`
`<ApolloSubscribeToMore>` injects the surrounding query, and throws on mount if there is
none. It can sit anywhere in the default slot, including alongside `#data`.

The parent query's types are not visible to it, so `updateQuery` is checked against the
subscription's types only. Annotate the callback yourself, as above, to get the parent
query's result type back.
:::

Errors from the subscription surface on its own `@error` event rather than on the query.

See [`SubscribeToMoreOptions`](/api/composable/@vue/namespaces/useQuery/interfaces/SubscribeToMoreOptions) for all available options.
::::

:::: composition-api
See [`SubscribeToMoreOptions`](/api/composable/@vue/namespaces/useQuery/interfaces/SubscribeToMoreOptions) for all available options.
::::

## Options and result reference

:::: composition-api
For every available option and method, see:

- [`useSubscription.Options`](/api/composable/@vue/namespaces/useSubscription/interfaces/Options)
- [`useSubscription.Result`](/api/composable/@vue/namespaces/useSubscription/interfaces/Result)
::::

:::: components-api
For every prop, event and slot prop, see:

- [`<ApolloSubscription>`](/api/components/ApolloSubscription)
- [`<ApolloSubscribeToMore>`](/api/components/ApolloSubscribeToMore)
- [`useSubscription.Options`](/api/composable/@vue/namespaces/useSubscription/interfaces/Options), for the `options` prop
::::

## Next steps

- [Refetching](/data/refetching) compares subscriptions to polling and refetching.
- [Authentication](/networking/authentication) covers passing auth credentials through your link chain.
- [Error Handling](/data/error-handling) explains error policies and classifying errors.
