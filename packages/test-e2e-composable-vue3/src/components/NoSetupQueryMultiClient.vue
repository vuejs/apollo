<script lang="ts">
import { apolloClient } from '@/apollo'
import gql from 'graphql-tag'
import { useQuery, useResult, provideApolloClients } from '@vue/apollo-composable'
import { defineComponent } from 'vue'

// Global query

const query = provideApolloClients({ myCustomClientId: apolloClient })(() =>
  useQuery(
    gql`
      query hello {
        hello
      }
    `,
    {},
    { clientId: 'myCustomClientId' },
  ),
)
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
