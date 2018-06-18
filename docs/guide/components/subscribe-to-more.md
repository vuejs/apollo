# ApolloSubscribeToMore

You can subscribe to more data with the `ApolloSubscribeToMore` (or `apollo-subscribe-to-more`) component. You can put as many of those as you want inside a `<ApolloQuery>` component.

::: tip
If the update is related to an existing object (for example, changing the value of a field), `updateQuery` is not required as Apollo client will be able to update the cache automatically.
:::

Here is an example:

```vue
<template>
  <ApolloQuery :query="...">
    <ApolloSubscribeToMore
      :document="require('../gql/MessageAdded.gql')"
      :variables="{ channel }"
      :updateQuery="onMessageAdded"
    />

    <!-- ... -->
  </ApolloQuery>
</template>

<script>
export default {
  data () {
    return {
      channel: 'general',
    }
  },

  methods: {
    onMessageAdded (previousResult, { subscriptionData }) {
      // The previous result is immutable
      const newResult = {
        messages: [...previousResult.messages],
      }
      // Add the question to the list
      newResult.messages.push(subscriptionData.data.messageAdded)
      return newResult
    },
  },
}
</script>
```

See [API Reference](../../api/apollo-subscribe-to-more.md).

## Examples of `updateQuery`

Add a new item to the cache:

```js
methods: {
  onMessageAdded (previousResult, { subscriptionData }) {
    // The previous result is immutable
    const newResult = {
      messages: [...previousResult.messages],
    }
    // Add the question to the list
    newResult.messages.push(subscriptionData.data.messageAdded)
    return newResult
  }
}
```

Remove an item to the cache:

```js
methods: {
  onMessageAdded (previousResult, { subscriptionData }) {
    const removedMessage = subscriptionData.data.messageRemoved
    const index = previousResult.messages.findIndex(
      m => m.id === removedMessage.id
    )

    if (index === -1) return previousResult

    // The previous result is immutable
    const newResult = {
      messages: [...previousResult.messages],
    }
    // Remove the question from the list
    newResult.messages.splice(index, 1)
    return newResult
  }
}
```
