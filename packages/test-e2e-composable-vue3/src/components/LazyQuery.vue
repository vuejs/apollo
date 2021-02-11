<script lang="ts">
import { gql } from '@apollo/client/core'
import { useLazyQuery, useResult } from '@vue/apollo-composable'
import { defineComponent } from 'vue'

export default defineComponent({
  setup () {
    const { result, load } = useLazyQuery(gql`
      query list {
        list
      }
    `)
    const list = useResult(result, [])

    return {
      load,
      list,
    }
  },
})
</script>

<template>
  <div class="m-6">
    <button
      class="bg-green-200 rounded-lg p-4"
      @click="load()"
    >
      Load list
    </button>

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
