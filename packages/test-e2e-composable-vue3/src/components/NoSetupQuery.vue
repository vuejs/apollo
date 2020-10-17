<script lang="ts">
import { apolloClient } from '@/apollo'
import { gql } from '@apollo/client/core'
import { provideApolloClient, useQuery, useResult } from '@vue/apollo-composable'
import { defineComponent } from 'vue'

// Global query

const query = provideApolloClient(apolloClient)(() => useQuery(gql`
  query hello {
    hello
  }
`))
const hello = useResult(query.result, [])

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
