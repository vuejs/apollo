<script setup lang="ts">
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import { API_FLAVORS } from '../../apiFlavors.ts'
import { useApiFlavor } from '../composables/useApiFlavor.ts'

const route = useRoute()
const flavor = useApiFlavor()

const apiFlavorCount = API_FLAVORS.length

const hasFlavors = computed(() => !/^\/api\/(?:composable|components)\//.test(route.path))
</script>

<template>
  <div v-if="hasFlavors" class="api-preference">
    <div
      class="api-preference__group"
      role="radiogroup"
      aria-label="API style the documentation is written in"
    >
      <span class="api-preference__thumb" aria-hidden="true" />
      <button
        v-for="option in API_FLAVORS"
        :key="option.value"
        type="button"
        role="radio"
        class="api-preference__option"
        :data-flavor="option.value"
        :aria-checked="flavor === option.value"
        @click="flavor = option.value"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.api-preference {
  --api-flavor-count: v-bind(apiFlavorCount);
}
</style>
