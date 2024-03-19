<script lang="ts" setup>
import { useSubscription } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { ref } from 'vue'

const messages = ref<Array<{ id: string, text: string }>>([])

const { onResult } = useSubscription(gql`subscription OnMessageAdded {
  messageAdded(channelId: "general") {
    id
    text
  }
}`)

onResult((result) => {
  console.log(result.data?.messageAdded)
  if (result.data?.messageAdded) {
    messages.value.push(result.data.messageAdded)
  }
})
</script>

<template>
  <div class="space-y-2 p-2 border border-gray-200 rounded-xl">
    <div
      v-for="message in messages"
      :key="message.id"
      class="message px-4 py-2 bg-white rounded-lg"
    >
      {{ message.text }}
    </div>

    <div v-if="!messages.length">
      No messages yet
    </div>
  </div>
</template>
