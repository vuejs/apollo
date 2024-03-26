<script lang="ts" setup>
import { ref } from 'vue'

import ChannelListPinia from './ChannelListPinia.vue'

const isComponentVisible = ref(true)
</script>

<template>
  <div>
    <button
      data-test-id="channel-list-toggle"
      @click="isComponentVisible = !isComponentVisible"
    >
      Toggle ChannelListPinia component
    </button>

    <div
      v-if="isComponentVisible"
      data-test-id="channel-list-container"
    >
      <ChannelListPinia />
    </div>
  </div>
</template>
