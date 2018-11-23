# Usage in Vue components

To declare apollo queries in your Vue component, add an `apollo` object :

```js
new Vue({
  apollo: {
    // Apollo specific options
  },
})
```

In a `.vue` file:

```vue
<template>
  <div>My component</div>
</template>

<script>
export default {
  apollo: {
    // Vue-Apollo options here
  }
}
</script>
```

## $apollo

All the components under the one which has the `apolloProvider` option have an `$apollo` helper available. This is the glue between your component and Apollo and it does all the heavy lifting for you (including automatic updates and teardowns).

You can access the [apollo-client](https://www.apollographql.com/docs/react/) instances with `this.$apollo.provider.defaultClient` or `this.$apollo.provider.clients.<key>` (for [Multiple clients](../multiple-clients.md)) in all your vue components.

If you are curious, see [$apollo API](../../api/dollar-apollo.md).

## Queries

In the `apollo` object, add an attribute for each property you want to feed with the result of an Apollo query.

```vue
<template>
  <div>{{ hello }}</div>
</template>

<script>
import gql from 'graphql-tag'

export default {
  apollo: {
    // Simple query that will update the 'hello' vue property
    hello: gql`query {
      hello
    }`,
  },
}
</script>
```

Learn more in the [Queries section](./queries.md).

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

Learn more in the [Mutations section](./mutations.md).

## Special options

The special options begin with `$` in the `apollo` object.

Learn more in the [Special options section](./special-options.md).
