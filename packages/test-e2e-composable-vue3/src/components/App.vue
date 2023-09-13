<script lang="ts" setup>
import { computed } from 'vue'
import ChannelList from './ChannelList.vue'
import GlobalLoading from './GlobalLoading.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const displayChannels = computed(() => !route.matched.some(r => r.meta?.layout === 'blank'))
</script>

<template>
  <GlobalLoading />
  <div class="flex h-screen items-stretch bg-gray-100">
    <ChannelList
      v-if="displayChannels"
      class="w-1/4 border-r border-gray-200"
    />
    <router-view class="flex-1 overflow-auto" />
  </div>
</template>
