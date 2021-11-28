<script lang="ts" setup>
import gql from 'graphql-tag'
import { reactive } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { ErrorPolicy } from '@apollo/client/core'

const results = reactive({})
const errors = reactive({})
const errorPolicies: ErrorPolicy[] = ['all', 'none', 'ignore']

for (const errorPolicy of errorPolicies) {
  const query = useQuery(gql`
    query partialError {
      good
      bad
    }
  `, null, {
    errorPolicy,
  })
  query.onError(error => {
    console.log('Error', errorPolicy, error)
    errors[errorPolicy] = error
  })
  query.onResult(result => {
    console.log(errorPolicy, result)
  })
  results[errorPolicy] = query.result
}
</script>

<template>
  <div>
    <div
      v-for="errorPolicy of errorPolicies"
      :key="errorPolicy"
      :class="errorPolicy"
      class="p-6"
    >
      <div>errorPolicy: '{{ errorPolicy }}' => <span class="result">{{ results[errorPolicy] }}</span></div>
      <div
        v-if="errors[errorPolicy]"
        class="error text-red-500 bg-red-100 p-2 rounded"
      >
        {{ errors[errorPolicy] }}
      </div>
    </div>
  </div>
</template>
