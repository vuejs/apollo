<script>
import gql from 'graphql-tag'
import Vue from 'vue'
import { useQuery, useResult } from '@vue/apollo-composable'
import { reactive } from '@vue/composition-api'

function queryFactory (errorPolicy, errors) {
  const { result, onResult, onError } = useQuery(gql`
    query partialError {
      good
      bad
    }
  `, null, {
    errorPolicy,
  })

  onResult(result => {
    // console.log(errorPolicy, result)
  })

  onError(error => {
    // console.log(error)
    Vue.set(errors, errorPolicy, error)
  })

  return useResult(result, null, data => JSON.stringify(data))
}

export default {
  setup () {
    const errors = reactive({})

    return {
      errors,
      results: {
        all: queryFactory('all', errors),
        none: queryFactory('none', errors),
        ignore: queryFactory('ignore', errors),
      },
    }
  },
}
</script>

<template>
  <div>
    <div
      v-for="errorPolicy of ['all', 'none', 'ignore']"
      :key="errorPolicy"
      :class="errorPolicy"
      class="query"
    >
      <div>errorPolicy: '{{ errorPolicy }}' => <span class="result">{{ results[errorPolicy].value }}</span></div>
      <div
        v-if="errors[errorPolicy]"
        class="error"
      >
        {{ errors[errorPolicy] }}
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.query
  padding 24px
</style>
