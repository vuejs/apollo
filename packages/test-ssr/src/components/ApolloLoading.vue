<template>
  <div v-if="$apollo.queries.messages.loading">Loading...</div>
  <div v-else class="messages">
    {{ messages.length }} messages
  </div>
</template>

<script>
import MESSAGES from '../graphql/Messages.gql'

export default {
  apollo: {
    messages: MESSAGES
  }
}
</script>
