<script lang="ts" setup>
import { ref } from 'vue'
import OnResultChild from './OnResultChild.vue'

const visible = ref(false)
</script>

<template>
  <div class="m-6">
    <div>
      <label>
        <input
          v-model="visible"
          type="checkbox"
        >
        Show child component
      </label>
    </div>

    <div v-if="visible">
      <OnResultChild />
    </div>
  </div>
</template>
