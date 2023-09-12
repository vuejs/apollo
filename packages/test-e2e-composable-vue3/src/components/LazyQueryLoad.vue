<script lang="ts" setup>
import gql from 'graphql-tag'
import { useLazyQuery } from '@vue/apollo-composable'
import { ref } from 'vue'

const { load } = useLazyQuery<{ list: string[] }>(gql`
  query list {
    list
  }
`)

const result = ref<any>(null)

async function myLoad () {
  const r = await load()
  if (r) {
    result.value = r.list
  }
}
</script>

<template>
  <div class="m-6">
    <div>
      <button
        class="bg-green-200 rounded-lg p-4"
        @click="myLoad()"
      >
        Load list
      </button>
    </div>

    <div
      v-if="result"
      class="result"
    >
      Loaded {{ result.length }}
    </div>
  </div>
</template>
