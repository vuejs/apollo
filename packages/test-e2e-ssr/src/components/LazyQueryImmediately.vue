<script lang="ts">
import gql from 'graphql-tag'
import { useLazyQuery } from '@vue/apollo-composable'
import { defineComponent, computed } from 'vue'

export default defineComponent({
  setup () {
    const { result, loading, load } = useLazyQuery(gql`
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
    const channel = computed(() => result.value?.channel)

    load(undefined, {
      id: 'general',
    })

    return {
      loading,
      channel,
    }
  },
})
</script>

<template>
  <div class="m-6">
    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>

    <div v-if="channel">
      <div>Loaded channel: {{ channel.label }}</div>
      <div>Messages: {{ channel.messages.length }}</div>

      <div v-for="message in channel.messages" :key="message.id" class="message">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>
