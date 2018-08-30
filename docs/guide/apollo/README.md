# Apollo in Vue components

To declare apollo queries in your Vue component, add an `apollo` object :

```js
new Vue({
    apollo: {
        // Apollo specific options
    },
})
```

You can access the [apollo-client](https://www.apollographql.com/docs/react/) instances with `this.$apollo.provider.defaultClient` or `this.$apollo.provider.clients.<key>` (for [Multiple clients](../multiple-clients.md)) in all your vue components.

## Queries

In the `apollo` object, add an attribute for each property you want to feed with the result of an Apollo query.

```js
import gql from 'graphql-tag'

export default {
  apollo: {
    // Simple query that will update the 'hello' vue property
    hello: gql`query { hello }`,
  },
}
```

More details in the [Queries section](./queries.md).

## Mutations

Use `this.$apollo.mutate` to send mutations:

```js
methods: {
  async addTag() {
    // Call to the graphql mutation
    const result = await this.$apollo.mutate({
      // Query
      mutation: gql`mutation ($label: String!) {
        addTag(label: $label) {
          id
          label
        }
      }`,
      // Parameters
      variables: {
        label: this.newTag,
      },
    })
  }
}
```

More details in the [Mutations section](./mutations.md).

## Special options

The special options begin with `$` in the `apollo` object.

- `$skip` to disable all queries and subscriptions (see below)
- `$skipAllQueries` to disable all queries (see below)
- `$skipAllSubscriptions` to disable all subscriptions (see below)
- `$deep` to watch with `deep: true` on the properties above when a function is provided
- `$error` to catch errors in a default handler (see `error` advanced options for smart queries)
- `$query` to apply default options to all the queries in the component

Example:

```vue
<script>
export default {
  data () {
    return {
      loading: 0,
    }
  },
  apollo: {
    $query: {
      loadingKey: 'loading',
    },
    query1: { ... },
    query2: { ... },
  },
}
</script>
```

You can define in the apollo provider a default set of options to apply to the `apollo` definitions. For example:

```js
const apolloProvider = new VueApollo({
  defaultClient: apolloClient,
  defaultOptions: {
    // apollo options applied to all queries in components
    $query: {
      loadingKey: 'loading',
      fetchPolicy: 'cache-and-network',
    },
  },
})
```

## Skip all

You can disable all the queries for the component with `skipAllQueries`, all the subscriptions with `skipAllSubscriptions` and both with `skipAll`:

```js
this.$apollo.skipAllQueries = true
this.$apollo.skipAllSubscriptions = true
this.$apollo.skipAll = true
```

You can also declare these properties in the `apollo` option of the component. They can be booleans:

```js
apollo: {
  $skipAll: true
}
```

Or reactive functions:

```js
apollo: {
  $skipAll () {
    return this.foo === 42
  }
}
```