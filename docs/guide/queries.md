# Queries

In the `apollo` object, add an attribute for each property you want to feed with the result of an Apollo query.

## Simple query

Use `gql` to write your GraphQL queries:

```javascript
import gql from 'graphql-tag'
```

Put the [gql](https://github.com/apollographql/graphql-tag) query directly as the value:

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

For more info, visit the [apollo doc](https://www.apollographql.com/docs/apollo-server/).

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

## Query with parameters

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

See the [apollo doc](https://www.apollographql.com/docs/react/api/apollo-client.html#ApolloClient.watchQuery) for more details.

For example, you could add the `fetchPolicy` apollo option like this:

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
      {{ ping }}
    </p>
  </div>
</template>
```

## Loading state

You can display a loading state thanks to the `$apollo.loading` prop:

```html
<div v-if="$apollo.loading">Loading...</div>
```

Or for this specific `ping` query:

```html
<div v-if="$apollo.queries.ping.loading">Loading...</div>
```

## Option function

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

**This will be called once when the component is created and it must return the option object.**

*This also works for [subscriptions](#subscriptions).*

## Reactive query definition

You can use a function for the `query` option. This will update the graphql query definition automatically:

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

## Reactive parameters

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

## Skipping the query

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
this.$apollo.queries.tags.skip = true
```

## Advanced options

These are the available advanced options you can use:
- `update(data) {return ...}` to customize the value that is set in the vue property, for example if the field names don't match.
- `result(ApolloQueryResult)` is a hook called when a result is received (see documentation for [ApolloQueryResult](https://github.com/apollographql/apollo-client/blob/master/packages/apollo-client/src/core/types.ts)).
- `error(error)` is a hook called when there are errors. `error` is an Apollo error object with either a `graphQLErrors` property or a `networkError` property.
- `loadingKey` will update the component data property you pass as the value. You should initialize this property to `0` in the component `data()` hook. When the query is loading, this property will be incremented by 1; when it is no longer loading, it will be decremented by 1. That way, the property can represent a counter of currently loading queries.
- `watchLoading(isLoading, countModifier)` is a hook called when the loading state of the query changes. The `countModifier` parameter is either equal to `1` when the query is loading, or `-1` when the query is no longer loading.
- `manual` is a boolean to disable the automatic property update. If you use it, you then need to specify a `result` callback (see example below).
- `deep` is a boolean to use `deep: true` on Vue watchers.


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
    // Variables: deep object watch
    deep: false,
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
    result({ data, loading, networkStatus }) {
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

Manual mode example:

```javascript
{
  query: gql`...`,
  manual: true,
  result ({ data, loading }) {
    if (!loading) {
      this.items = data.items
    }
  },
}
```

## Reactive Query Example

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

## Manually adding a smart Query

You can manually add a smart query with the `$apollo.addSmartQuery(key, options)` method:

```javascript
created () {
  this.$apollo.addSmartQuery('comments', {
    // Same options like above
  })
}
```

*Internally, this method is called for each query entry in the component `apollo` option.*