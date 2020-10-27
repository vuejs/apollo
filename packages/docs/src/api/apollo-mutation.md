# ApolloMutation component

This component allows you to send mutations from your template.

Use [props](#props) to configure the component and the default [slot](#slot-props) to interact with it.

Example:

```vue
<ApolloMutation
  :mutation="gql => gql`
    mutation DoStuff ($name: String!) {
      someWork (name: $name) {
        success
        timeSpent
      }
    }
  `"
  :variables="{
    name
  }"
  @done="onDone"
>
  <template v-slot="{ mutate, loading, error }">
    <button :disabled="loading" @click="mutate()">Click me</button>
    <p v-if="error">An error occurred: {{ error }}</p>
  </template>
</ApolloMutation>
```

## Props

### mutation

GraphQL query (transformed by `graphql-tag`) or a function that receives the `gql` tag as argument and should return the transformed query.

```vue
<ApolloMutation
  :mutation="gql => gql`
    mutation DoStuff ($name: String!) {
      someWork (name: $name) {
        success
        timeSpent
      }
    }
  `"
/>
```

### variables

Object of GraphQL variables.

```vue
<ApolloMutation
  :variables="{
    name
  }"
/>
```

### optimisticResponse

Optimistic UI is a pattern that you can use to simulate the results of a mutation and update the UI even before receiving a response from the server. Once the response is received from the server, the optimistic result is thrown away and replaced with the actual result.

Optimistic UI provides an easy way to make your UI respond much faster, while ensuring that the data becomes consistent with the actual response when it arrives.

See [optimistic UI](https://www.apollographql.com/docs/react/performance/optimistic-ui/)

```vue
<ApolloMutation
  :optimisticResponse="{
    __typename: 'Mutation',
    someWork: {
      __typename: 'SomeWorkPayload',
      success: true,
      timeSpent: 100,
    },
  }"
/>
```

### update

When you execute a mutation, you modify back-end data. If that data is also present in your [Apollo Client cache](https://www.apollographql.com/docs/react/caching/cache-configuration/), you might need to update your cache to reflect the result of the mutation.

If a mutation modifies multiple entities, or if it creates or deletes entities, the Apollo Client cache is not automatically updated to reflect the result of the mutation. To resolve this, you can include an `update` function.

The purpose of an update function is to modify your cached data to match the modifications that a mutation makes to your back-end data.

See [updating cache after mutation](https://www.apollographql.com/docs/react/data/mutations/#updating-the-cache-after-a-mutation)

```vue
<template>
  <ApolloMutation
    :update="update"
  />
</template>

<script>
export default {
  methods: {
    update(cache, { data: { addTodo } }) {
      cache.modify({
        fields: {
          todos(existingTodos = []) {
            const newTodoRef = cache.writeFragment({
              data: addTodo,
              fragment: gql`
                fragment NewTodo on Todo {
                  id
                  type
                }
              `,
            })
            return [...existingTodos, newTodoRef]
          },
        },
      })
    },
  },
}
</script>
```

### refetchQueries

In some cases, just using `dataIdFromObject` is not enough for your application UI to update correctly. For example, if you want to add something to a list of objects without refetching the entire list, or if there are some objects that to which you can't assign an object identifier, Apollo Client cannot update existing queries for you. Read on to learn about the other tools at your disposal.

`refetchQueries` is the simplest way of updating the cache. With `refetchQueries` you can specify one or more queries that you want to run after a mutation is completed in order to refetch the parts of the store that may have been affected by the mutation.

See [refetching queries after mutation](https://www.apollographql.com/docs/react/caching/advanced-topics/#updating-after-a-mutation)

```vue
<template>
  <ApolloMutation
    :refetchQueries="refetchQueriesAfterMyMutation"
  />
</template>

<script>
import { gql } from '@apollo/client/core'

export default {
  computed: {
    refetchQueriesAfterMyMutation () {
      return [{
        query: gql`
          query UpdateCache($repoName: String!) {
            entry(repoFullName: $repoName) {
              id
              comments {
                postedBy {
                  login
                  html_url
                }
                createdAt
                content
              }
            }
          }
        `,
        variables: { repoName: 'apollographql/apollo-client' },
      }]
    },
  },
}
</script>
```

### clientId

Id of the Apollo Client used by the query (defined in ApolloProvider `clients` option)

```vue
<ApolloMutation
  clientId="myClient"
/>
```

### tag

String HTML tag name (default: `div`); if `undefined`, the component will be renderless (the content won't be wrapped in a tag)

```vue
<ApolloMutation
  tag="span"
/>
```

### context

Pass down the Apollo link chain a context object.

See [apollo context](https://www.apollographql.com/docs/react/api/link/apollo-link-context/)

```vue
<ApolloMutation
  :context="{
    answer: 42,
  }"
/>
```

## Slot props

### mutate

Signature:

```ts
mutate(options = null): Promise<FetchResult>
```

- `options`: [mutation options](https://www.apollographql.com/docs/react/api/core/ApolloClient/#ApolloClient.mutate).

Function to call the mutation. You can override the mutation options (for example: `mutate({ variables: { foo: 'bar } })`).

```vue
<ApolloMutation>
  <template v-slot="{ mutate }">
    <button @click="mutate({ variables: { myVar: 42 } })">Click me</button>
  </template>
</ApolloMutation>
```

### loading

Boolean indicating that the request is in flight.

```vue
<ApolloMutation>
  <template v-slot="{ loading }">
    <button :disabled="loading">Click me</button>
  </template>
</ApolloMutation>
```

### error

Eventual error for the last mutation call.

```vue
<ApolloMutation>
  <template v-slot="{ error }">
    <p v-if="error">An error occurred: {{ error }}</p>
  </template>
</ApolloMutation>
```

### gqlError

First GraphQL error if any.

```vue
<ApolloMutation>
  <template v-slot="{ gqlError }">
    <p v-if="gqlError">An error occurred: {{ gqlError.message }}</p>
  </template>
</ApolloMutation>
```

## Events

### done

Emitted when a mutation result is received.

Parameters:

- `result`: FetchResult

```vue
<ApolloMutation
  @done="result => {}"
/>
```

### error

Emitted when a error occurs.

Parameters:

- `error`: Error object

```vue
<ApolloMutation
  @error="error => {}"
/>
```

### loading

When the loading state changes, the `loading` event is emitted.

Parameters:

- `loading`: Boolean

```vue
<ApolloMutation
  @loading="loading => {}"
/>
```
