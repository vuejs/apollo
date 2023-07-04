<script lang="ts">
import gql from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import { defineComponent, computed, ref } from 'vue'

export default defineComponent({
  setup () {
    const selectedId = ref<{ id: string } | null>(null)

    const nullableQuery = () => selectedId.value ? gql`
      query channel ($id: ID!) {
        channel (id: $id) {
          id
          label
          messages {
            id
          }
        }
      }
    ` : null

    const { result, loading } = useQuery(nullableQuery, () => ({
      // Should not throw since it will not be called if the query is disabled
      id: selectedId.value!.id,
    }), () => ({
      fetchPolicy: 'no-cache',
    }))
    const channel = computed(() => result.value?.channel)

    function load () {
      selectedId.value = { id: 'general' }
    }

    return {
      load,
      loading,
      channel,
    }
  },
})
</script>

<template>
  <div class="m-6">
    <div>
      <button
        class="bg-green-200 rounded-lg p-4"
        @click="load()"
      >
        Load channel
      </button>
    </div>

    <div
      v-if="loading"
      class="loading"
    >
      Loading...
    </div>

    <div
      v-if="channel"
      data-test-id="data"
    >
      <div>Loaded channel: {{ channel.label }}</div>
      <div>Messages: {{ channel.messages.length }}</div>
    </div>
  </div>
</template>
