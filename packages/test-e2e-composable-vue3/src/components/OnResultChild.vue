<script lang="ts" setup>
import { useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ref } from 'vue'

const { onResult, loading } = useQuery(gql`
  query channel ($id: ID!) {
    channel (id: $id) {
      id
      label
      messages {
        id
        text
      }
    }
  }
`, {
  id: 'general',
})

const channel = ref<any>(null)

onResult((result) => {
  channel.value = result.data?.channel
})
</script>

<template>
  <div class="m-6 border border-green-500 rounded">
    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>

    <div
      v-if="channel"
      data-test-id="data"
    >
      <div>Loaded channel: {{ channel.label }}</div>
      <div>Messages: {{ channel.messages.length }}</div>
    </div>
  </div>
</template>
