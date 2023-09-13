<script lang="ts" setup>
import { useGlobalQueryLoading } from '@vue/apollo-composable'

const loading = useGlobalQueryLoading()
</script>

<template>
  <div
    class="fixed bg-white p-4 rounded-br top-0 right-0"
    data-test-id="global-loading"
  >
    <div v-if="loading">
      Global loading...
    </div>
  </div>
</template>
