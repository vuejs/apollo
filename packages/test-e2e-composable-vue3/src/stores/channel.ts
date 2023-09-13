import gql from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'

interface Channel {
  id: string
  label: string
}

export const useChannels = defineStore('channel', () => {
  const query = useQuery<{ channels: Channel[] }>(gql`
    query channels {
      channels {
        id
        label
      }
    }
  `)

  const channels = computed(() => query.result.value?.channels ?? [])

  watch(query.loading, value => {
    console.log('loading', value)
  }, {
    immediate: true,
  })

  return {
    loading: query.loading,
    channels,
  }
})
