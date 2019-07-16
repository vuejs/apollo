# ApolloSubscribeToMore component

Example:

```vue
<template>
  <ApolloQuery :query="...">
    <ApolloSubscribeToMore
      :document="gql => gql`
        subscription messageChanged ($channelId: ID!) {
          messageAdded (channelId: $channelId) {
            type
            message {
              id
              text
            }
          }
        }
      `"
      :variables="{ channelId }"
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

## Props

- `document`: GraphQL document that contains the subscription or a function that receives the `gql` tag as argument and should return the transformed document.
- `variables`: Object which will automatically update the subscription variables.
- `updateQuery`: Function to update the query result if needed.
