<template>
  <div v-if="loading">Loading...</div>
  <div v-else class="messages">
    {{ messages.length }} messages
  </div>
</template>

<script>
import { useQuery, useResult, useQueryLoading } from '@vue/apollo-composable'
import MESSAGES from '../graphql/Messages.gql'

export default {
  setup () {
    const { result } = useQuery(MESSAGES)
    const messages = useResult(result, [])
    return {
      messages,
      loading: useQueryLoading()
    }
  }
}
</script>
