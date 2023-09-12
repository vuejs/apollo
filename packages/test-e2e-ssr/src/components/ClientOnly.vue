<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const displayed = ref(false)

onMounted(() => {
  displayed.value = true
})
</script>

<template>
  <slot v-if="displayed" />
</template>
