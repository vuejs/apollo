# Apollo and GraphQL for Vue.js

[![npm](https://img.shields.io/npm/v/vue-apollo.svg) ![npm](https://img.shields.io/npm/dm/vue-apollo.svg)](https://www.npmjs.com/package/vue-apollo)
[![vue1](https://img.shields.io/badge/vue-1.x-brightgreen.svg) ![vue2](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://vuejs.org/)

![schema](https://cdn-images-1.medium.com/max/800/1*H9AANoofLqjS10Xd5TwRYw.png)

Integrates [apollo](http://www.apollostack.com/) in your [Vue](http://vuejs.org) components with declarative queries. Compatible with Vue 1.0+ and 2.0+

[<img src="https://assets-cdn.github.com/favicon.ico" alt="icon" width="16" height="16"/> More vue-apollo examples](https://github.com/Akryum/vue-apollo-example)

[<img src="https://assets-cdn.github.com/favicon.ico" alt="icon" width="16" height="16"/> Apollo graphql server example](https://github.com/Akryum/apollo-server-example)

[<img src="https://assets-cdn.github.com/favicon.ico" alt="icon" width="16" height="16"/> Apollo "hello world" example app](https://github.com/Akryum/frontpage-vue-app)

[<img src="https://cdn-static-1.medium.com/_/fp/icons/favicon-medium.TAS6uQ-Y7kcKgi0xjcYHXw.ico" alt="icon" width="16" height="16"/> Howto on Medium](https://dev-blog.apollodata.com/use-apollo-in-your-vuejs-app-89812429d8b2#.pdd4hmcrc)

## Table of contents

- [Installation](#installation)
- [Create a provider](#create-a-provider)
- [Usage in components](#usage-in-components)
- [Queries](#queries)
  - [Simple query](#simple-query)
  - [Query with parameters](#query-with-parameters)
  - [Option function](#option-function)
  - [Reactive query definition](#reactive-query-definition)
  - [Reactive parameters](#reactive-parameters)
  - [Skipping the query](#skipping-the-query)
  - [Advanced options](#advanced-options)
  - [Reactive Query Example](#reactive-query-example)
  - [Manually adding a smart Query](#manually-adding-a-smart-query)
- [Mutations](#mutations)
- [Subscriptions](#subscriptions)
  - [subscribeToMore](#subscribetomore)
  - [subscribe](#subscribe)
  - [Skipping the subscription](#skipping-the-subscription)
  - [Manually adding a smart Subscription](#manually-adding-a-smart-subscription)
- [Pagination with `fetchMore`](#pagination-with-fetchmore)
- [Skip all](#skip-all)
- [Multiple clients](#multiple-clients)
- [Server-Side Rendering](#server-side-rendering)

## Installation

Try and install this packages before server side set (of packages), add apollo to meteor.js before then, too.

    npm install --save vue-apollo apollo-client

In your app, create an `ApolloClient` instance and install the `VueApollo` plugin:

```javascript
import Vue from 'vue'
import { ApolloClient, createNetworkInterface } from 'apollo-client'
import VueApollo from 'vue-apollo'

// Create the apollo client
const apolloClient = new ApolloClient({
  networkInterface: createNetworkInterface({
    uri: 'http://localhost:3020/graphql',
    transportBatching: true,
  }),
  connectToDevTools: true,
})

// Install the vue plugin
Vue.use(VueApollo)
```

## Create a provider

Like `vue-router` or `vuex`, you need to specify the `apolloProvider` object on your root components. A provider holds the apollo client instances that can then be used by all the child components.

```javascript
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
})

new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})
```

## Usage in components

To declare apollo queries in your Vue component, add an `apollo` object :

```javascript
new Vue({
    apollo: {
        // Apollo specific options
    },
})
```

You can access the [apollo-client](http://dev.apollodata.com/core/apollo-client-api.html) instances with `this.$apollo.provider.defaultClient` or `this.$apollo.provider.clients.<key>` (for [Multiple clients](#multiple-clients)) in all your vue components.

## Queries

In the `apollo` object, add an attribute for each property you want to feed with the result of an Apollo query.

### Simple query

Use `gql` to write your GraphQL queries:

```javascript
import gql from 'graphql-tag'
```

Put the [gql](http://docs.apollostack.com/apollo-client/core.html#gql) query directly as the value:

```javascript
apollo: {
  // Simple query that will update the 'hello' vue property
  hello: gql`{hello}`,
},
```

You can then access the query with `this.$apollo.queries.<name>`.

You can initialize the property in your vue component's `data` hook:

```javascript
data () {
  return {
    // Initialize your apollo data
    hello: '',
  },
},
```

Server-side, add the corresponding schema and resolver:

```javascript
export const schema = `
type Query {
  hello: String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    hello(root, args, context) {
      return "Hello world!"
    },
  },
}
```

For more info, visit the [apollo doc](http://dev.apollodata.com/tools/).

You can then use your property as usual in your vue component:

```html
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

### Query with parameters

You can add variables (read parameters) to your `gql` query by declaring `query` and `variables` in an object:

```javascript
// Apollo-specific options
apollo: {
  // Query with parameters
  ping: {
    // gql query
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Static parameters
    variables: {
      message: 'Meow',
    },
  },
},
```

You can use the apollo `watchQuery` options in the object, like:
 - `fetchPolicy`
 - `pollInterval`
 - ...

See the [apollo doc](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.watchQuery) for more details.

For example, you could add the `forceFetch` apollo option like this:

```javascript
apollo: {
  // Query with parameters
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    variables: {
      message: 'Meow'
    },
    // Additional options here
    fetchPolicy: 'cache-and-network',
  },
},
```

Again, you can initialize your property in your vue component:

```javascript
data () {
  return {
    // Initialize your apollo data
    ping: '',
  }
},
```

Server-side, add the corresponding schema and resolver:

```javascript
export const schema = `
type Query {
  ping(message: String!): String
}

schema {
  query: Query
}
`

export const resolvers = {
  Query: {
    ping(root, { message }, context) {
      return `Answering ${message}`
    },
  },
}
```

And then use it in your vue component:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

### Option function

You can use a function to initialize the key:

```javascript
// Apollo-specific options
apollo: {
  // Query with parameters
  ping () {
    // This will called one when the component is created
    // It must return the option object
    return {
      // gql query
      query: gql`query PingMessage($message: String!) {
        ping(message: $message)
      }`,
      // Static parameters
      variables: {
        message: 'Meow',
      },
    }
  },
},
```

**This will called once when the component is created and it must return the option object.**

*This also works for [subscriptions](#subscriptions).*

### Reactive query definition

You can use a function for the `query` option, that will update the graphql query definition automatically:

```javascript
// The featured tag can be either a random tag or the last added tag
featuredTag: {
  query () {
    // Here you can access the component instance with 'this'
    if (this.showTag === 'random') {
      return gql`{
        randomTag {
          id
          label
          type
        }
      }`
    } else if (this.showTag === 'last') {
      return gql`{
        lastTag {
          id
          label
          type
        }
      }`
    }
  },
  // We need this to assign the value of the 'featuredTag' component property
  update: data => data.randomTag || data.lastTag,
},
```

*This also works for [subscriptions](#subscriptions).*

### Reactive parameters

Use a function instead to make the parameters reactive with vue properties:

```javascript
// Apollo-specific options
apollo: {
  // Query with parameters
  ping: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Reactive parameters
    variables() {
      // Use vue reactive properties here
      return {
          message: this.pingInput,
      }
    },
  },
},
```

This will re-fetch the query each time a parameter changes, for example:

```html
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <input v-model="pingInput" placeholder="Enter a message" />
    <p>
      {{ping}}
    </p>
  </div>
</template>
```

### Skipping the query

If the query is skipped, it will disable it and the result will not be updated anymore. You can use the `skip` option:

```javascript
// Apollo-specific options
apollo: {
  tags: {
    // GraphQL Query
    query: gql`query tagList ($type: String!) {
      tags(type: $type) {
        id
        label
      }
    }`,
    // Reactive variables
    variables() {
      return {
        type: this.type,
      }
    },
    // Disable the query
    skip() {
      return this.skipQuery
    },
  },
},
```

Here, `skip` will be called automatically when the `skipQuery` component property changes.

You can also access the query directly and set the `skip` property:

```javascript
this.$apollo.quries.tags.skip = true
```

### Advanced options

These are the available advanced options you can use:
- `update(data) {return ...}` to customize the value that is set in the vue property, for example if the field names don't match.
- `result(ApolloQueryResult)` is a hook called when a result is received (see documentation for [ApolloQueryResult](http://dev.apollodata.com/core/apollo-client-api.html#ApolloQueryResult)).
- `error(error)` is a hook called when there are errors, `error` being an Apollo error object with either a `graphQLErrors` property or a `networkError` property.
- `loadingKey` will update the component data property you pass as the value. You should initialize this property to `0` in the component `data()` hook. When the query is loading, this property will be incremented by 1 and as soon as it no longer is, the property will be decremented by 1. That way, the property can represent a counter of currently loading queries.
- `watchLoading(isLoading, countModifier)` is a hook called when the loading state of the query changes. The `countModifier` parameter is either equal to `1` when the query is now loading, or `-1` when the query is no longer loading.


```javascript
// Apollo-specific options
apollo: {
  // Advanced query with parameters
  // The 'variables' method is watched by vue
  pingMessage: {
    query: gql`query PingMessage($message: String!) {
      ping(message: $message)
    }`,
    // Reactive parameters
    variables() {
      // Use vue reactive properties here
      return {
          message: this.pingInput,
      }
    },
    // We use a custom update callback because
    // the field names don't match
    // By default, the 'pingMessage' attribute
    // would be used on the 'data' result object
    // Here we know the result is in the 'ping' attribute
    // considering the way the apollo server works
    update(data) {
      console.log(data)
      // The returned value will update
      // the vue property 'pingMessage'
      return data.ping
    },
    // Optional result hook
    result({ data, loader, networkStatus }) {
      console.log("We got some result!")
    },
    // Error handling
    error(error) {
      console.error('We\'ve got an error!', error)
    },
    // Loading state
    // loadingKey is the name of the data property
    // that will be incremented when the query is loading
    // and decremented when it no longer is.
    loadingKey: 'loadingQueriesCount',
    // watchLoading will be called whenever the loading state changes
    watchLoading(isLoading, countModifier) {
      // isLoading is a boolean
      // countModifier is either 1 or -1
    },
  },
},
```

If you use `ES2015`, you can also write the `update` like this:

```javascript
update: data => data.ping
```

### Reactive Query Example

Here is a reactive query example using polling:

```javascript
// Apollo-specific options
apollo: {
  // 'tags' data property on vue instance
  tags: {
    query: gql`query tagList {
      tags {
        id,
        label
      }
    }`,
    pollInterval: 300, // ms
  },
},
```

Here is how the server-side looks like:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

schema {
  query: Query
}
`

// Fake word generator
import casual from 'casual'

// Let's generate some tags
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(casual.word)
}

function addTag(label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags
    },
  },
}
```

### Manually adding a smart Query

You can manually add a smart query with the `$apollo.addSmartQuery(key, options)` method:

```javascript
created () {
  this.$apollo.addSmartQuery('comments', {
    // Same options like above
  })
}
```

*Internally, this method is called for each query entry in the component `apollo` option.*

## Mutations

Mutations are queries that changes your data state on your apollo server. For more info, visit the [apollo doc](http://dev.apollodata.com/core/apollo-client-api.html#ApolloClient\.mutate).

```javascript
methods: {
  addTag() {
    // We save the user input in case of an error
    const newTag = this.newTag
    // We clear it early to give the UI a snappy feel
    this.newTag = ''
    // Call to the graphql mutation
    this.$apollo.mutate({
      // Query
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Parameters
      variables: {
        label: newTag,
      },
      // Update the cache with the result
      // 'tagList' is the name of the query declared before
      // that will be updated with the optimistic response
      // and the result of the mutation
      updateQueries: {
        tagList: (previousResult, { mutationResult }) => {
          // We incorporate any received result (either optimistic or real)
          // into the 'tagList' query we set up earlier
          return {
            tags: [...previousResult.tags, mutationResult.data.addTag],
          }
        },
      },
      // Optimistic UI
      // Will be treated as a 'fake' result as soon as the request is made
      // so that the UI can react quickly and the user be happy
      optimisticResponse: {
        __typename: 'Mutation',
        addTag: {
          __typename: 'Tag',
          id: -1,
          label: newTag,
        },
      },
    }).then((data) => {
      // Result
      console.log(data)
    }).catch((error) => {
      // Error
      console.error(error)
      // We restore the initial user input
      this.newTag = newTag
    })
  },
},
```

Server-side:

```javascript
export const schema = `
type Tag {
  id: Int
  label: String
}

type Query {
  tags: [Tag]
}

type Mutation {
  addTag(label: String!): Tag
}

schema {
  query: Query
  mutation: Mutation
}
`

// Fake word generator
import faker from 'faker'

// Let's generate some tags
var id = 0
var tags = []
for (let i = 0; i < 42; i++) {
  addTag(faker.random.word())
}

function addTag(label) {
  let t = {
    id: id++,
    label,
  }
  tags.push(t)
  return t
}

export const resolvers = {
  Query: {
    tags(root, args, context) {
      return tags
    },
  },
  Mutation: {
    addTag(root, { label }, context) {
      console.log(`adding tag '${label}'`)
      return addTag(label)
    },
  },
}
```

## Subscriptions

*For the server implementation, you can take a look at [this simple example](https://github.com/Akryum/apollo-server-example).*

To make enable the websocket-based subscription, a bit of additional setup is required:

```javascript
import Vue from 'vue'
import { ApolloClient, createNetworkInterface } from 'apollo-client'
// New Imports
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import VueApollo from 'vue-apollo'

// Create the network interface
const networkInterface = createNetworkInterface({
  uri: 'http://localhost:3000/graphql',
  transportBatching: true,
})

// Create the subscription websocket client
const wsClient = new SubscriptionClient('ws://localhost:3000/subscriptions', {
  reconnect: true,
})

// Extend the network interface with the subscription client
const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
)

// Create the apollo client with the new network interface
const apolloClient = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true,
})

// Install the plugin like before
Vue.use(VueApollo, {
  apolloClient,
})

// Your app is now subscription-ready!

import App from './App.vue'

new Vue({
  el: '#app',
  render: h => h(App)
})

```

### subscribeToMore

If you need to update a query result from a subscription, the best way is using the `subscribeToMore` query method. You can access the queries you defined in the `apollo` option with `this.$apollo.queries.<name>`, so it would look like this:

```javascript
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

```javascript
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

### subscribe

**:warning: If you want to update a query with the result of the subscription, use `subscribeForMore`. The methods below are suitable for a 'notify' use case.**

Use the `$apollo.subscribe()` method to subscribe to a GraphQL subscription that will get killed automatically when the component is destroyed:

```javascript
mounted() {
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
    next(data) {
      console.log(data)
    },
    error(error) {
      console.error(error)
    },
  })
},
```

You can declare subscriptions in the `apollo` option with the `$subscribe` keyword:

```javascript
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
      variables() {
        // This works just like regular queries
        // and will re-subscribe with the right variables
        // each time the values change
        return {
          type: this.type,
        }
      },
      // Result hook
      result(data) {
        console.log(data)
      },
    },
  },
},
```

You can then access the subscription with `this.$apollo.subscriptions.<name>`.

*Just like queries, you can declare the subscription [with a function](#option-function), and you can declare the `query` option [with a reactive function](#reactive-query-definition).*

### Skipping the subscription

If the subscription is skipped, it will disable it and it will not be updated anymore. You can use the `skip` option:

```javascript
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
      variables() {
        return {
          type: this.type,
        }
      },
      // Result hook
      result(data) {
        // Let's update the local data
        this.tags.push(data.tagAdded)
      },
      // Skip the subscription
      skip() {
        return this.skipSubscription
      }
    },
  },
},
```

Here, `skip` will be called automatically when the `skipSubscription` component property changes.

You can also access the subscription directly and set the `skip` property:

```javascript
this.$apollo.subscriptions.tags.skip = true
```

### Manually adding a smart Subscription

You can manually add a smart subscription with the `$apollo.addSmartSubscription(key, options)` method:

```javascript
created () {
  this.$apollo.addSmartSubscription('tagAdded', {
    // Same options like '$subscribe' above
  })
}
```

*Internally, this method is called for each entry of the `$subscribe` object in the component `apollo` option.*

## Pagination with `fetchMore`

*[Here](https://github.com/Akryum/apollo-server-example/blob/master/schema.js#L21) is a simple example for the server.*

Use the `fetchMore()` method on the query:

```javascript
<template>
  <div id="app">
    <h2>Pagination</h2>
    <div class="tag-list" v-if="tagsPage">
      <div class="tag-list-item" v-for="tag in tagsPage.tags">
        {{ tag.id }} - {{ tag.label }} - {{ tag.type }}
      </div>
      <div class="actions">
        <button v-if="showMoreEnabled" @click="showMore">Show more</button>
      </div>
    </div>
  </div>
</template>

<script>
import gql from 'graphql-tag'

const pageSize = 10

export default {
  name: 'app',
  data: () => ({
    page: 0,
    showMoreEnabled: true,
  }),
  apollo: {
    // Pages
    tagsPage: {
      // GraphQL Query
      query: gql`query tagsPage ($page: Int!, $pageSize: Int!) {
        tagsPage(page: $page, size: $pageSize) {
          tags {
            id
            label
            type
          }
          hasMore
        }
      }`,
      // Initial variables
      variables: {
        page: 0,
        pageSize,
      },
    },
  },
  methods: {
    showMore() {
      this.page ++
      // Fetch more data and transform the original result
      this.$apollo.queries.tagsPage.fetchMore({
        // New variables
        variables: {
          page: this.page,
          pageSize,
        },
        // Transform the previous result with new data
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const newTags = fetchMoreResult.tagsPage.tags
          const hasMore = fetchMoreResult.tagsPage.hasMore

          this.showMoreEnabled = hasMore

          return {
            tagsPage: {
              // Merging the tag list
              tags: [...previousResult.tagsPage.tags, ...newTags],
              hasMore,
            },
          }
        },
      })
    },
  },
}
</script>
```

## Skip all

You can disable all the queries for the component with `skipAllQueries`, all the subscriptions with `skipAllSubscriptions` and both with `skipAll`:

```javascript
this.$apollo.skipAllQueries = true
this.$apollo.skipAllSubscriptions = true
this.$apollo.skipAll = true
```

You can also declare these properties in the `apollo` option of the component. It can be booleans:

```javascript
apollo: {
  $skipAll: true
}
```

Or reactive functions:

```javascript
apollo: {
  $skipAll () {
    return this.foo === 42
  }
}
```

## Multiple clients

You can specify multiple apollo clients if your app needs to connect to different GraphQL endpoints:

```javascript
const apolloProvider = new VueApollo({
  clients: {
    a: apolloClient,
    b: otherApolloClient,
  },
  defaultClient: apolloClient,
})
```

In the component `apollo` option, you can define the client for all the queries, subscriptions and mutations with `$client` (only for this component):

```javascript
export default {
  apollo: {
    $client: 'b',
  },
}
```

You can also specify the client in individual queries, subscriptions and mutations with the `client` property in the options:

```javascript
tags: {
  query: gql`...`,
  client: 'b',
}
```

## Server-Side Rendering

(Work in progress)

Use `apolloProvider.collect()` to being collect queries made against this provider. You get a function that returns a promise when all queries collected are ready. Note that the provider stops collecting queries when you call the function.

```javascript
const ensureReady = apolloProvider.collect({
  // If set to false, may resolve when partial/cache result is emitted
  waitForLoaded: true, // default
})

new Vue({
  el: '#app',
  apolloProvider,
  render: h => h(App),
})

ensureReady().then(results => {
  console.log(results.length, 'queries ready')
})
```

[White paper](./ssr.js)

---

LICENCE ISC - Created by Guillaume CHAU (@Akryum)
