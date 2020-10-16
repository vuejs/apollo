<script lang="ts">
import { gql } from '@apollo/client/core'
import { useQuery, useResult } from '@vue/apollo-composable'
import { defineComponent } from 'vue'

interface Channel {
  id: string;
  label: string;
}

export default defineComponent({
  setup () {
    const { result, loading } = useQuery<{ channels: Channel[] }>(gql`
      query channels {
        channels {
          id
          label
        }
      }
    `)
    const channels = useResult(result, [])

    return {
      loading,
      channels,
    }
  },
})
</script>

<template>
  <div v-if="loading">
    Loading channels...
  </div>

  <template v-else>
    <button
      v-for="channel of channels"
      :key="channel.id"
      class="block"
    >
      {{ channel.label }}
    </button>
  </template>
</template>
