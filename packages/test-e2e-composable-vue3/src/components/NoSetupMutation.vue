<script lang="ts">
import { apolloClient } from '@/apollo'
import { gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useResult } from '@vue/apollo-composable'
import { defineComponent } from 'vue'

// Global mutation

const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
  mutation getPersonalizedHello ($name: String!) { 
    greeting: personalizedHello (name: $name)
  }
`))

const matation = mutate({ name: 'John' })
const hello = useResult(matation.result, [])

export default defineComponent({
  setup () {
    return {
      hello,
    }
  },
})
</script>

<template>
  <div class="no-setup-mutation">
    {{ hello }}
  </div>
</template>
