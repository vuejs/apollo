<script lang="ts" setup>
import { useApolloClient, useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { computed, ref } from 'vue'
import MessageItem from './MessageItem.vue'

interface Channel {
  id: string
  label: string
}

const keepPreviousResult = ref(false)

const channelsQuery = useQuery<{ channels: Channel[] }>(gql`
  query channels {
    channels {
      id
      label
    }
  }
`)

const channels = computed(() => channelsQuery.result.value?.channels ?? [])

const selectedChannelId = ref<string | null>(null)

const selectedChannelQuery = useQuery(gql`
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
`, () => ({
  id: selectedChannelId.value,
}), () => ({
  enabled: !!selectedChannelId.value,
  fetchPolicy: 'cache-and-network',
  keepPreviousResult: keepPreviousResult.value,
}))

const selectedChannel = computed(() => selectedChannelQuery.result.value?.channel)

const { client: apolloClient } = useApolloClient()

function clearCache () {
  apolloClient.clearStore()
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="p-4">
      <label>
        <input
          v-model="keepPreviousResult"
          type="checkbox"
        >
        keepPreviousResult
      </label>

      <button
        class="ml-4 underline"
        @click="clearCache"
      >
        Clear cache
      </button>
    </div>

    <div class="flex h-full">
      <div class="flex flex-col">
        <button
          v-for="channel of channels"
          :key="channel.id"
          class="channel-btn p-4"
          :class="{
            'bg-green-200': selectedChannelId === channel.id,
          }"
          @click="selectedChannelId = channel.id"
        >
          {{ channel.label }}
        </button>
      </div>

      <div
        v-if="selectedChannel"
        class="the-channel flex flex-col w-full h-full overflow-auto"
      >
        <div class="flex-none p-6 border-b border-gray-200 bg-white">
          # {{ selectedChannel.label }}
        </div>

        <div class="flex-1 overflow-y-auto">
          <MessageItem
            v-for="message of selectedChannel.messages"
            :key="message.id"
            :message="message"
            class="m-2"
          />
        </div>
      </div>

      <div
        v-else
        class="no-data"
      >
        No data
      </div>
    </div>
  </div>
</template>
