<script lang="ts" setup>
import { useChannels } from '@/stores/channel'

const channelStore = useChannels()
</script>

<template>
  <div
    v-if="channelStore.loading"
    class="p-12 text-gray-500"
  >
    Loading channels...
  </div>

  <div
    v-else
    class="flex flex-col bg-white"
  >
    <router-link
      v-for="channel of channelStore.channels"
      :key="channel.id"
      v-slot="{ href, navigate, isActive }"
      :to="{
        name: 'channel',
        params: {
          id: channel.id,
        },
      }"
      custom
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
