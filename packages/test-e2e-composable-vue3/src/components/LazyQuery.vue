<script lang="ts">
import gql from 'graphql-tag'
import { useLazyQuery } from '@vue/apollo-composable'
import { defineComponent, computed, ref } from 'vue'

export default defineComponent({
  setup () {
    const { result, loading, load, refetch } = useLazyQuery(gql`
      query list {
        list
      }
    `)
    const list = computed(() => result.value?.list ?? [])

    const refetched = ref(false)

    function r () {
      refetched.value = true
      refetch()
    }

    function loadOrRefetch () {
      load() || r()
    }

    return {
      loadOrRefetch,
      loading,
      list,
      refetched,
    }
  },
})
</script>

<template>
  <div class="m-6">
    <div>
      <button
        class="bg-green-200 rounded-lg p-4"
        @click="loadOrRefetch()"
      >
        Load list
      </button>

      <span data-test-id="refetched">
        Refetched: {{ refetched }}
      </span>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>

    <ul class="my-4">
      <li
        v-for="(item, index) of list"
        :key="index"
        class="list-disc ml-6"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>
