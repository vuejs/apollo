<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
})
</script>

<template>
  <div>
    <div class="inline-block bg-green-100 border border-green-200 rounded-2xl px-4 py-2">
      {{ message.text }}
    </div>
  </div>
</template>
