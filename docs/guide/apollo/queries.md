# Queries

In GraphQL, a query is a request made to the API to retrieve data. It is represented with a *GraphQL document* like this:

```graphql
query myHelloQueryName {
  hello
}
```

In the `apollo` object, add an attribute for each property you want to feed with the result of an Apollo query. Each one of them will become a Smart Query.

## Simple query

Use `gql` to write your GraphQL queries:

```js
import gql from 'graphql-tag'
```

Put the [gql](https://github.com/apollographql/graphql-tag) query directly as the value:

```js
apollo: {
  // Simple query that will update the 'hello' vue property
  hello: gql`{hello}`,
},
```

You can then access the query with `this.$apollo.queries.<name>`.

You can initialize the property in your vue component's `data` hook:

```js
data () {
  return {
    // Initialize your apollo data
    hello: '',
  },
},
```

Server-side, add the corresponding schema and resolver:

```js
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

For more info, visit the [apollo doc](https://www.apollographql.com/docs/apollo-server/).

You can then use your property as usual in your vue component:

```vue
<template>
  <div class="apollo">
    <h3>Hello</h3>
    <p>
      {{hello}}
    </p>
  </div>
</template>
```

## Query with parameters

You can add variables (read parameters) to your `gql` query by declaring `query` and `variables` in an object:

```js
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

See the [apollo doc](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery) for more details.

For example, you could add the `fetchPolicy` apollo option like this:

```js
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

```js
data () {
  return {
    // Initialize your apollo data
    ping: '',
  }
},
```

Server-side, add the corresponding schema and resolver:

```js
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

```vue
<template>
  <div class="apollo">
    <h3>Ping</h3>
    <p>
      {{ ping }}
    </p>
  </div>
</template>
```

## Loading state

You can display a loading state thanks to the `$apollo.loading` prop:

```vue
<div v-if="$apollo.loading">Loading...</div>
```

Or for this specific `ping` query:

```vue
<div v-if="$apollo.queries.ping.loading">Loading...</div>
```

## Option function

You can use a function which will be called once when the component is created and it must return the option object:

```js
// Apollo-specific options
apollo: {
  // Query with parameters
  ping () {
    // This is called once when the component is created
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

::: tip
This also works for [subscriptions](./subscriptions.md).
:::

## Reactive query definition

You can use a function for the `query` option. This will update the graphql query definition automatically:

```js
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

::: tip
This also works for [subscriptions](./subscriptions.md).
:::

## Reactive parameters

Use a function instead to make the parameters reactive with vue properties:

```js
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

```vue
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

## Skipping the query

If the query is skipped, it will disable it and the result will not be updated anymore. You can use the `skip` option:

```js
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

```js
this.$apollo.queries.tags.skip = true
```

## Reactive Query Example

Here is a reactive query example using polling:

```js
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

```js
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

## Manually adding a smart Query

You can manually add a smart query with the `$apollo.addSmartQuery(key, options)` method:

```js
created () {
  this.$apollo.addSmartQuery('comments', {
    // Same options like above
  })
}
```

::: tip
Internally, this method is called for each query entry in the component `apollo` option.
:::

## Advanced options

There are even more options specific to vue-apollo, see the [API Reference](../../api/smart-query.md).
