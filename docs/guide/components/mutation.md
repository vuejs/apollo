# ApolloMutation

You can use the `ApolloMutation` (or `apollo-mutation`) component to call Apollo mutations directly in your template.

Here is an example:

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
    <p v-if="error">An error occured: {{ error }}</p>
  </template>
</ApolloMutation>
```

See [ApolloQuery](./query.md) to learn how to write GraphQL queries in the template.

See [API Reference](../../api/apollo-mutation.md) for all the available options.

## Updating the cache

If the mutation is only updating objects you already have in the cache (for example, editing existing fields), you don't need to do anything as Apollo Client will update the cache automatically. This works only if the object in the mutation result contains the `__typename` and `id` fields (or the custom fields you use to [normalize the cache](https://www.apollographql.com/docs/react/advanced/caching#normalization)).

Otherwise, you need to tell Apollo Client how to update the cache with the mutation result. For example, if the mutation adds a new item, you have to update the relevent query result to effectively push this new items to the query.

### Adding an item

```vue
<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation ($input: SendMessageToThreadInput!) {
        sendMessageToThread (input: $input) {
          message {
            ...message
          }
        }
      }
      ${$options.fragments.message}
    `"
    :variables="{
      threadId,
      text
    }"
    :update="updateCache"
  >
    <!-- Form here -->
  </ApolloMutation>
</template>

<script>
import gql from 'gql-tag'

const fragments = {
  message: gql`
    fragment message on Message {
      id
      text
      user {
        id
        name
      }
    }
  `
}

export default {
  fragments,

  props: {
    threadId: {
      type: String,
      required: true
    }
  },

  methods: {
    updateCache (store, { data: { sendMessageToThread } }) {
      const query = {
        query: gql`
        query ($threadId: ID!) {
          thread (id: $threadId) {
            id
            messages {
              ...message
            }
          }
        }
        ${fragments.message}
        `,
        variables: {
          threadId: this.threadId,
        },
      }
      // Read the query from cache
      const data = store.readQuery(query)
      // Mutate cache result
      data.thread.messages.push(sendMessageToThread.message)
      // Write back to the cache
      store.writeQuery({
        ...query,
        data,
      })
    },
  }
}
</script>
```

### Removing an item

```vue
<template>
  <ApolloMutation
    :mutation="gql => gql`
      mutation ($input: DeleteMessageFromThreadInput!) {
        deleteMessageFromThread (input: $input) {
          success
        }
      }
    `"
    :variables="{
      threadId,
      messageId
    }"
    :update="updateCache"
  >
    <!-- Form here -->
  </ApolloMutation>
</template>

<script>
import gql from 'gql-tag'

const fragments = {
  message: gql`
    fragment message on Message {
      id
      text
      user {
        id
        name
      }
    }
  `
}

export default {
  fragments,

  props: {
    threadId: {
      type: String,
      required: true
    },
    messageId: {
      type: String,
      required: true
    }
  },

  methods: {
    updateCache (store, { data: { deleteMessageFromThread } }) {
      const query = {
        query: gql`
        query ($threadId: ID!) {
          thread (id: $threadId) {
            id
            messages {
              ...message
            }
          }
        }
        ${fragments.message}
        `,
        variables: {
          threadId: this.threadId,
        },
      }
      // Read the query from cache
      const data = store.readQuery(query)
      // Look for the deleted item
      const index = data.thread.messages.findIndex(m => m.id === this.messageId)
      if (index !== -1) {
        // Mutate cache result
        data.thread.messages.splice(index, 1)
        // Write back to the cache
        store.writeQuery({
          ...query,
          data,
        })
      }
    },
  }
}
</script>
```
