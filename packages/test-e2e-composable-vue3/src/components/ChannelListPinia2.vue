<script lang="ts" setup>
import { useChannels } from '@/stores/channel'
import { onBeforeUnmount, ref, watch } from 'vue'

const channels = ref<any[]>([])

let unwatch: (() => void) | undefined
setTimeout(() => {
  const channelStore = useChannels()
  unwatch = watch(() => channelStore.channels, (newChannels) => {
    channels.value = newChannels
  }, {
    immediate: true,
  })
}, 0)

onBeforeUnmount(() => {
  unwatch?.()
})
</script>

<template>
  <div
    v-if="channels"
    class="flex flex-col bg-white"
  >
    <router-link
      v-for="channel of channels"
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
