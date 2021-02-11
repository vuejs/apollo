<template>
  <div class="flex h-screen items-stretch bg-gray-100">
    <ChannelList class="w-1/4 border-r border-gray-200" />
    <router-view class="flex-1 overflow-auto" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChannelList from './ChannelList.vue'

export default defineComponent({
  name: 'App',

  components: {
    ChannelList,
  },
})
</script>
