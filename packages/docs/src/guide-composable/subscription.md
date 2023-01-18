# Subscriptions

In addition to fetching data using queries and modifying data using mutations, the GraphQL spec supports a third operation type, called `subscription`.

GraphQL subscriptions are a way to push data from the server to the clients that choose to listen to real time messages from the server. Subscriptions are similar to queries in that they specify a set of fields to be delivered to the client, but instead of immediately returning a single answer, a result is sent every time a particular event happens on the server.

A common use case for subscriptions is notifying the client side about particular events, for example the creation of a new object, updated fields and so on.

## Overview

GraphQL subscriptions have to be defined in the schema, just like queries and mutations:

```graphql
type Subscription {
  messageAdded(channelId: ID!): Message!
}
```

On the client, subscription queries look just like any other kind of operation:

```graphql
subscription onMessageAdded($channelId: ID!) {
  messageAdded(channelId: $channelId) {
    id
    text
  }
}
```

The response sent to the client looks as follows:

```json
{
  "data": {
    "messageAdded": {
      "id": "123",
      "text": "Hello!"
    }
  }
}
```

In the above example, the server is written to send a new result every time a message is added for a specific channel. Note that the code above only defines the GraphQL subscription in the schema. Read [setting up subscriptions on the client](#client-setup) and [setting up GraphQL subscriptions for the server](https://www.apollographql.com/docs/graphql-subscriptions) to learn how to add subscriptions to your app.

### When to use subscriptions

In most cases, intermittent polling or manual refetching are actually the best way to keep your client up to date. So when is a subscription the best option? Subscriptions are especially useful if:

1. The initial state is large, but the incremental change sets are small. The starting state can be fetched with a query and subsequently updated through a subscription.
2. You care about low-latency updates in the case of specific events, for example in the case of a chat application where users expect to receive new messages in a matter of seconds.

A future version of Apollo or GraphQL might include support for live queries, which would be a low-latency way to replace polling, but at this point general live queries in GraphQL are not yet possible outside of some relatively experimental setups.

## Client setup

In this article, we'll explain how to set it up on the client, but you'll also need a server implementation. You can [read about how to use subscriptions with a JavaScript server](https://www.apollographql.com/docs/graphql-subscriptions/setup), or enjoy subscriptions set up out of the box if you are using a GraphQL backend as a service like [Graphcool](https://www.graph.cool/docs/tutorials/worldchat-subscriptions-example-ui0eizishe/).

The GraphQL spec does not define a specific protocol for sending subscription requests. The first popular JavaScript library to implement subscriptions over WebSocket is called *subscriptions-transport-ws*. This library is no longer actively maintained. Its successor is a library called *graphql-ws*. The two libraries do not use the same WebSocket subprotocol, so you need to make sure that your server and clients all use the same library.

Apollo Client supports both *graphql-ws* and *subscriptions-transport-ws*. Apollo [documentation](https://www.apollographql.com/docs/react/data/subscriptions/#choosing-a-subscription-library) suggest to use the newer library *graphql-ws*, but in case you need it, here its explained how to do it with both.

### The new library: **graphql-ws**
Let's look at how to add support for this transport to Apollo Client using a link set up for newest library [graphql-ws](https://github.com/enisdenjo/graphql-ws). First, install: 
```bash
npm install graphql-ws
```
Then initialize a GraphQL web socket link:

```js
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";

const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);
```

We need to either use the `GraphQLWsLink` or the `HttpLink` depending on the operation type:

```js
import { HttpLink, split } from "@apollo/client/core"
import { GraphQLWsLink } from "@apollo/client/link/subscriptions"; // <-- This one uses graphql-ws
import { getMainDefinition } from "@apollo/client/utilities"

// Create an http link:
const httpLink = new HttpLink({
  uri: "http://localhost:3000/graphql"
})

// Create a GraphQLWsLink link:
const wsLink = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:5000/",
  })
);

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    )
  },
  wsLink,
  httpLink
)

// Create the apollo client with cache implementation.
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
```
The apollo client is the one that will be provided to the vue app, see the [setup section](https://v4.apollo.vuejs.org/guide-composable/setup.html) for more details.

Now, queries and mutations will go over HTTP as normal, but subscriptions will be done over the websocket transport.
### The old library: **subscriptions-transport-ws**
If you need to use [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) because your server still uses that protocol, instead of installing graphql-ws, install:
```bash
npm install subscriptions-transport-ws
```
And then initialize a GraphQL web socket link:
```js
import { WebSocketLink } from "@apollo/client/link/ws" // <-- This one uses subscriptions-transport-ws

const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/`,
  options: {
    reconnect: true
  }
})
```
The rest of the configuration (creating a httpLink and link) is the same as described above for graphql-ws.

## useSubscription

The easiest way to add live data to your UI is using the `useSubscription` composition function. This lets you continuously receive updates from your server to update a `Ref` or a reactive object, thus re-rendering your component. One thing to note, subscriptions are just listeners, they don't request any data when first connected : they only open up a connection to get new data.

Start by importing `useSubscription` in your component:

```vue{2}
<script>
import { useSubscription } from "@vue/apollo-composable"

export default {
  setup() {
    // Data & Logic here...
  }
}
</script>
```

We can then pass a GraphQL document as the first parameter and retrieve the `result` ref:

```vue{6-13}
<script>
import { useSubscription } from "@vue/apollo-composable"

export default {
  setup() {
    const { result } = useSubscription(gql`
      subscription onMessageAdded {
        messageAdded {
          id
          text
        }
      }
    `)
  }
}
</script>
```

We can then `watch` the result as new data is received:

```vue{2,16-20}
<script>
import { watch } from "vue"
import { useSubscription } from "@vue/apollo-composable"

export default {
  setup() {
    const { result } = useSubscription(gql`
      subscription onMessageAdded {
        messageAdded {
          id
          text
        }
      }
    `)

    watch(
      result,
      data => {
        console.log("New message received:", data.messageAdded)
      },
      {
        lazy: true // Don't immediately execute handler
      }
    )
  }
}
</script>
```

For example, we could display the list of messages as we receive them:

```vue{2,7,19,24-26,31-39}
<script>
import { watch, ref } from "vue"
import { useSubscription } from "@vue/apollo-composable"

export default {
  setup() {
    const messages = ref([])

    const { result } = useSubscription(gql`
      subscription onMessageAdded {
        messageAdded {
          id
          text
        }
      }
    `)

    watch(
      result,
      data => {
        messages.value.push(data.messageAdded)
      },
      {
        lazy: true // Don't immediately execute handler
      }
    )

    return {
      messages
    }
  }
}
</script>

<template>
  <div>
    <ul>
      <li v-for="message of messages" :key="message.id">
        {{ message.text }}
      </li>
    </ul>
  </div>
</template>
```

### Variables

We can pass variables in the 2nd parameter. Just like `useQuery`, it can either be an object, a `Ref`, a reactive object or a function that will be made reactive.

With a ref:

```js
const variables = ref({
  channelId: "abc"
})

const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  variables
)
```

With a reactive object:

```js
const variables = reactive({
  channelId: "abc"
})

const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  variables
)
```

With a function (which will automatically be made reactive):

```js
const channelId = ref("abc")

