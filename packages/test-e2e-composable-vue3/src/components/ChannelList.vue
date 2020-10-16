<script lang="ts">
import { gql } from '@apollo/client/core'
import { useQuery, useResult } from '@vue/apollo-composable'
import { defineComponent } from 'vue'

interface Channel {
  id: string;
  label: string;
}

export default defineComponent({
  setup () {
    const { result, loading } = useQuery<{ channels: Channel[] }>(gql`
      query channels {
        channels {
          id
          label
        }
      }
    `)
    const channels = useResult(result, [])

    return {
      loading,
      channels,
    }
  },
})
</script>

<template>
  <div v-if="loading" class="p-12 text-gray-500">
    Loading channels...
  </div>

  <div v-else class="flex flex-col bg-white">
    <router-link
      v-for="channel of channels"
      :key="channel.id"
      :to="{
        name: 'channel',
        params: {
          id: channel.id,
        },
      }"
      custom
      #default="{ href, navigate, isActive }"
    >
      <a
        :href="href"
        class="channel-link px-4 py-2 hover:bg-green-100 text-green-700"
        :class="{
          'bg-green-200 hover:bg-green-300 text-green-900': isActive,
        }"
        @click="navigate"
      >
        # {{ channel.label }}
      </a>
    </router-link>
  </div>
</template>
