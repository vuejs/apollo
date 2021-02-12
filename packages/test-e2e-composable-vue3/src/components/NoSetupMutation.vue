<script lang="ts">
import { apolloClient } from '@/apollo'
import { gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useResult } from '@vue/apollo-composable'
import { defineComponent, ref } from 'vue'

// Global mutation

const greeting = ref('')
provideApolloClient(apolloClient)(() => {
  const { mutate } = useMutation(gql`
    mutation getPersonalizedHello ($name: String!) { 
        greeting: personalizedHello (name: $name)
    }
    `)
  mutate({ name: 'John' }).then(result => greeting.value = result.data.greeting)
},
)

export default defineComponent({
  setup () {
    return {
      greeting,
    }
  },
})
</script>

<template>
  <div class="no-setup-mutation">
    {{ greeting }}
  </div>
</template>