const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  () => ({
    channelId: channelId.value
  })
)
```

### Options

Similar to the variables, you can pass options to the third parameter of `useSubscription`:

```js
const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  null,
  {
    fetchPolicy: "no-cache"
  }
)
```

It can also be a reactive object, or a function that will automatically be made reactive:

```js
const { result } = useSubscription(
  gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  null,
  () => ({
    fetchPolicy: "no-cache"
  })
)
```

See the [API Reference](../api/use-subscription) for all the possible options.

### Disable a subscription

You can disable and re-enable a subscription with the `enabled` option:

```js
const enabled = ref(false)

const { result } = useSubscription(
  gql`
  ...
`,
  null,
  () => ({
    enabled: enabled.value
  })
)

function enableSub() {
  enabled.value = true
}
```

### Subscription status

You can retrieve the loading and error stats from `useSubscription`:

```js
const { loading, error } = useSubscription(...)
```

### Event hooks

#### onResult

This is called when a new result is received from the server:

```js
const { onResult } = useSubscription(...)

onResult(result => {
  console.log(result.data)
})
```

#### onError

This is triggered when an error occurs:

```js
import { logErrorMessages } from '@vue/apollo-util'

const { onError } = useSubscription(...)

onError(error => {
  logErrorMessages(error)
})
```

## subscribeToMore

With GraphQL subscriptions your client will be alerted on push from the server and you should choose the pattern that fits your application the most:

- Use it as a notification and run any logic you want when it fires, for example alerting the user or refetching data
- Use the data sent along with the notification and merge it directly into the store (existing queries are automatically notified)

With `subscribeToMore`, you can easily do the latter.

`subscribeToMore` is a function available on every query created with `useQuery`. It works just like `fetchMore`, except that the update function gets called every time the subscription returns, instead of only once.

Let's take the query from our previous example component from the section on [mutations](./mutation) (modified a little bit to have a variable):

```vue
<script>
const MESSAGES = gql`
  query getMessages($channelId: ID!) {
    messages(channelId: $channelId) {
      id
      text
    }
  }
`

