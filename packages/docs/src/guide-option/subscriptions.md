# Subscriptions

## Setup

*For the server implementation, you can take a look at [this simple example](https://github.com/Akryum/apollo-server-example).*

To enable the websocket-based subscription, a bit of additional setup is required:

```
npm install --save apollo-link-ws apollo-utilities
```

```js
import Vue from 'vue'
import { ApolloClient } from 'apollo-client'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
// New Imports
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'

import VueApollo from 'vue-apollo'

const httpLink = new HttpLink({
  // You should use an absolute URL here
  uri: 'http://localhost:3020/graphql',
})

// Create the subscription websocket link
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:3000/subscriptions',
  options: {
    reconnect: true,
  },
})

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

// Create the apollo client
const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
  connectToDevTools: true,
})

// Install the vue plugin like before
Vue.use(VueApollo)
```

## Subscribe To More

If you need to update a smart query result from a subscription, the best way is using the `subscribeToMore` smart query method. It will create [Smart Subscriptions](../../api/smart-subscription.md) that are linked to the smart query. Just add a `subscribeToMore` to your smart query:

```js
apollo: {
  tags: {
    query: TAGS_QUERY,
    subscribeToMore: {
      document: gql`subscription name($param: String!) {
        itemAdded(param: $param) {
          id
          label
        }
      }`,
      // Variables passed to the subscription. Since we're using a function,
      // they are reactive
      variables () {
        return {
          param: this.param,
        }
      },
      // Mutate the previous result
      updateQuery: (previousResult, { subscriptionData }) => {
        // Here, return the new result from the previous with the new data
      },
    }
  }
}
```

::: tip
Note that you can pass an array of subscriptions to `subscribeToMore` to subscribe to multiple subscriptions on this query.
:::

### Alternate usage

You can access the queries you defined in the `apollo` option with `this.$apollo.queries.<name>`, so it would look like this:

```js
this.$apollo.queries.tags.subscribeToMore({
  // GraphQL document
  document: gql`subscription name($param: String!) {
    itemAdded(param: $param) {
      id
      label
    }
  }`,
  // Variables passed to the subscription
  variables: {
    param: '42',
  },
  // Mutate the previous result
  updateQuery: (previousResult, { subscriptionData }) => {
    // Here, return the new result from the previous with the new data
  },
})
```

If the related query is stopped, the subscription will be automatically destroyed.

Here is an example:

```js
// Subscription GraphQL document
const TAG_ADDED = gql`subscription tags($type: String!) {
  tagAdded(type: $type) {
    id
    label
    type
  }
}`

// SubscribeToMore tags
// We have different types of tags
// with one subscription 'channel' for each type
this.$watch(() => this.type, (type, oldType) => {
  if (type !== oldType || !this.tagsSub) {
    // We need to unsubscribe before re-subscribing
    if (this.tagsSub) {
      this.tagsSub.unsubscribe()
    }
    // Subscribe on the query
    this.tagsSub = this.$apollo.queries.tags.subscribeToMore({
      document: TAG_ADDED,
      variables: {
        type,
      },
      // Mutate the previous result
      updateQuery: (previousResult, { subscriptionData }) => {
        // If we added the tag already don't do anything
        // This can be caused by the `updateQuery` of our addTag mutation
        if (previousResult.tags.find(tag => tag.id === subscriptionData.data.tagAdded.id)) {
          return previousResult
        }

        return {
          tags: [
            ...previousResult.tags,
            // Add the new tag
            subscriptionData.data.tagAdded,
          ],
        }
      },
    })
  }
}, {
  immediate: true,
})
```

## Simple subscription

::: danger
If you want to update a query with the result of the subscription, use `subscribeToMore`.
The methods below are suitable for a 'notify' use case.
:::

You can declare [Smart Subscriptions](../../api/smart-subscription.md) in the `apollo` option with the `$subscribe` keyword:

```js
apollo: {
  // Subscriptions
  $subscribe: {
    // When a tag is added
    tagAdded: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Reactive variables
      variables () {
        // This works just like regular queries
        // and will re-subscribe with the right variables
        // each time the values change
        return {
          type: this.type,
        }
      },
      // Result hook
      // Don't forget to destructure `data`
      result ({ data }) {
        console.log(data.tagAdded)
      },
    },
  },
},
```

You can then access the subscription with `this.$apollo.subscriptions.<name>`.

:::tip
Just like for queries, you can declare the subscription [with a function](./queries.md#option-function), and you can declare the `query` option [with a reactive function](./queries.md#reactive-query-definition).
:::

When server supports live queries and uses subscriptions to update them, like [Hasura](https://hasura.io/), you can
use simple subscriptions for reactive queries:

```js
data () {
  return {
    tags: [],
  };
},
apollo: {
  $subscribe: {
    tags: {
      query: gql`subscription {
        tags {
          id
          label
          type
        }
      }`,
      result ({ data }) {
        this.tags = data.tags;
      },
    },
  },
},
```

## Skipping the subscription

If the subscription is skipped, it will disable it and it will not be updated anymore. You can use the `skip` option:

```js
// Apollo-specific options
apollo: {
  // Subscriptions
  $subscribe: {
    // When a tag is added
    tags: {
      query: gql`subscription tags($type: String!) {
        tagAdded(type: $type) {
          id
          label
          type
        }
      }`,
      // Reactive variables
      variables () {
        return {
          type: this.type,
        }
      },
      // Result hook
      result (data) {
        // Let's update the local data
        this.tags.push(data.tagAdded)
      },
      // Skip the subscription
      skip () {
        return this.skipSubscription
      }
    },
  },
},
```

Here, `skip` will be called automatically when the `skipSubscription` component property changes.

You can also access the subscription directly and set the `skip` property:

```js
this.$apollo.subscriptions.tags.skip = true
```

## Manually adding a smart Subscription

You can manually add a smart subscription with the `$apollo.addSmartSubscription(key, options)` method:

```js
created () {
  this.$apollo.addSmartSubscription('tagAdded', {
    // Same options like '$subscribe' above
  })
}
```

:::tip
Internally, this method is called for each entry of the `$subscribe` object in the component `apollo` option.
:::

## Standard Apollo subscribe

Use the `$apollo.subscribe()` method to subscribe to a GraphQL subscription that will get killed automatically when the component is destroyed. It will **NOT** create a Smart Subscription.

```js
mounted () {
  const subQuery = gql`subscription tags($type: String!) {
    tagAdded(type: $type) {
      id
      label
      type
    }
  }`

  const observer = this.$apollo.subscribe({
    query: subQuery,
    variables: {
      type: 'City',
    },
  })

  observer.subscribe({
    next (data) {
      console.log(data)
    },
    error (error) {
      console.error(error)
    },
  })
},
```
