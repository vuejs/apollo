<script>
import gql from 'graphql-tag'

function query (errorPolicy) {
  return {
    query: gql`
      query partialError {
        good
        bad
      }
    `,
    errorPolicy,
    update: data => JSON.stringify(data),
    result (result) {
      console.log(errorPolicy, result)
    },
    error (error) {
      console.log(error)
      this.errors[errorPolicy] = error
    },
  }
}

export default {
  data () {
    return {
      errors: {},
    }
  },

  apollo: {
    all: query('all'),
    none: query('none'),
    ignore: query('ignore'),
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
      <div>errorPolicy: '{{ errorPolicy }}' => <span class="result">{{ $data[errorPolicy] }}</span></div>
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