export default {
  props: ["channelId"],

  setup(props) {
    // Messages list
    const { result } = useQuery(MESSAGES, () => ({
      channelId: props.channelId
    }))
    const messages = computed(() => result.value?.messages ?? [])

    return {
      messages
    }
  }
}
</script>
```

Now let's add the subscription to this query.

Retrieve the `subscribeToMore` function from `useQuery`:

```vue{16,21}
<script>
const MESSAGES = gql`
  query getMessages($channelId: ID!) {
    messages(channelId: $channelId) {
      id
      text
    }
  }
`

export default {
  props: ["channelId"],

  setup(props) {
    // Messages list
    const { result, subscribeToMore } = useQuery(MESSAGES, () => ({
      channelId: props.channelId
    }))
    const messages = computed(() => result.value?.messages ?? [])

    subscribeToMore()

    return {
      messages
    }
  }
}
</script>
```

It expects either an object or a function that will automatically be reactive:

```js
subscribeToMore({
  // options...
})
```

```js
subscribeToMore(() => ({
  // options...
}))
```

In the latter case, the subscription will automatically restart if the options change.

You can now put a GraphQL document with the relevant subscription, with variables if necessary:

```vue{21-33}
<script>
const MESSAGES = gql`
  query getMessages($channelId: ID!) {
    messages(channelId: $channelId) {
      id
      text
    }
  }
`

export default {
  props: ["channelId"],

  setup(props) {
    // Messages list
    const { result, subscribeToMore } = useQuery(MESSAGES, () => ({
      channelId: props.channelId
    }))
    const messages = computed(() => result.value?.messages ?? [])

    subscribeToMore(() => ({
      document: gql`
        subscription onMessageAdded($channelId: ID!) {
          messageAdded(channelId: $channelId) {
            id
            text
          }
        }
      `,
      variables: {
        channelId: props.channelId
      }
    }))

    return {
      messages
    }
  }
}
</script>
```

Now that the subscription is added to the query, we need to tell Apollo Client how to update the query result with the `updateQuery` option:

```js{13-16}
subscribeToMore(() => ({
  document: gql`
    subscription onMessageAdded($channelId: ID!) {
      messageAdded(channelId: $channelId) {
        id
        text
      }
    }
  `,
  variables: {
    channelId: props.channelId
  },
  updateQuery: (previousResult, { subscriptionData }) => {
    const tmp = [...previousResult] 
    tmp.messages.push(subscriptionData.data.messageAdded)
    return tmp
  }
}))
```

## Authentication over WebSocket

In many cases it is necessary to authenticate clients before allowing them to receive subscription results. To do this, the `SubscriptionClient` constructor accepts a `connectionParams` field, which passes a custom object that the server can use to validate the connection before setting up any subscriptions.

```js
import { WebSocketLink } from "@apollo/client/link/ws"

const wsLink = new WebSocketLink({
  uri: `ws://localhost:5000/`,
  options: {
    reconnect: true,
    connectionParams: {
        authToken: user.authToken,
    },
})
```

::: tip
You can use `connectionParams` for anything else you might need, not only authentication, and check its payload on the server side with [SubscriptionsServer](https://www.apollographql.com/docs/graphql-subscriptions/authentication).
:::
