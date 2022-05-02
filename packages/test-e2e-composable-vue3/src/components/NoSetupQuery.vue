<script lang="ts">
import { apolloClient } from '@/apollo'
import gql from 'graphql-tag'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { defineComponent, computed } from 'vue'

// Global query

const query = provideApolloClient(apolloClient)(() => useQuery(gql`
  query hello {
    hello
  }
`))
const hello = computed(() => query.result.value?.hello ?? '')

export default defineComponent({
  setup () {
    return {
      hello,
    }
  },
})
</script>

<template>
  <div class="no-setup-query">
    {{ hello }}
  </div>
</template>
