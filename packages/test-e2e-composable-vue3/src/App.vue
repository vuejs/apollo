<template>
  <ChannelList />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import ChannelList from './components/ChannelList.vue'

export default defineComponent({
  name: 'App',

  components: {
    ChannelList,
  },
})
</script>
